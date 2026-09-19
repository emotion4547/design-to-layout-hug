-- Отзывы о товарах.
--
-- До сих пор их не было вовсе: ни таблицы, ни оценок. Из-за этого в разметке
-- товара отсутствовал рейтинг, и в поиске карточки показывались без звёзд —
-- в отличие от конкурентов. Для цветов, которые покупают на эмоции и в спешке,
-- это прямая потеря доверия.

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  author_name text not null,
  rating      smallint not null check (rating between 1 and 5),
  text        text,
  images      text[] default '{}',
  -- Отзыв появляется на сайте только после проверки: иначе первая же
  -- рекламная рассылка окажется на карточке товара.
  is_published boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reviews_product_published_idx
  on public.reviews (product_id, is_published, created_at desc);

alter table public.reviews enable row level security;

-- Читают все, но только проверенные. Администратор видит и непроверенные.
create policy "Published reviews are viewable by everyone"
  on public.reviews for select
  using (is_published or public.has_role(auth.uid(), 'admin'));

-- Оставить отзыв может любой покупатель, без регистрации.
-- Опубликовать сам себя не может: поле is_published закрыто проверкой ниже.
create policy "Anyone can submit a review"
  on public.reviews for insert
  with check (is_published = false);

create policy "Admins can update reviews"
  on public.reviews for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete reviews"
  on public.reviews for delete
  using (public.has_role(auth.uid(), 'admin'));

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.update_updated_at_column();

-- Средняя оценка и количество — одним запросом, чтобы карточка товара
-- не считала это на клиенте по всему списку.
create or replace view public.product_ratings as
  select product_id,
         round(avg(rating)::numeric, 1) as rating_avg,
         count(*)                       as rating_count
    from public.reviews
   where is_published and product_id is not null
   group by product_id;
