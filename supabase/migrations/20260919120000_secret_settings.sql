-- Закрываем секреты в site_settings от анонимного доступа.
--
-- Политика «читать всем» отдавала таблицу целиком, а в ней лежат токен
-- Telegram-бота и идентификатор чата. Анонимный ключ вшит в сборку сайта и
-- виден в браузере, поэтому токен мог забрать любой посетитель: читать заявки
-- клиентов, писать в рабочий чат и удалять сообщения.
--
-- Функции уведомлений ходят служебным ключом и RLS не касаются — для них
-- ничего не меняется. Админка читает те же ключи, но под входом.

create or replace function public.is_secret_setting(_key text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select _key = any (array[
           'telegram_bot_token',
           'telegram_chat_id',
           'amocrm_access_token',
           'amocrm_refresh_token',
           'amocrm_client_secret'
         ])
      -- Запас на будущее: новый секрет с таким именем закроется сам.
      or _key like '%\_token'
      or _key like '%\_secret'
      or _key like '%\_password'
      or _key like '%api\_key%';
$$;

drop policy if exists "Settings are viewable by everyone" on public.site_settings;

create policy "Public settings are viewable by everyone"
on public.site_settings
for select
using (
  not public.is_secret_setting(key)
  or public.has_role(auth.uid(), 'admin')
);
