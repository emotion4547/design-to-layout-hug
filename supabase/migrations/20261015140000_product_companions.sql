-- Ряд «С этим покупают» на странице товара: десерты, игрушки, воздушные шары и прочее,
-- что берут вместе с букетом. Такие позиции заводятся как обычные товары, а этот флаг
-- включает их в ряд. Пока ни у одного товара флаг не стоит, ряд на сайте не показывается.
alter table public.products
  add column if not exists is_companion boolean not null default false;

comment on column public.products.is_companion is
  'Показывать товар в ряду «С этим покупают» на страницах других товаров';

create index if not exists products_is_companion_idx
  on public.products (created_at desc) where is_companion;

notify pgrst, 'reload schema';
