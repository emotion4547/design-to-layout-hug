import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://butonvton.ru";
const SHOP_NAME = "Везу букет";
const COMPANY = "Везу букет";

function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // strip control chars not allowed in XML 1.0
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function absoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, is_active")
      .order("sort_order", { ascending: true });

    const { data: products } = await supabase
      .from("products")
      .select("id, name, description, price, image_url, images, category_id, article, in_stock")
      .eq("in_stock", true)
      .order("created_at", { ascending: false });

    const activeCategoryIds = new Set(
      (categories ?? []).filter((c) => c.is_active !== false).map((c) => c.id),
    );

    const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

    const categoriesXml = (categories ?? [])
      .map(
        (c) =>
          `      <category id="${escapeXml(c.id)}">${escapeXml(c.name)}</category>`,
      )
      .join("\n");

    const offersXml = (products ?? [])
      .filter((p) => p.category_id && activeCategoryIds.has(p.category_id))
      .map((p) => {
        const url = `${BASE_URL}/catalog/${p.id}`;
        const pics: string[] = [];
        if (p.image_url) pics.push(absoluteUrl(p.image_url));
        if (Array.isArray(p.images)) {
          for (const img of p.images) {
            const abs = absoluteUrl(img);
            if (abs && !pics.includes(abs)) pics.push(abs);
          }
        }
        const picturesXml = pics
          .slice(0, 10)
          .map((u) => `        <picture>${escapeXml(u)}</picture>`)
          .join("\n");

        const description = (p.description || p.name || "").slice(0, 3000);

        return [
          `      <offer id="${escapeXml(p.id)}" available="true">`,
          `        <url>${escapeXml(url)}</url>`,
          `        <price>${escapeXml(Math.round(Number(p.price) || 0))}</price>`,
          `        <currencyId>RUR</currencyId>`,
          `        <categoryId>${escapeXml(p.category_id)}</categoryId>`,
          picturesXml,
          `        <name>${escapeXml(p.name)}</name>`,
          `        <vendor>${escapeXml(COMPANY)}</vendor>`,
          p.article ? `        <vendorCode>${escapeXml(p.article)}</vendorCode>` : "",
          `        <description>${escapeXml(description)}</description>`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .map((o) => `${o}\n      </offer>`)
      .join("\n");

    const yml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${date}">
  <shop>
    <name>${escapeXml(SHOP_NAME)}</name>
    <company>${escapeXml(COMPANY)}</company>
    <url>${escapeXml(BASE_URL)}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>`;

    const url = new URL(req.url);
    const download = url.searchParams.get("download") === "1";

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    };
    if (download) {
      headers["Content-Disposition"] = `attachment; filename="yandex-feed.yml"`;
    }

    return new Response(yml, { headers });
  } catch (error) {
    console.error("Error generating YML:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate YML feed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});