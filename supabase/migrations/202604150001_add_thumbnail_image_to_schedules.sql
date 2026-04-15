-- Add thumbnail image column for event notes sync
alter table public.schedules
  add column if not exists thumbnail_image text;

comment on column public.schedules.thumbnail_image is 'イベントのサムネイル画像URL';
