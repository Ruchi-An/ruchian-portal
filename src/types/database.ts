export type ContentType = 'game' | 'scenario' | 'real';
export type ScheduleStatus = 'pending' | 'planned' | 'done';
export type DayWill = 'free' | 'tentative' | 'blocked';

export type ScheduleDataRow = {
  id: string;
  content_type: ContentType;
  content_id: string | null;
  label?: string | null;
  status: ScheduleStatus;
  date?: string | null;
  start_time?: string | null;
  position?: 'solo' | 'sponsor' | 'joining' | null;
  role?: 'GM' | 'ST' | 'PL' | null;
  members?: string[] | null;
  pc_name?: string | null;
  gmst_name?: string | null;
  server?: string | null;
  is_stream?: boolean | null;
  stream_url?: string | null;
  endcard_image?: string | null;
  memo?: string | null;
};

export type ScheduleData = {
  id: string;
  contentType: ContentType;
  contentId: string | null;
  label?: string | null;
  status: ScheduleStatus;
  date?: string | null;
  startTime?: string | null;
  position?: 'solo' | 'sponsor' | 'joining' | null;
  role?: 'GM' | 'ST' | 'PL' | null;
  members?: string[];
  pcName?: string | null;
  gmstName?: string | null;
  server?: string | null;
  isStream?: boolean | null;
  streamUrl?: string | null;
  endcardImage?: string | null;
  memo?: string | null;
  title: string;
  gameTitle?: string | null;
  scenarioTitle?: string | null;
  genre?: string | null;
  gameSystem?: string | null;
  officialUrl?: string | null;
  category?: string | null;
  type?: string | null;
  endTime?: string | null;
  url?: string | null;
};

export type ScheduleBadgeRow = {
  id: string;
  date: string;
  work_off?: boolean | null;
  stream_off?: boolean | null;
  will?: DayWill | null;
  memo?: string | null;
};

export type ScheduleBadge = {
  id: string;
  date: string;
  streamOff?: boolean | null;
  workOff?: boolean | null;
  tentative?: boolean | null;
  will?: DayWill | null;
  memo?: string | null;
};

export type ScenarioInfoRow = {
  id: string;
  title: string;
  official_url?: string | null;
  genre?: string | null;
  memo?: string | null;
  players?: string | null;
  game_system?: string | null;
  production?: string | null;
  creator?: string | null;
  duration?: string | null;
  possible_gm?: boolean | null;
  possible_stream?: boolean | null;
  trailer_image?: string | null;
};

export type ScenarioInfo = {
  id: string;
  title: string;
  officialUrl?: string | null;
  genre?: string | null;
  memo?: string | null;
  players?: string | null;
  gameSystem?: string | null;
  production?: string | null;
  creator?: string | null;
  duration?: string | null;
  possibleGm?: boolean;
  possibleStream?: boolean;
  trailerImage?: string | null;
};

export type PassedScenario = {
  id: string;
  scheduleId: string;
  title: string;
  titleYomi?: string;
  date?: string | null;
  status: ScheduleStatus;
  role?: 'GM' | 'ST' | 'PL' | null;
  type?: string;
  genre?: string;
  gameSystem?: string;
  production?: string;
  creator?: string;
  pc?: string;
  gmst?: string[];
  pl?: string[];
  scenarioUrl?: string;
  streamUrl?: string;
  endcardImageUrl?: string;
  displayPassNumber?: number;
};

export type GMScenario = {
  id: string;
  title: string;
  titleYomi?: string;
  type?: string;
  genre?: string;
  gameSystem?: string;
  production?: string;
  creator?: string;
  scenarioUrl?: string;
  possibleGm?: boolean;
  duration?: string;
  possibleStream?: boolean;
  memo?: string;
  category?: string;
  plPlayers?: string;
  playTime?: string;
  gmPlayCount?: number;
  streamOkng?: boolean;
  cardImageUrl?: string;
  notes?: string;
};

export type GMScenarioCard = GMScenario;

