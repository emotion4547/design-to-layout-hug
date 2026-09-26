/**
 * Пререндер: сохраняем готовый HTML каждой страницы.
 *
 * Сайт рисуется в браузере, поэтому роботу приходил пустой документ — ни текста,
 * ни ссылок, ни заголовка H1. Google такие страницы дорисовывает с задержкой,
 * Яндекс заметно хуже, а внутренних ссылок не было вовсе, и обход сайта держался
 * на одной карте сайта.
 *
 * Здесь мы поднимаем dist на локальном порту, обходим все адреса настоящим
 * браузером и сохраняем то, что он отрисовал. Получается и содержимое, и
 * правильная мета — её проставляет сам сайт через components/SEO.tsx.
 *
 * Браузер работает на раннере GitHub, а не на боевом сервере: сборка идёт там.
 *
 * Если страница почему-то не отрисовалась, откатываемся на прежний способ —
 * подстановку мета-тегов в пустой index.html. Пустой HTML лучше не сохранять:
 * он затрёт работающую страницу.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { createServer } from 'node:http';
import puppeteer from 'puppeteer';
import { stripHtml, truncate } from '../src/lib/plainText.mjs';

const DIST = 'dist';
const BASE_URL = 'https://vezubuket23.ru';
const SITE_NAME = 'Везу букет';
const DEFAULT_DESCRIPTION =
  'Доставка свежих цветов и букетов в Новороссийске. Розы, авторские композиции, букеты в шляпных коробках. Доставка от 1 часа. Заказ онлайн и по телефону.';

/**
 * ⚠️ Дублирует то, что страницы передают в <SEO>. Нужно только как запасной
 * вариант, если браузер не справился. Меняете там — поправьте и здесь.
 */
const STATIC_ROUTES = [
  { url: '/', title: null, description: DEFAULT_DESCRIPTION, priority: '1.0' },
  { url: '/catalog', title: 'Каталог цветов и букетов', description: 'Букеты, композиции в коробках и цветочные корзины с доставкой по Новороссийску от 1 часа. Более 60 позиций, живые фото, оплата онлайн.', priority: '0.9' },
  { url: '/promotions', title: 'Акции и скидки', description: 'Действующие скидки на букеты и композиции в Новороссийске. Обновляем еженедельно — успевайте заказать по выгодной цене.', priority: '0.8' },
  { url: '/news', title: 'Новости и моменты', description: 'Новые коллекции, сезонные букеты и советы по уходу за цветами от магазина «Везу букет» в Новороссийске.', priority: '0.7' },
  { url: '/delivery', title: 'Доставка цветов', description: 'Доставка цветов по Новороссийску от 1 часа, в том числе анонимно и к назначенному времени. Условия, зоны и стоимость.', priority: '0.8' },
  { url: '/contacts', title: 'Контакты', description: 'Магазин «Везу букет»: Новороссийск, Куникова 47а. Телефон +7 (969) 660-40-40, доставка по городу ежедневно.', priority: '0.7' },
  { url: '/privacy', title: 'Политика конфиденциальности', description: 'Как магазин «Везу букет» обрабатывает и защищает персональные данные покупателей.', priority: '0.3' },
  { url: '/terms', title: 'Пользовательское соглашение', description: 'Условия использования сайта и оформления заказов в магазине «Везу букет».', priority: '0.3' },
  { url: '/return', title: 'Возврат товара', description: 'Условия возврата и обмена цветов, гарантия свежести и что делать при повреждении букета.', priority: '0.3' },
  { url: '/cart', title: 'Корзина', description: 'Ваша корзина покупок', noindex: true },
  { url: '/favorites', title: 'Избранное', description: 'Ваш список избранных товаров', noindex: true },
  { url: '/auth', title: 'Вход', description: 'Вход в личный кабинет', noindex: true },
];

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------------------------------------------------------------- данные

function env() {
  return Object.fromEntries(
    readFileSync('.env', 'utf-8').split('\n')
      .map((l) => l.match(/^(\w+)="?([^"]*)"?$/)).filter(Boolean)
      .map((m) => [m[1], m[2]])
  );
}

async function fromApi(path) {
  const e = env();
  const url = e.VITE_SUPABASE_URL, key = e.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`   ${path} -> ${res.status}, пропускаю`);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.warn(`   ${path} недоступен: ${e.message}`);
    return [];
  }
}

