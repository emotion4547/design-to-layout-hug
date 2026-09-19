/**
 * Пререндер меты после сборки.
 *
 * Сайт рендерится на клиенте, поэтому робот, не исполняющий JS, видел у всех
 * адресов одинаковый <head> из index.html. Google JS исполняет, Яндекс — хуже
 * и с задержкой, а превью ссылок в мессенджерах не исполняют его вовсе.
 *
 * Скрипт кладёт рядом с index.html по файлу на каждый адрес
 * (dist/catalog/index.html и так далее) с уже проставленными title,
 * description, canonical, og и JSON-LD. Содержимое страницы по-прежнему
 * дорисовывает React — здесь только <head>.
 *
 * nginx отдаёт эти файлы сам: try_files $uri $uri/ /index.html.
 *
 * ⚠️ STATIC_ROUTES дублирует то, что страницы передают в <SEO>. Меняете там —
 * поправьте и здесь, иначе робот и человек увидят разные заголовки.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { stripHtml, truncate } from '../src/lib/plainText.mjs';

const DIST = 'dist';
const BASE_URL = 'https://vezubuket23.ru';
const SITE_NAME = 'Везу букет';
const DEFAULT_DESCRIPTION = 'Доставка свежих цветов и букетов в Новороссийске. Розы, авторские композиции, букеты в шляпных коробках. Доставка от 1 часа. Заказ онлайн и по телефону.';

const STATIC_ROUTES = [
  { url: '/', title: null, description: DEFAULT_DESCRIPTION },
  { url: '/catalog', title: 'Каталог цветов и букетов', description: 'Большой выбор букетов и цветочных композиций в Новороссийске. Авторские букеты, монобукеты, съедобные букеты, подарки. Быстрая доставка.' },
  { url: '/promotions', title: 'Акции и скидки', description: 'Актуальные акции и скидки на цветы и букеты в Новороссийске.' },
  { url: '/news', title: 'Новости и моменты', description: 'Новости магазина цветов Везу букет. Новые коллекции, полезные советы по уходу за цветами.' },
  { url: '/delivery', title: 'Доставка цветов', description: 'Условия доставки цветов и букетов в Новороссийске. Бесплатная доставка по городу.' },
  { url: '/contacts', title: 'Контакты', description: 'Контактная информация магазина Везу букет в Новороссийске. Телефон, адрес, режим работы.' },
  { url: '/privacy', title: 'Политика обработки персональных данных', description: 'Политика обработки персональных данных ИП Момонт Регина Валерьевна.' },
  { url: '/terms', title: 'Пользовательское соглашение', description: 'Условия использования сайта Везу букет.' },
  { url: '/return', title: 'Возврат товара', description: 'Условия возврата и обмена товаров в магазине Везу букет.' },
  // Корзина, избранное и вход — служебные, из индекса исключены в robots.txt.
  { url: '/cart', title: 'Корзина', description: 'Ваша корзина покупок в магазине Везу букет', noindex: true },
  { url: '/favorites', title: 'Избранное', description: 'Ваш список избранных товаров', noindex: true },
  { url: '/auth', title: 'Вход', description: 'Вход в личный кабинет', noindex: true },
];

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Достаёт опубликованные товары, чтобы у карточек были свои заголовки. */
async function fetchProducts() {
  const env = Object.fromEntries(
    readFileSync('.env', 'utf-8').split('\n')
      .map((l) => l.match(/^(\w+)="?([^"]*)"?$/)).filter(Boolean)
      .map((m) => [m[1], m[2]])
  );
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn('   нет ключей Supabase — карточки товаров пропускаю');
    return [];
  }
  const res = await fetch(
    `${url}/rest/v1/products?select=id,name,description,price,image_url&in_stock=eq.true&limit=1000`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!res.ok) {
    console.warn(`   Supabase ответил ${res.status} — карточки товаров пропускаю`);
    return [];
  }
  return res.json();
}

/** Подменяет в шаблоне то, что относится к конкретному адресу. */
function renderHead(tpl, { url, title, description, image, jsonLd, noindex }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Доставка цветов и букетов`;
  const fullUrl = BASE_URL + url;
  const img = image || `${BASE_URL}/og-image.jpg`;

  let html = tpl;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`);

  const setMeta = (attr, key, value) => {
    const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
    const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
    html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
  };

  setMeta('name', 'title', fullTitle);
  setMeta('name', 'description', description);
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  setMeta('property', 'og:url', fullUrl);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image', img);
  setMeta('name', 'twitter:url', fullUrl);
  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', img);

  html = html.replace('</head>',
    `    <link rel="canonical" href="${esc(fullUrl)}" />\n  </head>`);

  if (jsonLd) {
    html = html.replace('</head>',
      `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`);
  }
  return html;
}

function write(url, html) {
  const path = url === '/' ? join(DIST, 'index.html') : join(DIST, url, 'index.html');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html, 'utf-8');
}

const tpl = readFileSync(join(DIST, 'index.html'), 'utf-8');
let count = 0;

for (const r of STATIC_ROUTES) {
  write(r.url, renderHead(tpl, r));
  count++;
}

const products = await fetchProducts();
for (const p of products) {
  const image = p.image_url || undefined;
  write(`/catalog/${p.id}`, renderHead(tpl, {
    url: `/catalog/${p.id}`,
    title: p.name,
    // В мету уходит чистый текст: описания из Tilda размечены, и теги
    // попадали в выдачу поисковика вместе с описанием.
    description: truncate(p.description) || `Купить ${p.name} с доставкой в Новороссийске. Цена: ${p.price} ₽`,
    image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: stripHtml(p.description),
      image,
      url: `${BASE_URL}/catalog/${p.id}`,
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock',
      },
      brand: { '@type': 'Brand', name: SITE_NAME },
    },
  }));
  count++;
}

// Карта сайта собирается здесь же: все адреса уже известны, и статический
// файл надёжнее Supabase-функции — её ещё надо задеплоить и проксировать,
// а nginx на неизвестный путь отдавал бы index.html вместо XML.
const urls = [
  ...STATIC_ROUTES.filter((r) => !r.noindex).map((r) => ({ loc: BASE_URL + r.url, priority: r.url === '/' ? '1.0' : '0.8' })),
  ...products.map((p) => ({ loc: `${BASE_URL}/catalog/${p.id}`, priority: '0.6' })),
];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap, 'utf-8');

console.log(`   пререндер: ${count} адресов (${products.length} карточек товаров)`);
console.log(`   sitemap.xml: ${urls.length} адресов`);
