/**
 * Забирает картинку по внешней ссылке и кладёт в наше хранилище.
 *
 * Нужна, потому что из браузера так сделать нельзя: чужой CDN не отдаёт
 * заголовки CORS, и fetch из админки падает. Поэтому качаем на сервере.
 *
 * Зачем вообще: товары приезжают из Tilda со ссылками на её CDN. Пока он жив,
 * всё работает, но при закрытии аккаунта картинки пропадут разом у всех
 * товаров. После переноса магазин ни от кого не зависит.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "images";
const MAX_BYTES = 15 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
  "image/avif": ".avif", "image/gif": ".gif",
};

/** Не даём использовать функцию как прокси во внутреннюю сеть. */
function assertPublicUrl(raw: string): URL {
  const u = new URL(raw);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("допустимы только http и https");
  }
  const h = u.hostname.toLowerCase();
  const isPrivate =
    h === "localhost" || h === "0.0.0.0" || h.endsWith(".local") ||
    /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h === "[::1]";
  if (isPrivate) throw new Error("внутренние адреса запрещены");
  return u;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Функция умеет скачивать произвольный адрес, поэтому пускаем только
    // администратора — иначе ею можно пользоваться как чужим загрузчиком.
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "нужна авторизация" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "недействительный токен" }, 401);

    const { data: role } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return json({ error: "нужны права администратора" }, 403);

    const { url, productId } = await req.json();
    if (!url || typeof url !== "string") return json({ error: "не передан url" }, 400);

    // Уже у нас — второй раз не качаем.
    if (url.includes(`/storage/v1/object/public/${BUCKET}/`)) return json({ url, skipped: true });

    const src = assertPublicUrl(url);
    const res = await fetch(src, { headers: { "User-Agent": "vezubuket-import" } });
    if (!res.ok) return json({ error: `источник ответил ${res.status}` }, 502);

    const ctype = (res.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
    if (!ctype.startsWith("image/")) return json({ error: `это не картинка: ${ctype}` }, 415);

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) return json({ error: "файл слишком большой" }, 413);

    // Имя от содержимого: повторная загрузка того же файла не плодит копии.
    const name = `products/${productId ?? "misc"}/${(await sha256(bytes)).slice(0, 20)}${EXT[ctype] ?? ".jpg"}`;

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(name, bytes, { contentType: ctype, upsert: true });
    if (upErr) return json({ error: `не удалось сохранить: ${upErr.message}` }, 500);

    return json({ url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${name}` });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
});
