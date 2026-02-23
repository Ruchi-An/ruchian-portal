// src/components/2-Schedule/lib/useGameNames.ts
// ==================== ゲーム名リスト抽出用カスタムフック ====================
import { useMemo } from "react";

export function useGameNames(schedules: { gameName?: string | null }[]) {
  return useMemo(() => {
    return Array.from(new Set(
      schedules.map(s => s.gameName).filter((name): name is string => !!name)
    )).sort();
  }, [schedules]);
}
