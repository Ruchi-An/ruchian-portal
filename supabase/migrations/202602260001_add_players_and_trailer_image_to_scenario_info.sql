begin;

alter table public.scenario_info
  add column if not exists players text,
  add column if not exists trailer_image text;

comment on column public.scenario_info.players is 'PL数（プレイヤー数）';
comment on column public.scenario_info.trailer_image is 'GM可能シナリオのサムネイル画像URL';

commit;
