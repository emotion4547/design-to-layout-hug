/**
 * Облегчённые версии фотографий товаров.
 *
 * В хранилище рядом с каждым исходником лежат webp-варианты на 400 и 800
 * пикселей по ширине — их делает импорт и разовый скрипт пережатия.
 * Разница ощутимая: исходный JPEG 734 КБ, тот же кадр в 400 пикселей — 38 КБ.
 *
 * Варианты называются предсказуемо: <путь-без-расширения>-<ширина>.webp,
 * поэтому адрес выводится из исходного и отдельного поля в базе не нужно.
 */

const STORAGE_MARK = '/storage/v1/object/public/images/';
const WIDTHS = [400, 800] as const;

type Width = (typeof WIDTHS)[number];

/** Есть ли у этого адреса заготовленные варианты. */
function hasVariants(url: string | null | undefined): url is string {
  return (
    !!url &&
    url.includes(STORAGE_MARK) &&
    /\.(jpe?g|png|webp|avif)$/i.test(url) &&
    // Сам вариант повторно не переписываем.
    !/-\d{3,4}\.webp$/i.test(url)
  );
}

const variant = (url: string, w: Width) => `${url.replace(/\.[a-z]+$/i, '')}-${w}.webp`;

/** Адрес нужной ширины; для чужих картинок возвращает исходный. */
export function productImage(url: string | null | undefined, width: Width = 800): string {
  if (!hasVariants(url)) return url ?? '';
  return variant(url, width);
}

/**
 * Набор для srcset. Пусто для чужих адресов — тогда браузер возьмёт src,
 * и картинка не сломается.
 */
export function productSrcSet(url: string | null | undefined): string | undefined {
  if (!hasVariants(url)) return undefined;
  return WIDTHS.map((w) => `${variant(url, w)} ${w}w`).join(', ');
}