// ---------------------------------------------------------------- сервер

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

/** Поднимает dist на свободном порту: фиксированный занимался подвисшей сборкой. */
function serveDist() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = decodeURIComponent(req.url.split('?')[0]);
      // Как настоящий nginx: файл, потом index.html внутри каталога, потом корень.
      const candidates = [join(DIST, path), join(DIST, path, 'index.html'), join(DIST, 'index.html')];
      const file = candidates.find((p) => existsSync(p) && extname(p));
      if (!file) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ---------------------------------------------------------------- запасной путь

function renderHeadOnly(tpl, { url, title, description, image, noindex }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Доставка цветов и букетов`;
  const fullUrl = BASE_URL + url;
  const img = image || `${BASE_URL}/og-image.jpg`;
  let html = tpl.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`);

  const setMeta = (attr, key, value) => {
    const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
    const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
    html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
  };
  setMeta('name', 'description', truncate(description));
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  setMeta('property', 'og:url', fullUrl);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', truncate(description));
  setMeta('property', 'og:image', img);
  return html.replace('</head>', `    <link rel="canonical" href="${esc(fullUrl)}" />\n  </head>`);
}

/**
 * Встраивание @font-face в документ откатано.
 *
 * Идея была убрать блокирующий запрос в 210 мс, и запрос действительно ушёл.
 * Но замер показал обратный эффект: FCP вырос с 2,7 до 4,5 с. Объявления
 * шрифтов, найденные прямо в документе, заставляли браузер тянуть woff2
 * раньше и наперегонки с таблицей стилей, которая блокирует отрисовку.
 * Проверено отдельно: облегчение обложки со 130 до 35 КБ на FCP не повлияло
 * совсем — значит дело было именно в шрифтах.
 */
function write(url, html) {
  const path = url === '/' ? join(DIST, 'index.html') : join(DIST, url, 'index.html');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html, 'utf-8');
}

// ---------------------------------------------------------------- основной проход

const tpl = readFileSync(join(DIST, 'index.html'), 'utf-8');

// Запасная страница для адресов, которых нет. Раньше nginx отдавал на них
// index.html — то есть готовую разметку главной, и робот видел содержимое
// главной по десятку чужих адресов. Здесь та же оболочка приложения, но с
// пометкой noindex: человек попадёт на нужный экран, когда приложение
// запустится, а робот такой адрес в индекс не возьмёт.
const fallbackHtml = /<meta\s+name="robots"[^>]*>/i.test(tpl)
  // Заменяем, а не дописываем: две пометки robots в одном документе — это
  // указание, которое робот трактует на своё усмотрение.
  ? tpl.replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="noindex, follow" />')
  : tpl.replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>');
writeFileSync(join(DIST, 'fallback.html'), fallbackHtml, 'utf-8');

const [products, collections, news, promotions, categories] = await Promise.all([
  fromApi('products?select=id,name,description,price,image_url&in_stock=eq.true&limit=1000'),
  fromApi('collections?select=slug,name,description,collection_products(count)&limit=200'),
  fromApi('news?select=id,slug,title,excerpt&limit=200'),
  fromApi('promotions?select=id,slug,title,description&limit=200'),
  fromApi('categories?select=slug,name,description,is_active&limit=200'),
]);

// Если база недоступна в момент сборки, пререндер молча соберёт одни
// статические страницы, а выкладка затрёт карту сайта с 83 адресами на 9.
// Пустой каталог у работающего магазина — это сбой, а не нормальное состояние.
if (products.length === 0) {
  console.error('   ОШИБКА: не получено ни одного товара — база недоступна?');
  console.error('   Сборка остановлена, чтобы не выложить сайт без каталога.');
  process.exit(1);
}

