/** Номер счётчика. Он же стоит в index.html, где Метрика инициализируется. */
export const YANDEX_METRIKA_ID = 108466036;

/**
 * Цели Метрики — шаги воронки покупки.
 *
 * Без них в отчётах видно только посещения, и непонятно, где теряются
 * покупатели: не доходят до карточки, не кладут в корзину или бросают
 * оформление. Имена целей нужно один раз завести в интерфейсе Метрики,
 * иначе она их примет, но не покажет в отчётах.
 */
export const GOALS = {
  /** Открыл карточку товара */
  viewProduct: 'view_product',
  /** Положил в корзину */
  addToCart: 'add_to_cart',
  /** Открыл корзину с товарами */
  viewCart: 'view_cart',
  /** Отправил заказ */
  purchase: 'purchase',
  /** Нажал на телефон */
  phoneClick: 'phone_click',
  /** Отправил отзыв */
  reviewSubmit: 'review_submit',
} as const;

export type GoalName = (typeof GOALS)[keyof typeof GOALS];

/**
 * Отправляет цель. Молчит, если счётчик не загрузился — блокировщик рекламы
 * не должен ронять оформление заказа.
 */
export function reachGoal(goal: GoalName, params?: Record<string, unknown>): void {
  try {
    window.ym?.(YANDEX_METRIKA_ID, 'reachGoal', goal, params);
  } catch {
    /* аналитика не повод ломать покупку */
  }
}
