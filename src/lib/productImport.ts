/**
 * Разбор таблицы товаров из Excel.
 *
 * Файлы приходят в разных видах: собственная выгрузка сайта (заголовки
 * по-русски) и выгрузка из Tilda (по-английски). Поэтому колонки ищем не по
 * точному имени, а по списку известных синонимов — так один и тот же импорт
 * принимает оба формата, и добавить третий стоит одной строки в ALIASES.
 */

export interface ImportedProduct {
  /** Заполнен, если в файле была колонка ID — тогда товар обновляется. */
  id?: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  /** Имя категории из файла; сопоставляется со справочником при импорте. */
  categoryName?: string;
  categoryId?: string;
  article: string | null;
  size: string | null;
  in_stock: boolean;
  image_url: string;
  images: string[];
}

export interface ParseResult {
  products: ImportedProduct[];
  /** Номера строк (как в Excel) и причина, по которой строка не принята. */
  skipped: Array<{ row: number; reason: string }>;
  /** Названия колонок, которые мы не узнали — просто для сведения. */
  unknownColumns: string[];
}

const ALIASES: Record<string, string[]> = {
  id: ['id', 'ид'],
  name: ['название', 'наименование', 'title', 'name'],
  description: ['описание', 'description', 'text'],
  price: ['цена', 'price'],
  old_price: ['старая цена', 'price old', 'old price'],
  categoryName: ['категория', 'category'],
  categoryId: ['id категории', 'category id'],
  article: ['артикул', 'sku', 'article'],
  size: ['размер', 'size'],
  in_stock: ['в наличии', 'quantity', 'in stock'],
  image_url: ['изображение', 'photo', 'image', 'картинка'],
  images: ['галерея', 'gallery', 'images'],
};

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Строит соответствие «поле -> имя колонки в файле».
 *
 * Синонимов у поля может оказаться несколько сразу: в выгрузке Tilda есть и
 * Description, и Text, причём заполнен только второй. Поэтому из подходящих
 * колонок берём ту, где больше непустых значений, а не первую попавшуюся.
 */
function buildMap(
  headers: string[],
  rows: Record<string, unknown>[]
): { map: Record<string, string>; unknown: string[] } {
  const map: Record<string, string> = {};
  const used = new Set<string>();

  const filled = (h: string) =>
    rows.reduce((n, r) => n + (r[h] !== undefined && r[h] !== null && r[h] !== '' ? 1 : 0), 0);

  for (const [field, aliases] of Object.entries(ALIASES)) {
    const candidates = headers.filter((h) => aliases.includes(norm(h)));
    if (candidates.length === 0) continue;
    const best = candidates.reduce((a, b) => (filled(b) > filled(a) ? b : a));
    map[field] = best;
    candidates.forEach((c) => used.add(c));
  }
  return { map, unknown: headers.filter((h) => h && !used.has(h)) };
}

/** "2 990,50" и "2990.00" одинаково превращаются в число. */
function toNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/[\s\u00a0]/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim());

/** Ссылки на картинки в одной ячейке разделяют по-разному. */
function splitUrls(v: unknown): string[] {
  return str(v)
    .split(/[\s,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * «В наличии» приходит и словом, и галочкой, и остатком из Tilda.
 * Пустое значение — не повод прятать товар, поэтому по умолчанию да.
 */
function toStock(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true;
  if (typeof v === 'boolean') return v;
  const n = toNumber(v);
  if (n !== null && /^[\d\s.,-]+$/.test(String(v))) return n > 0;
  return ['да', 'true', 'yes', '1', '+', 'есть'].includes(norm(String(v)));
}

export function parseProductRows(rows: Record<string, unknown>[]): ParseResult {
  const products: ImportedProduct[] = [];
  const skipped: ParseResult['skipped'] = [];

  if (rows.length === 0) return { products, skipped, unknownColumns: [] };

  // sheet_to_json отдаёт только непустые колонки, поэтому собираем ключи со всех строк.
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const { map, unknown } = buildMap(headers, rows);

  rows.forEach((row, i) => {
    const excelRow = i + 2; // +1 за заголовок, +1 потому что в Excel строки с единицы
    const get = (field: string) => (map[field] ? row[map[field]] : undefined);

    const name = str(get('name'));
    if (!name) {
      skipped.push({ row: excelRow, reason: 'нет названия' });
      return;
    }

    const price = toNumber(get('price'));
    if (price === null || price <= 0) {
      skipped.push({ row: excelRow, reason: 'нет цены' });
      return;
    }

    const description = str(get('description'));

    const gallery = splitUrls(get('images'));
    const photos = splitUrls(get('image_url'));

    products.push({
      id: str(get('id')) || undefined,
      name,
      description: description || null,
      price,
      old_price: toNumber(get('old_price')),
      categoryName: str(get('categoryName')) || undefined,
      categoryId: str(get('categoryId')) || undefined,
      article: str(get('article')) || null,
      size: str(get('size')) || null,
      in_stock: toStock(get('in_stock')),
      // Первая ссылка — главная картинка, остальные уходят в галерею.
      image_url: photos[0] ?? gallery[0] ?? '',
      images: [...photos.slice(1), ...gallery].filter((u) => u !== photos[0]),
    });
  });

  return { products, skipped, unknownColumns: unknown };
}