const routes = [
  ...STATIC_ROUTES,
  ...products.map((p) => ({
    url: `/catalog/${p.id}`,
    title: p.name,
    description: p.description || `Купить ${p.name} с доставкой в Новороссийске. Цена: ${p.price} ₽`,
    image: p.image_url,
    priority: '0.7',
  })),
  // Пустые подборки отдаём как страницы, но в карту сайта не кладём и
  // закрываем от индексации: страница без товаров — это «тонкое содержимое»,
  // за которое поисковики понижают сайт целиком.
  ...collections.map((c) => {
    const count = c.collection_products?.[0]?.count ?? 0;
    return {
      url: `/collection/${c.slug}`,
      title: c.name,
      description: c.description || `${c.name}: подборка букетов с доставкой по Новороссийску от 1 часа.`,
      priority: '0.8',
      noindex: count === 0,
      empty: count === 0,
    };
  }),
  ...news.map((n) => ({
    url: `/news/${n.slug ?? n.id}`,
    title: n.title,
    description: n.excerpt || `${n.title} — новости магазина «Везу букет».`,
    priority: '0.5',
  })),
  // Страницы категорий: постоянные адреса под запросы вида
  // «купить букет в Новороссийске». Фильтр ?category= поиском не индексируется.
  ...categories
    .filter((c) => c.is_active !== false && c.slug)
    .map((c) => ({
      url: `/category/${c.slug}`,
      title: c.name,
      description:
        c.description ||
        `${c.name} с доставкой по Новороссийску от 1 часа. Живые фото, оплата онлайн, доставка в день заказа.`,
      priority: '0.9',
    })),
  ...promotions.map((p) => ({
    url: `/promotions/${p.slug ?? p.id}`,
    title: p.title,
    description: p.description || `${p.title} — акция магазина «Везу букет» в Новороссийске.`,
    priority: '0.6',
  })),
];

const server = await serveDist();
const PORT = server.address().port;
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let rendered = 0, fallback = 0;
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

for (const route of routes) {
  try {
    // Ждём загрузку документа, а не тишину в сети: на странице контактов
    // встроена карта, которая тянет запросы постоянно, и networkidle не наступает.
    await page.goto(`http://127.0.0.1:${PORT}${route.url}`, {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    // Ждём именно заголовок страницы: 200 символов текста набирает уже одна
    // шапка, и снимок получался до появления содержимого.
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        return !!h1 && (h1.innerText ?? '').trim().length > 0;
      },
      { timeout: 25000, polling: 'mutation' }
    );
    // Заголовок появляется раньше, чем подтянутся карточки товаров, поэтому
    // даём сети успокоиться. На странице контактов карта шумит постоянно —
    // там просто выходим по таймауту и снимаем что есть.
    await page.waitForNetworkIdle({ idleTime: 700, timeout: 8000 }).catch(() => {});

    const html = await page.content();

    // Пустую страницу не сохраняем: она затрёт рабочую.
    if (html.length < 4000 || !/<h1[\s>]/i.test(html)) throw new Error('пусто или нет H1');

    write(route.url, html);
    rendered++;
  } catch (err) {
    write(route.url, renderHeadOnly(tpl, route));
    fallback++;
    console.warn(`   ${route.url}: ${err.message} — сохранил только мету`);
  }
}

await browser.close();
server.close();

// ---------------------------------------------------------------- карта сайта

const indexable = routes.filter((r) => !r.noindex);
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((r) => `  <url>
    <loc>${esc(BASE_URL + r.url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${r.priority ?? '0.5'}</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap, 'utf-8');

console.log(`   пререндер: ${rendered} страниц отрисовано, ${fallback} только мета`);

// Одна-две страницы могут честно не иметь H1 (например, форма входа). Но если
// не отрисовалась заметная часть — значит приложение падает, и выкладывать
// такой результат нельзя: роботу снова достанется пустая страница.
// Ровно это случилось, когда хук отзывов встал после условного возврата.
const LIMIT = Math.max(3, Math.ceil(routes.length * 0.05));
if (fallback > LIMIT) {
  console.error(`   ОШИБКА: не отрисовано ${fallback} страниц при допустимых ${LIMIT}.`);
  console.error('   Похоже, приложение падает на этих адресах. Сборка остановлена.');
  process.exit(1);
}
console.log(`   товаров ${products.length}, категорий ${categories.length}, подборок ${collections.length}, новостей ${news.length}, акций ${promotions.length}`);
console.log(`   sitemap.xml: ${indexable.length} адресов`);

const emptyCollections = routes.filter((r) => r.empty).map((r) => r.url);
if (emptyCollections.length) {
  console.log(`   ⚠ подборки без товаров, скрыты от поиска: ${emptyCollections.join(', ')}`);
}
