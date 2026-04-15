-- Drop unused fields after removing Obsidian sync and frontend usage
alter table public.schedules
  drop column if exists server;

alter table public.days_status
  drop column if exists work_off,
  drop column if exists will;

drop type if exists public.day_will;
