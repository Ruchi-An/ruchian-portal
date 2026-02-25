-- 夕星るちあポータル 初期スキーマ
-- 要件: schedules / scenario_sessions / game_info / scenario_info / days_status
-- 参照専用サイト向けにRLSを設定（anon/authはSELECTのみ）

begin;

create extension if not exists pgcrypto;

-- =====================================================
-- Enum types
-- =====================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_type') then
    create type public.content_type as enum ('game', 'scenario', 'real');
  end if;

  if not exists (select 1 from pg_type where typname = 'schedule_status') then
    create type public.schedule_status as enum ('pending', 'planned', 'done');
  end if;

  if not exists (select 1 from pg_type where typname = 'schedule_position') then
    create type public.schedule_position as enum ('solo', 'sponsor', 'joining');
  end if;

  if not exists (select 1 from pg_type where typname = 'schedule_role') then
    create type public.schedule_role as enum ('GM', 'ST', 'PL');
  end if;

  if not exists (select 1 from pg_type where typname = 'day_will') then
    create type public.day_will as enum ('free', 'tentative', 'blocked');
  end if;
end
$$;

-- =====================================================
-- Core tables
-- =====================================================
create table if not exists public.game_info (
  id uuid primary key,
  title text not null,
  official_url text,
  genre text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenario_info (
  id uuid primary key,
  title text not null,
  official_url text,
  genre text,
  memo text,
  players text,
  game_system text,
  production text,
  creator text,
  duration text,
  possible_gm boolean not null default false,
  possible_stream boolean not null default false,
  trailer_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key,
  content_type public.content_type not null,
  content_id uuid,
  status public.schedule_status not null,
  date date,
  start_time text,
  position public.schedule_position,
  role public.schedule_role,
  members text[] not null default '{}'::text[],
  pc_name text,
  gmst_name text,
  server text,
  stream_url text,
  endcard_image text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint schedules_status_date_ck check (
    (status = 'pending' and date is null)
    or
    (status in ('planned', 'done') and date is not null)
  ),
  constraint schedules_start_time_format_ck check (
    start_time is null
    or start_time ~ '^\\d{1,2}:\\d{2}$'
  ),
  constraint schedules_content_id_ck check (
    (content_type = 'real' and content_id is null)
    or
    (content_type in ('game', 'scenario') and content_id is not null)
  )
);

create table if not exists public.scenario_sessions (
  id uuid primary key,
  schedule_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint scenario_sessions_schedule_id_fk
    foreign key (schedule_id)
    references public.schedules(id)
    on delete cascade
);

create table if not exists public.days_status (
  id uuid primary key,
  date date not null unique,
  work_off boolean not null default false,
  stream_off boolean not null default false,
  will public.day_will not null default 'free',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- Triggers: updated_at
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_game_info on public.game_info;
create trigger set_updated_at_game_info
before update on public.game_info
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_scenario_info on public.scenario_info;
create trigger set_updated_at_scenario_info
before update on public.scenario_info
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_schedules on public.schedules;
create trigger set_updated_at_schedules
before update on public.schedules
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_scenario_sessions on public.scenario_sessions;
create trigger set_updated_at_scenario_sessions
before update on public.scenario_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_days_status on public.days_status;
create trigger set_updated_at_days_status
before update on public.days_status
for each row execute function public.set_updated_at();

-- =====================================================
-- Polymorphic FK guard for schedules.content_id
-- ※ content_type に応じて参照先を検証（実質FK）
-- =====================================================
create or replace function public.validate_schedule_content_ref()
returns trigger
language plpgsql
as $$
begin
  if new.content_type = 'game' then
    if not exists (select 1 from public.game_info g where g.id = new.content_id) then
      raise foreign_key_violation using message = 'schedules.content_id does not exist in game_info';
    end if;
  elsif new.content_type = 'scenario' then
    if not exists (select 1 from public.scenario_info s where s.id = new.content_id) then
      raise foreign_key_violation using message = 'schedules.content_id does not exist in scenario_info';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_schedule_content_ref_trg on public.schedules;
create trigger validate_schedule_content_ref_trg
before insert or update on public.schedules
for each row execute function public.validate_schedule_content_ref();

-- scenario_sessions は schedules.content_type='scenario' のみ許可
create or replace function public.validate_scenario_session_schedule()
returns trigger
language plpgsql
as $$
declare
  ct public.content_type;
begin
  select content_type into ct
  from public.schedules
  where id = new.schedule_id;

  if ct is distinct from 'scenario' then
    raise check_violation using message = 'scenario_sessions.schedule_id must reference scenario schedule';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_scenario_session_schedule_trg on public.scenario_sessions;
create trigger validate_scenario_session_schedule_trg
before insert or update on public.scenario_sessions
for each row execute function public.validate_scenario_session_schedule();

-- =====================================================
-- Indexes
-- =====================================================
create index if not exists schedules_status_date_idx
  on public.schedules(status, date);

create index if not exists schedules_date_idx
  on public.schedules(date);

create index if not exists schedules_content_type_status_date_idx
  on public.schedules(content_type, status, date);

create index if not exists schedules_content_id_idx
  on public.schedules(content_id);

create index if not exists days_status_date_idx
  on public.days_status(date);

create index if not exists scenario_info_possible_gm_idx
  on public.scenario_info(possible_gm)
  where possible_gm = true;

create index if not exists scenario_info_genre_game_system_idx
  on public.scenario_info(genre, game_system);

-- =====================================================
-- RLS (read-only public)
-- =====================================================
alter table public.game_info enable row level security;
alter table public.scenario_info enable row level security;
alter table public.schedules enable row level security;
alter table public.scenario_sessions enable row level security;
alter table public.days_status enable row level security;

-- 既存ポリシーを消して再作成（再実行時に安定）
drop policy if exists game_info_public_select on public.game_info;
drop policy if exists scenario_info_public_select on public.scenario_info;
drop policy if exists schedules_public_select on public.schedules;
drop policy if exists scenario_sessions_public_select on public.scenario_sessions;
drop policy if exists days_status_public_select on public.days_status;

create policy game_info_public_select
on public.game_info
for select
to anon, authenticated
using (true);

create policy scenario_info_public_select
on public.scenario_info
for select
to anon, authenticated
using (true);

create policy schedules_public_select
on public.schedules
for select
to anon, authenticated
using (true);

create policy scenario_sessions_public_select
on public.scenario_sessions
for select
to anon, authenticated
using (true);

create policy days_status_public_select
on public.days_status
for select
to anon, authenticated
using (true);

-- 明示的に anon/auth を読み取り専用に固定
revoke all on table
  public.game_info,
  public.scenario_info,
  public.schedules,
  public.scenario_sessions,
  public.days_status
from anon, authenticated;

grant select on table
  public.game_info,
  public.scenario_info,
  public.schedules,
  public.scenario_sessions,
  public.days_status
to anon, authenticated;

commit;

-- =====================================================
-- Verification queries (optional)
-- =====================================================
-- select * from public.schedules limit 1;
-- select * from public.scenario_info where possible_gm = true limit 10;
-- explain analyze select * from public.schedules where status='planned' order by date;
