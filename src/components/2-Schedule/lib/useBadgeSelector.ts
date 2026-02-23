// src/components/2-Schedule/lib/useBadgeSelector.ts
// ==============================================
// useBadgeSelector.ts - バッジ選択UIの状態管理フック
// ================================================

// ==================== バッジ選択UIの状態管理フック ====================
import { useState } from "react";

// バッジ選択UIの状態型定義
export type BadgeSelectorState = {
  dateKey: string;
  pos: { x: number; y: number };
} | null;

// バッジ選択UIの状態管理フック
export function useBadgeSelector() {
  const [badgeSelector, setBadgeSelector] = useState<BadgeSelectorState>(null);

  const openBadgeSelector = (dateKey: string, pos: { x: number; y: number }) => {
    setBadgeSelector({ dateKey, pos });
  };

  const closeBadgeSelector = () => setBadgeSelector(null);

  return { badgeSelector, openBadgeSelector, closeBadgeSelector };
}
