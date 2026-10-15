-- Посадочные страницы под запросы покупателей строятся на подборках.
-- Подборка хранила только название и одно описание: оно же шло и в мета-описание
-- для поисковика, и в текст над товарами, а заголовок страницы совпадал с H1.
-- Для страницы под запрос этого мало: нужен отдельный заголовок для выдачи,
-- отдельное описание и текст внизу страницы, где отвечаем на вопросы покупателя.

alter table public.collections
  add column if not exists seo_title       text,
  add column if not exists seo_description text,
  add column if not exists seo_text        text;

comment on column public.collections.seo_title       is 'Заголовок страницы для поисковой выдачи (title). Пусто — берётся name.';
comment on column public.collections.seo_description  is 'Описание для поисковой выдачи (meta description), 140–160 знаков. Пусто — берётся description без разметки.';
comment on column public.collections.seo_text         is 'Текст внизу страницы подборки, HTML из разрешённых тегов: p, h2, h3, ul, ol, li, strong, em, a, blockquote.';
