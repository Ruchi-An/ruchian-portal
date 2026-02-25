begin;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'schedules'
      and column_name = 'endcard'
  ) then
    alter table public.schedules rename column endcard to endcard_image;
  elsif not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'schedules'
      and column_name = 'endcard_image'
  ) then
    alter table public.schedules add column endcard_image text;
  end if;
end
$$;

comment on column public.schedules.endcard_image is 'エンドカード画像URL';

commit;
