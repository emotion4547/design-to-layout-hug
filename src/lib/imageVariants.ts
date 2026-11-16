/**
 * Облегчённые копии фотографий товаров — webp на 400 и 800 пикселей.
 *
 * Сайт показывает в каталоге и карточке именно их (см. productImage.ts):
 * исходный JPEG весит около 500 КБ, копия на 400 пикселей — десятки КБ.
 * Раньше копии делал разовый скрипт на сервере, а загрузка из админки и
 * импорт из Excel их не создавали. Товары, заведённые после прогона скрипта,
 * оставались только с исходником, и каталог на телефоне грузился медленно.
 *
 * Делаем копии здесь, в браузере администратора: картинка уже лежит в нашем
 * хранилище на том же домене, поэтому её можно прочитать без ограничений
 * CORS, уменьшить на canvas и положить рядом под предсказуемым именем.
 * Серверу для этого не нужно ни библиотек, ни доступа.
 */
import { supabase } from '@/integrations/supabase/client';
import { productImage } from '@/lib/productImage';

const BUCKET = 'images';
const STORAGE_MARK = `/storage/v1/object/public/${BUCKET}/`;
const WIDTHS = [400, 800] as const;
const QUALITY = 0.82;

/** Подходит ли адрес: наше хранилище и растровый формат, а не сама копия. */
export function canHaveVariants(url: string | null | undefined): url is string {
  return !!url && productImage(url, 400) !== url;
}

const storagePath = (publicUrl: string) => decodeURIComponent(publicUrl.split(STORAGE_MARK)[1] ?? '');

/** Есть ли уже обе копии. */
export async function hasVariants(url: string): Promise<boolean> {
  const checks = await Promise.all(
    WIDTHS.map(async (w) => {
      try {
        const res = await fetch(productImage(url, w), { method: 'HEAD', cache: 'no-store' });
        return res.ok;
      } catch {
        return false;
      }
    }),
  );
  return checks.every(Boolean);
}

function toWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('не удалось сжать картинку'));
        // Safari вместо webp молча отдаёт PNG. Сохранить его под именем .webp
        // значит получить «облегчённую» копию тяжелее исходника.
        if (blob.type !== 'image/webp') {
          return reject(new Error('этот браузер не умеет сохранять webp — откройте админку в Chrome или Яндекс Браузере'));
        }
        resolve(blob);
      },
      'image/webp',
      QUALITY,
    );
  });
}

/**
 * Создаёт копии на 400 и 800 пикселей для одной картинки.
 * Картинку уже, чем нужная ширина, не растягиваем: копия будет её размера.
 */
export async function makeVariants(url: string): Promise<void> {
  if (!canHaveVariants(url)) return;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`исходник не открылся: ${res.status}`);
  const bitmap = await createImageBitmap(await res.blob());

  try {
    for (const w of WIDTHS) {
      const width = Math.min(w, bitmap.width);
      const height = Math.round((bitmap.height * width) / bitmap.width);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas недоступен');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, width, height);

      const blob = await toWebp(canvas);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath(productImage(url, w)), blob, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });
      if (error) throw new Error(`не удалось сохранить копию: ${error.message}`);
    }
  } finally {
    bitmap.close();
  }
}

/** То же, но без исключений: для мест, где копия — приятное дополнение. */
export async function makeVariantsQuietly(url: string): Promise<boolean> {
  try {
    await makeVariants(url);
    return true;
  } catch (e) {
    console.warn('Облегчённые копии не созданы:', url, e);
    return false;
  }
}
