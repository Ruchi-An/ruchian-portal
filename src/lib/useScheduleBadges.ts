import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export type BadgeType = 'stream-off' | 'work-off' | 'tentative';

export type BadgeData = {
  id: number;
  playDate: string;
  badgeType: BadgeType;
};

type DayStatusRow = {
  id: number;
  date: string;
  work_off: boolean | null;
  stream_off: boolean | null;
  will: boolean | null;
};

/**
 * スケジュール・バッジデータを取得するカスタムフック
 * @returns badges - バッジデータの配列, loading - 読み込み中フラグ, error - エラー情報, refetch - 再取得関数
 */
export function useScheduleBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('days_status')
        .select('id, date, work_off, stream_off, will')
        .order('date', { ascending: true });

      if (fetchError) {
        setError(fetchError);
      } else {
        const nextBadges = ((data ?? []) as DayStatusRow[]).flatMap((row) => {
          const rows: BadgeData[] = [];
          if (row.stream_off) rows.push({ id: row.id, playDate: row.date, badgeType: 'stream-off' });
          if (row.work_off) rows.push({ id: row.id, playDate: row.date, badgeType: 'work-off' });
          if (row.will) rows.push({ id: row.id, playDate: row.date, badgeType: 'tentative' });
          return rows;
        });
        setBadges(nextBadges);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Failed to fetch badges'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  /**
   * バッジを追加する
   */
  const addBadge = async (playDate: string, badgeType: BadgeType) => {
    try {
      const { data: existingRow, error: fetchError } = await supabase
        .from('days_status')
        .select('id, date, work_off, stream_off, will')
        .eq('date', playDate)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const nextRow = {
        date: playDate,
        work_off: existingRow?.work_off ?? false,
        stream_off: existingRow?.stream_off ?? false,
        will: existingRow?.will ?? false,
      };

      if (badgeType === 'stream-off') nextRow.stream_off = true;
      if (badgeType === 'work-off') nextRow.work_off = true;
      if (badgeType === 'tentative') nextRow.will = true;

      const { data: savedRow, error: saveError } = existingRow?.id
        ? await supabase.from('days_status').update(nextRow).eq('id', existingRow.id).select().single()
        : await supabase.from('days_status').insert([nextRow]).select().single();

      if (saveError) throw saveError;

      if (savedRow) {
        const nextBadges = badges.filter(b => b.playDate !== playDate);
        if (savedRow.stream_off) nextBadges.push({ id: savedRow.id, playDate: savedRow.date, badgeType: 'stream-off' });
        if (savedRow.work_off) nextBadges.push({ id: savedRow.id, playDate: savedRow.date, badgeType: 'work-off' });
        if (savedRow.will) nextBadges.push({ id: savedRow.id, playDate: savedRow.date, badgeType: 'tentative' });
        setBadges(nextBadges);
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err };
    }
  };

  /**
   * バッジを削除する
   */
  const removeBadge = async (playDate: string, badgeType: BadgeType) => {
    try {
      const { data: existingRow, error: fetchError } = await supabase
        .from('days_status')
        .select('id, date, work_off, stream_off, will')
        .eq('date', playDate)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!existingRow) return { success: true };

      const nextRow = {
        date: playDate,
        work_off: existingRow.work_off ?? false,
        stream_off: existingRow.stream_off ?? false,
        will: existingRow.will ?? false,
      };

      if (badgeType === 'stream-off') nextRow.stream_off = false;
      if (badgeType === 'work-off') nextRow.work_off = false;
      if (badgeType === 'tentative') nextRow.will = false;

      const { data: savedRow, error: saveError } = await supabase
        .from('days_status')
        .update(nextRow)
        .eq('id', existingRow.id)
        .select()
        .single();

      if (saveError) throw saveError;

      if (savedRow) {
        const nextBadges = badges.filter(b => b.playDate !== playDate);
        if (savedRow.stream_off) nextBadges.push({ id: savedRow.id, playDate: savedRow.date, badgeType: 'stream-off' });
        if (savedRow.work_off) nextBadges.push({ id: savedRow.id, playDate: savedRow.date, badgeType: 'work-off' });
        if (savedRow.will) nextBadges.push({ id: savedRow.id, playDate: savedRow.date, badgeType: 'tentative' });
        setBadges(nextBadges);
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err };
    }
  };

  /**
   * 指定された日付のバッジを取得
   */
  const getBadgesForDate = (playDate: string): BadgeType[] => {
    return badges
      .filter(b => b.playDate === playDate)
      .map(b => b.badgeType);
  };

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
    addBadge,
    removeBadge,
    getBadgesForDate,
  };
}
