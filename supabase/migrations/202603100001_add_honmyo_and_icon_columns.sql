begin;

alter table public.game_info
  add column if not exists honmyo text,
  add column if not exists icon text;

alter table public.scenario_info
  add column if not exists honmyo text,
  add column if not exists icon text;

alter table public.schedules
  add column if not exists icon text;

comment on column public.game_info.honmyo is '本名・正式名';
comment on column public.game_info.icon is '表示用アイコン';
comment on column public.scenario_info.honmyo is '本名・正式名';
comment on column public.scenario_info.icon is '表示用アイコン';
comment on column public.schedules.icon is '表示用アイコン';

commit;