function getScenarioCategory(genre?: string | null, gameSystem?: string | null): string {
  const base = `${genre ?? ''} ${gameSystem ?? ''}`;
  if (/マダミス|マーダー|Murder/i.test(base)) return '📕';
  if (/ストプレ|ストーリープレイング/i.test(base)) return '📗';
  return '📙';
}

export function transformScheduleDataRow(row: ScheduleDataRow): ScheduleData {
  const title = row.memo?.trim() || 'タイトル未設定';
  return {
    id: row.id,
    contentType: row.content_type,
    contentId: row.content_id,
    label: row.label,
    status: row.status,
    date: row.status === 'pending' ? null : row.date,
    startTime: row.start_time,
    position: row.position,
    role: row.role,
    members: row.members ?? [],
    pcName: row.pc_name,
    gmstName: row.gmst_name,
    server: row.server,
    isStream: row.is_stream ?? false,
    streamUrl: row.stream_url,
    endcardImage: row.endcard_image,
    memo: row.memo,
    title,
    category: row.content_type === 'scenario' ? '📚' : '🎮',
    type: row.role ?? (row.content_type === 'scenario' ? 'SCENARIO' : 'GAME'),
    endTime: null,
    url: row.stream_url ?? null,
  };
}

export function transformScheduleBadgeRow(row: ScheduleBadgeRow): ScheduleBadge {
  const will = row.will ?? 'free';
  return {
    id: row.id,
    date: row.date,
    streamOff: row.stream_off,
    workOff: row.work_off,
    tentative: will === 'tentative',
    will,
    memo: row.memo,
  };
}

export function transformScenarioInfoRow(row: ScenarioInfoRow): ScenarioInfo {
  return {
    id: row.id,
    title: row.title,
    officialUrl: row.official_url,
    genre: row.genre,
    memo: row.memo,
    players: row.players,
    gameSystem: row.game_system,
    production: row.production,
    creator: row.creator,
    duration: row.duration,
    possibleGm: Boolean(row.possible_gm),
    possibleStream: Boolean(row.possible_stream),
    trailerImage: row.trailer_image,
  };
}

export function toPassedScenario(schedule: ScheduleData, scenario: ScenarioInfo): PassedScenario {
  const gmst = schedule.gmstName
    ? schedule.gmstName.split(/[,\u3001\uFF0C/／\n]+/).map((v) => v.trim()).filter(Boolean)
    : [];

  return {
    id: `${schedule.id}:${scenario.id}`,
    scheduleId: schedule.id,
    title: scenario.title,
    date: schedule.date,
    status: schedule.status,
    role: schedule.role,
    type: getScenarioCategory(scenario.genre, scenario.gameSystem),
    genre: scenario.genre ?? undefined,
    gameSystem: scenario.gameSystem ?? undefined,
    production: scenario.production ?? undefined,
    creator: scenario.creator ?? undefined,
    pc: schedule.pcName ?? undefined,
    gmst,
    pl: schedule.members ?? [],
    scenarioUrl: scenario.officialUrl ?? undefined,
    streamUrl: schedule.streamUrl ?? undefined,
    endcardImageUrl: schedule.endcardImage ?? undefined,
  };
}

export function toGMScenario(info: ScenarioInfo): GMScenario {
  const category = getScenarioCategory(info.genre, info.gameSystem);
  return {
    id: info.id,
    title: info.title,
    type: category,
    category,
    genre: info.genre ?? undefined,
    gameSystem: info.gameSystem ?? undefined,
    production: info.production ?? undefined,
    creator: info.creator ?? undefined,
    scenarioUrl: info.officialUrl ?? undefined,
    possibleGm: Boolean(info.possibleGm),
    duration: info.duration ?? undefined,
    plPlayers: info.players ?? undefined,
    playTime: info.duration ?? undefined,
    possibleStream: Boolean(info.possibleStream),
    streamOkng: info.possibleStream,
    memo: info.memo ?? undefined,
    notes: info.memo ?? undefined,
    cardImageUrl: info.trailerImage ?? undefined,
  };
}
