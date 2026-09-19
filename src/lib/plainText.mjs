/**
 * Превращение размеченного описания в простой текст.
 *
 * Описания товаров приезжают из Tilda с разметкой: <br />, <strong>, списки.
 * На странице её надо показывать как оформление (см. richText.tsx), а вот в
 * мета-теги, og:description и JSON-LD должен уходить чистый текст — иначе
 * поисковик покажет в выдаче теги.
 *
 * Файл на .mjs намеренно: его импортирует и приложение, и scripts/prerender.mjs,
 * который выполняется обычным node без сборки.
 */

const ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&#39;': "'", '&apos;': "'", '&mdash;': '—', '&ndash;': '–',
};

/** Убирает разметку, оставляя читаемый текст без склеенных слов. */
export function stripHtml(html) {
  if (!html) return '';
  return String(html)
    // Блочные элементы и переносы визуально разделяют текст, поэтому меняем
    // их на пробел — иначе «...слов.<br />Белые розы» слипнется в «слов.Белые».
    // Важно учитывать и открывающие теги: «всем.<ul><li>первое» иначе даёт
    // «всем.первое».
    .replace(/<\s*\/?\s*(br|p|li|ul|ol|div|tr|td|h[1-6])(\s[^>]*)?\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Обрезает до длины, на которой поисковики перестают показывать текст,
 * не разрывая слово и не оставляя висящий знак препинания.
 */
export function truncate(text, limit = 160) {
  const t = stripHtml(text);
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:—–-]+$/, '') + '…';
}
