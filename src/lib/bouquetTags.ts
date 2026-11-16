/**
 * Метки букета для фильтров каталога: какие цветы в составе, какой цвет,
 * сколько роз.
 *
 * Отдельных полей в базе под это нет, поэтому метки выводятся из названия и
 * описания. Описания из Tilda обычно содержат блок «Состав: • роза • гвоздика»,
 * и он надёжнее всего остального текста: в рекламной части встречаются фразы
 * вроде «отличный выбор вместо классических роз», которые иначе превратили бы
 * букет из гортензии в «розы».
 *
 * Регулярные выражения намеренно без \b и без просмотра назад: \b не работает
 * с кириллицей, а просмотр назад роняет весь скрипт в Safari старше 16.4.
 * Целые слова сравниваются поштучно после разбиения текста на слова.
 */

export interface TagOption {
  id: string;
  label: string;
  /** Цвет кружка в фильтре «Цвет». */
  swatch?: string;
}

interface Rule extends TagOption {
  /** Подстроки — достаточно вхождения в текст. */
  part?: RegExp;
  /** Целые слова — проверяется каждое слово отдельно. */
  word?: RegExp;
}

export const FLOWER_RULES: Rule[] = [
  { id: 'roses', label: 'Розы', word: /^роз(а|ы|у|е|ой|ам|ами|ах)?$/, part: /мондиаль/ },
  { id: 'chrysanthemums', label: 'Хризантемы', part: /хризантем/ },
  { id: 'carnations', label: 'Гвоздики', part: /гвоздик|диантус/ },
  { id: 'hydrangea', label: 'Гортензия', part: /гортенз/ },
  { id: 'daisies', label: 'Ромашки', part: /ромашк|матрикари/ },
  { id: 'eustoma', label: 'Эустома', part: /эустом|лизиантус/ },
  { id: 'lilies', label: 'Лилии', word: /^лили(я|и|й|ю|ями|ях)$/ },
  { id: 'sunflowers', label: 'Подсолнухи', part: /подсолну/ },
  { id: 'exotic', label: 'Необычные', part: /антуриум|орхиде|лотос|аллиум|протея|целози/ },
];

export const COLOR_RULES: Rule[] = [
  { id: 'red', label: 'Красные', swatch: '#c8323c', part: /красн|бордов|бургунди|винн/, word: /^ал(ый|ая|ое|ые|ых|ым|ой)$/ },
  { id: 'pink', label: 'Розовые', swatch: '#f0a3b8', part: /розов|малинов|ягодн|фукси|пудров/ },
  { id: 'white', label: 'Белые', swatch: '#ffffff', part: /белоснеж|ваниль|молочн|кремов/, word: /^бел(ый|ая|ое|ые|ых|ой|ую|ым|ыми)$/ },
  { id: 'peach', label: 'Персиковые', swatch: '#f4b08a', part: /персиков|коралл|карамел|терракот|абрикос/ },
  { id: 'yellow', label: 'Жёлтые', swatch: '#f2cc3d', part: /желт|солнечн|лимонн|оранж|подсолну/ },
  { id: 'blue', label: 'Синие и сиреневые', swatch: '#8b7fd6', part: /голуб|сирен|лилов|фиолет|лаванд/, word: /^син(ий|яя|ие|их|ими|ей)$/ },
  { id: 'green', label: 'Зелёные', swatch: '#a9cc6e', part: /фисташ|лаймов|бело-зелен/ },
];

export const ROSE_COUNT_OPTIONS: Array<TagOption & { min: number; max: number }> = [
  { id: 'up-to-11', label: 'До 11 роз', min: 1, max: 11 },
  { id: '15-25', label: '15–25 роз', min: 12, max: 25 },
  { id: '31-51', label: '31–51 роза', min: 26, max: 51 },
  { id: '101', label: '101 роза', min: 52, max: 1000 },
];

/**
 * Поправки для букетов, где правила ошибаются: «Солнечный» в названии при
 * розовых цветах в жёлтой упаковке, «Алый» о цвете упаковки, а не роз.
 * Ключ — id товара в базе.
 */
const COLOR_OVERRIDES: Record<string, string[]> = {
  '5e1fb68c-a02c-41ea-81f0-303a7e64e24f': ['pink', 'white'], // «Солнечный зефир»
  '84ba1ad7-a834-42c8-b0ae-58ecb16323b3': ['white'], // «Белые хризантемы» в голубой упаковке
  '501ea905-0621-4b57-9428-e44fc95d691b': ['pink'], // «Алый контраст» — розовые розы
};

/** Предложения с этими словами говорят о цветах, которых в букете нет. */
const NEGATION = /вместо|не классическ|без ярк|в отличие|альтернатив/;

const ENTITIES: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&laquo;': '«', '&raquo;': '»' };

function toPlain(html: string): string {
  return html
    // Переносы и пункты списка — границы предложений: иначе отрицание из
    // соседней строки «съест» весь состав.
    .replace(/<\s*(br|\/p|\/li|li)[^>]*>/gi, '. ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .toLowerCase()
    .replace(/ё/g, 'е');
}

const dropNegations = (text: string) =>
  text
    .split(/[.!?•\n]+/)
    .filter((s) => !NEGATION.test(s))
    .join('. ');

function matches(rule: Rule, text: string, words: string[]): boolean {
  if (rule.part && rule.part.test(text)) return true;
  if (rule.word) {
    const w = rule.word;
    return words.some((x) => w.test(x));
  }
  return false;
}

const splitWords = (text: string) => text.split(/[^а-яa-z0-9-]+/).filter(Boolean);

export interface BouquetTags {
  flowers: string[];
  colors: string[];
  /** Число роз из названия («Букет из 25 роз»), если оно там есть. */
  roseCount: number | null;
}

export function tagBouquet(p: { id: string; name: string; description?: string | null }): BouquetTags {
  const name = p.name.toLowerCase().replace(/ё/g, 'е');
  const text = toPlain(p.description ?? '');

  // Состав — от слова «состав» до следующего раздела описания.
  const at = text.indexOf('состав');
  const composition =
    at >= 0 ? text.slice(at + 6).split(/для каких|кому подойд|кому подар|почему|состав может/)[0] : null;
  const body = dropNegations(composition ?? text);

  const flowerText = `${name} . ${body}`;
  const flowerWords = splitWords(flowerText);
  const flowers = FLOWER_RULES.filter((r) => matches(r, flowerText, flowerWords)).map((r) => r.id);

  // Цвет берём из названия; если там его нет — из начала описания, где
  // цветы описываются, а не перечисляются поводы.
  let colors = COLOR_RULES.filter((r) => matches(r, name, splitWords(name))).map((r) => r.id);
  if (colors.length === 0) {
    const lead = dropNegations(text).slice(0, 250);
    colors = COLOR_RULES.filter((r) => matches(r, lead, splitWords(lead))).map((r) => r.id);
  }
  colors = COLOR_OVERRIDES[p.id] ?? colors;

  const m = name.match(/(\d{1,3})\s+(?:[а-я-]+\s+){0,3}роз/);
  const roseCount = m ? Number(m[1]) : null;

  return { flowers, colors, roseCount };
}

export const roseBucket = (count: number | null) =>
  count === null ? null : ROSE_COUNT_OPTIONS.find((o) => count >= o.min && count <= o.max)?.id ?? null;
