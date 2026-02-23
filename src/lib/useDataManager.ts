import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import type {
  ScheduleData,
  ScheduleBadge,
  PassedScenario,
  GMScenario,
  ScheduleDataRow,
  ScheduleBadgeRow,
  ScenarioInfo,
  ScenarioInfoRow,
} from '../types/database';
import {
  transformScheduleDataRow,
  transformScheduleBadgeRow,
  transformScenarioInfoRow,
  toPassedScenario,
  toGMScenario,
} from '../types/database';

export type { ScheduleData, ScheduleBadge, PassedScenario, GMScenario };
export type Event = ScheduleData;

type DataStore = {
  schedules: ScheduleData[];
  badges: ScheduleBadge[];
  passedScenarios: PassedScenario[];
  gmScenarios: GMScenario[];
};

type LoadingState = {
  schedules: boolean;
  badges: boolean;
  passedScenarios: boolean;
  gmScenarios: boolean;
};

type ErrorState = {
  schedules: Error | null;
  badges: Error | null;
  passedScenarios: Error | null;
  gmScenarios: Error | null;
};

export function useDataManager() {
  const [data, setData] = useState<DataStore>({
    schedules: [],
    badges: [],
    passedScenarios: [],
    gmScenarios: [],
  });

  const [loading, setLoading] = useState<LoadingState>({
    schedules: true,
    badges: true,
    passedScenarios: true,
    gmScenarios: true,
  });

  const [errors, setErrors] = useState<ErrorState>({
    schedules: null,
    badges: null,
    passedScenarios: null,
    gmScenarios: null,
  });

  const fetchAllData = useCallback(async () => {
    setLoading({
      schedules: true,
      badges: true,
      passedScenarios: true,
      gmScenarios: true,
    });
    setErrors({
      schedules: null,
      badges: null,
      passedScenarios: null,
      gmScenarios: null,
    });

    try {
      const [
        schedulesRes,
        badgesRes,
        gamesRes,
        scenarioInfoRes,
      ] = await Promise.all([
        supabase
          .from('schedules')
          .select('id, content_type, content_id, label, status, date, start_time, position, role, members, pc_name, gmst_name, server, is_stream, stream_url, endcard, memo')
          .order('date', { ascending: true, nullsFirst: false }),
        supabase
          .from('days_status')
          .select('id, date, work_off, stream_off, will, memo')
          .order('date', { ascending: true }),
        supabase
          .from('game_info')
          .select('id, title, official_url, genre, memo'),
        supabase
          .from('scenario_info')
          .select('id, title, official_url, genre, memo, game_system, production, creator, duration, possible_gm, possible_stream'),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (badgesRes.error) throw badgesRes.error;
      if (gamesRes.error) throw gamesRes.error;
      if (scenarioInfoRes.error) throw scenarioInfoRes.error;

      const gameMap = new Map<string, { title: string; official_url?: string | null; genre?: string | null }>();
      for (const g of gamesRes.data ?? []) {
        gameMap.set(g.id, {
          title: g.title,
          official_url: g.official_url,
          genre: g.genre,
        });
      }

      const scenarioInfos: ScenarioInfo[] = (scenarioInfoRes.data as ScenarioInfoRow[] | null)?.map((row) => transformScenarioInfoRow(row)) ?? [];
      const scenarioMap = new Map<string, ScenarioInfo>();
      for (const s of scenarioInfos) {
        scenarioMap.set(s.id, s);
      }

      const schedules: ScheduleData[] = ((schedulesRes.data as ScheduleDataRow[] | null) ?? []).map((row) => {
        const base = transformScheduleDataRow(row);

        if (row.content_type === 'real' || !row.content_id) {
          return {
            ...base,
            title: base.memo || base.title || 'タイトル未設定',
          };
        }

        if (row.content_type === 'game') {
          const game = gameMap.get(row.content_id);
          const title = game?.title ?? base.title;
          return {
            ...base,
            title,
            gameTitle: title,
            officialUrl: game?.official_url ?? null,
            genre: game?.genre ?? null,
            memo: row.memo ?? null,
          };
        }

        const scenario = scenarioMap.get(row.content_id);
        const title = scenario?.title ?? base.title;
        return {
          ...base,
          title,
          scenarioTitle: title,
          officialUrl: scenario?.officialUrl ?? null,
          genre: scenario?.genre ?? null,
          gameSystem: scenario?.gameSystem ?? null,
          url: row.stream_url ?? scenario?.officialUrl ?? null,
        };
      });

      const badges: ScheduleBadge[] = ((badgesRes.data as ScheduleBadgeRow[] | null) ?? []).map((row) => transformScheduleBadgeRow(row));

      const scenarioSchedules = schedules
        .filter((s) => s.contentType === 'scenario' && s.contentId)
        .filter((s) => s.status === 'planned' || s.status === 'done');

      const passedScenarios: PassedScenario[] = scenarioSchedules
        .map((schedule) => {
          if (!schedule.contentId) return null;
          const info = scenarioMap.get(schedule.contentId);
          if (!info) return null;
          return toPassedScenario(schedule, info);
        })
        .filter((item): item is PassedScenario => Boolean(item));

      const gmScenarios: GMScenario[] = scenarioInfos
        .filter((info) => info.possibleGm)
        .map((info) => toGMScenario(info));

      setData({ schedules, badges, passedScenarios, gmScenarios });
    } catch (error) {
      const err = error as Error;
      setErrors({
        schedules: err,
        badges: err,
        passedScenarios: err,
        gmScenarios: err,
      });
    } finally {
      setLoading({
        schedules: false,
        badges: false,
        passedScenarios: false,
        gmScenarios: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const isAllLoaded = !loading.schedules && !loading.badges && !loading.passedScenarios && !loading.gmScenarios;

  const getBadgesForDate = useCallback(
    (date: string) => {
      const badge = data.badges.find((b) => b.date === date);
      if (!badge) return { streamOff: false, workOff: false, tentative: false };
      return {
        streamOff: badge.streamOff ?? false,
        workOff: badge.workOff ?? false,
        tentative: badge.tentative ?? false,
      };
    },
    [data.badges],
  );

  return {
    schedules: data.schedules,
    badges: data.badges,
    passedScenarios: data.passedScenarios,
    gmScenarios: data.gmScenarios,
    loading,
    errors,
    isAllLoaded,
    getBadgesForDate,
    refetch: fetchAllData,
  };
}
