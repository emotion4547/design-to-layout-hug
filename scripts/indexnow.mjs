/**
 * Сообщает поисковикам об изменившихся страницах сразу после выкладки.
 *
 * Без этого новый товар ждёт очередного обхода — от нескольких дней до недель.
 * IndexNow поддерживают Яндекс и Bing; Google к нему не подключён, там работает
 * обычный обход и карта сайта.
 *
 * Ключ лежит файлом в корне сайта — так поисковик убеждается, что адреса
 * присылает владелец домена, а не посторонний.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const HOST = 'vezubuket23.ru';
const ENDPOINT = 'https://yandex.com/indexnow';

// Ключ — единственный .txt в корне сборки, чьё имя совпадает с содержимым.
function findKey() {
  for (const f of readdirSync(DIST)) {
    if (!f.endsWith('.txt')) continue;
    const name = f.replace(/\.txt$/, '');
    try {
      if (readFileSync(join(DIST, f), 'utf-8').trim() === name) return name;
    } catch { /* пропускаем */ }
  }
  return null;
}

const key = findKey();
if (!key) {
  console.log('   IndexNow: ключ не найден в корне сборки, пропускаю');
  process.exit(0);
}

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf-8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urlList.length === 0) {
  console.log('   IndexNow: в карте сайта нет адресов, пропускаю');
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  }),
});

// Отправка — дело необязательное: неудача не должна ронять выкладку.
const ok = res.status === 200 || res.status === 202;
console.log(`   IndexNow: ${urlList.length} адресов -> HTTP ${res.status}${ok ? '' : ' (не критично)'}`);
if (!ok) console.log(`   ответ: ${(await res.text()).slice(0, 200)}`);
