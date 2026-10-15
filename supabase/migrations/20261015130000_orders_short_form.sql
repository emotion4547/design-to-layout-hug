-- Короткая заявка: покупатель оставляет только имя и телефон, а адрес, дату и
-- время доставки менеджер уточняет по телефону. Поэтому эти два поля больше не
-- обязательны: иначе каждая заявка без адреса отвергалась бы базой.
-- Существующие заказы не меняются.

alter table public.orders
  alter column delivery_address drop not null,
  alter column delivery_date    drop not null;

comment on column public.orders.delivery_address is 'Адрес доставки. Пусто в короткой заявке — менеджер уточняет по телефону.';
comment on column public.orders.delivery_date    is 'Дата доставки. Пусто в короткой заявке — менеджер уточняет по телефону.';
