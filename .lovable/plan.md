
# Полная SEO-упаковка сайта

## Найденные проблемы

### 1. КРИТИЧНО: Заглушки вместо реальных данных в SEO.tsx
В файле `SEO.tsx` используются placeholder-значения:
- `BASE_URL = 'https://example.com'` -- вместо `https://butonvton.ru`
- `SITE_NAME = 'Ваше название'` -- вместо `Бутон в тон`
- `DEFAULT_DESCRIPTION` -- текст про воздушные шары, а не про цветы

Это значит, что ВСЕ страницы сайта генерируют некорректные canonical URL, Open Graph и Twitter карточки, ведущие на `example.com`.

### 2. КРИТИЧНО: Заглушки в index.html
- Canonical URL: `https://example.com/`
- Все OG/Twitter URL: `https://example.com/`
- Телефон в структурированных данных: `+7 (XXX) XXX-XX-XX`
- Адрес: `"addressLocality": "Ваш город"` -- вместо "Новороссийск"
- `"streetAddress": ""` -- пустая строка

### 3. Отсутствует og-image.jpg
В `public/` нет файла `og-image.jpg`, на который ссылаются все метатеги OG/Twitter. При шеринге ссылки в соцсетях и мессенджерах будет показана пустая картинка.

### 4. Страница 404 без SEO и PageLayout
`NotFound.tsx` не использует `<SEO noindex />` и не обёрнута в `PageLayout`. Поисковики могут индексировать 404-страницы.

### 5. Страницы без noindex, которые должны его иметь
- `Cart.tsx` -- корзина индексируется (`noindex` не стоит), хотя в `robots.txt` закрыта
- `Auth.tsx` -- нужно проверить

### 6. Дубликат данных между index.html и SEO.tsx
`index.html` содержит статические метатеги, а `react-helmet-async` перезаписывает их динамически. Это работает, но данные в `index.html` показываются краулерам, которые не выполняют JavaScript (VK, Telegram, некоторые боты). Поэтому данные в `index.html` должны быть корректными.

---

## План исправлений

### Шаг 1. Исправить SEO.tsx -- базовые константы
- `BASE_URL` = `https://butonvton.ru`
- `SITE_NAME` = `Бутон в тон`
- `DEFAULT_DESCRIPTION` = актуальное описание про цветы и букеты
- Исправить fallback title

### Шаг 2. Исправить index.html
- Заменить все `https://example.com` на `https://butonvton.ru`
- Обновить телефон, адрес, город в структурированных данных
- Обновить описание и заголовок, если нужно

### Шаг 3. Создать og-image.jpg
- Сгенерировать OG-картинку (1200x630px) с логотипом и названием магазина
- Поместить в `public/og-image.jpg`

### Шаг 4. Исправить NotFound.tsx
- Обернуть в `PageLayout`
- Добавить `<SEO title="Страница не найдена" noindex />`
- Перевести текст на русский

### Шаг 5. Добавить noindex на служебные страницы
- `Cart.tsx` -- добавить `noindex` в `<SEO>`
- `Auth.tsx` -- добавить `noindex`

### Шаг 6. Обновить описание главной страницы
В `Index.tsx` описание и keywords всё ещё про воздушные шары -- заменить на цветы.

### Шаг 7. Добавить alt-тексты к изображениям
Проверить и добавить осмысленные alt-тексты ко всем `<img>` на ключевых страницах (новости, коллекции, акции).

---

## Технические детали

### Файлы, которые будут изменены:

| Файл | Изменение |
|------|-----------|
| `src/components/SEO.tsx` | BASE_URL, SITE_NAME, DEFAULT_DESCRIPTION |
| `index.html` | Все URL, телефон, адрес, город в Schema.org |
| `src/pages/Index.tsx` | Description и keywords про цветы |
| `src/pages/NotFound.tsx` | PageLayout + SEO noindex + русский текст |
| `src/pages/Cart.tsx` | Добавить noindex |
| `src/pages/Auth.tsx` | Добавить noindex (если нет) |

### Новые файлы:
- `public/og-image.jpg` -- OG-картинка для соцсетей (будет сгенерирована)
