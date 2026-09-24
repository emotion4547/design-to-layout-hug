/**
 * Маска российского номера для полей формы.
 *
 * В заявки приходили номера в десятке видов: «89996604040», «8 999 660 40 40»,
 * «+7(999)6604040». Менеджеру их приходилось разбирать глазами, а в amoCRM
 * один и тот же клиент заводился дважды, потому что записи не совпадали
 * посимвольно. Здесь любой ввод приводится к одному виду: +7 (999) 660-40-40.
 */

/** Оставляет только цифры и приводит к 11 знакам, начинающимся с 7. */
export function phoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  // Набрали через 8 — это та же семёрка.
  if (d.startsWith('8')) d = '7' + d.slice(1);
  // Начали сразу с кода оператора, без страны.
  else if (d.startsWith('9')) d = '7' + d;
  else if (d && !d.startsWith('7')) d = '7' + d;
  return d.slice(0, 11);
}

/** Показывает номер в привычном виде, достраивая по мере набора. */
export function formatRuPhone(raw: string): string {
  const d = phoneDigits(raw);
  if (!d) return '';
  const a = d.slice(1, 4);
  const b = d.slice(4, 7);
  const c = d.slice(7, 9);
  const e = d.slice(9, 11);
  let out = '+7';
  if (a) out += ` (${a}`;
  if (a.length === 3) out += ')';
  if (b) out += ` ${b}`;
  if (c) out += `-${c}`;
  if (e) out += `-${e}`;
  return out;
}

/** Номер заполнен полностью: код страны плюс десять знаков. */
export function isCompleteRuPhone(raw: string): boolean {
  return phoneDigits(raw).length === 11;
}
