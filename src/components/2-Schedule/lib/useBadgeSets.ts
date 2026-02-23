// src/components/2-Schedule/lib/useBadgeSets.ts
// ==================== バッジセット取得フック ====================

import type { ScheduleBadge } from 'types/database';

export function useBadgeSets(badges: ScheduleBadge[]) {
  const streamOffDays = new Set(badges.filter(b => b.streamOff).map(b => b.date));
  const workOffDays = new Set(badges.filter(b => b.workOff).map(b => b.date));
  const tentativeDays = new Set(badges.filter(b => b.will === 'tentative').map(b => b.date));
  return { streamOffDays, workOffDays, tentativeDays };
}