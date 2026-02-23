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
  endcard?: string | null;
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
  endcard?: string | null;
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
  game_system?: string | null;
  production?: string | null;
  creator?: string | null;
  duration?: string | null;
  possible_gm?: boolean | null;
  possible_stream?: boolean | null;
};

export type ScenarioInfo = {
  id: string;
  title: string;
  officialUrl?: string | null;
  genre?: string | null;
  memo?: string | null;
  gameSystem?: string | null;
  production?: string | null;
  creator?: string | null;
  duration?: string | null;
  possibleGm?: boolean;
  possibleStream?: boolean;
};

export type PassedScenario = {
  id: string;
  scheduleId: string;
  title: string;
  titleYomi?: string;
  date?: string | null;
  status: ScheduleStatus;
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
  endcardUrl?: string;
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

export type ScenarioCard = PassedScenario;
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
    endcard: row.endcard,
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
    gameSystem: row.game_system,
    production: row.production,
    creator: row.creator,
    duration: row.duration,
    possibleGm: Boolean(row.possible_gm),
    possibleStream: Boolean(row.possible_stream),
  };
}

export function scheduleDataToRow(data: Partial<ScheduleData>): Partial<ScheduleDataRow> {
  return {
    ...(data.id !== undefined && { id: data.id }),
    ...(data.contentType !== undefined && { content_type: data.contentType }),
    ...(data.contentId !== undefined && { content_id: data.contentId }),
    ...(data.label !== undefined && { label: data.label }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.date !== undefined && { date: data.date }),
    ...(data.startTime !== undefined && { start_time: data.startTime }),
    ...(data.position !== undefined && { position: data.position }),
    ...(data.role !== undefined && { role: data.role }),
    ...(data.members !== undefined && { members: data.members }),
    ...(data.pcName !== undefined && { pc_name: data.pcName }),
    ...(data.gmstName !== undefined && { gmst_name: data.gmstName }),
    ...(data.server !== undefined && { server: data.server }),
    ...(data.isStream !== undefined && { is_stream: data.isStream }),
    ...(data.streamUrl !== undefined && { stream_url: data.streamUrl }),
    ...(data.endcard !== undefined && { endcard: data.endcard }),
    ...(data.memo !== undefined && { memo: data.memo }),
  };
}

export function passedScenarioToRow(data: Partial<PassedScenario>): Partial<ScheduleDataRow> {
  return {
    ...(data.scheduleId !== undefined && { id: data.scheduleId }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.date !== undefined && { date: data.date }),
    ...(data.pc !== undefined && { pc_name: data.pc }),
    ...(data.gmst !== undefined && { gmst_name: data.gmst.join(', ') }),
    ...(data.pl !== undefined && { members: data.pl }),
    ...(data.streamUrl !== undefined && { stream_url: data.streamUrl }),
    ...(data.endcardUrl !== undefined && { endcard: data.endcardUrl }),
  };
}

export function gmScenarioToRow(data: Partial<GMScenario>): Partial<ScenarioInfoRow> {
  return {
    ...(data.id !== undefined && { id: data.id }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.scenarioUrl !== undefined && { official_url: data.scenarioUrl }),
    ...(data.genre !== undefined && { genre: data.genre }),
    ...(data.memo !== undefined && { memo: data.memo }),
    ...(data.gameSystem !== undefined && { game_system: data.gameSystem }),
    ...(data.production !== undefined && { production: data.production }),
    ...(data.creator !== undefined && { creator: data.creator }),
    ...(data.duration !== undefined && { duration: data.duration }),
    ...(data.possibleGm !== undefined && { possible_gm: data.possibleGm }),
    ...(data.possibleStream !== undefined && { possible_stream: data.possibleStream }),
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
    endcardUrl: schedule.endcard ?? undefined,
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
    playTime: info.duration ?? undefined,
    possibleStream: Boolean(info.possibleStream),
    streamOkng: info.possibleStream,
    memo: info.memo ?? undefined,
    notes: info.memo ?? undefined,
    cardImageUrl: undefined,
  };
}
