// src/components/2-Schedule/lib/tabDefs.ts
// スケジュールページ・管理ページ共通のタブ定義
// ==================== タブ定義 ====================
import { CalendarDays, Clock3, History, Shapes, Gamepad2, BookOpenText } from 'lucide-react';

// 表示モードタブ定義
export const VIEW_MODE_TABS = [
  { key: "past", label: "リスト -過去-", shortLabel: "-過去-", icon: History },
  { key: "calendar", label: "カレンダー", shortLabel: "カレンダー", icon: CalendarDays },
  { key: "future", label: "リスト -未来-", shortLabel: "-未来-", icon: Clock3 },
];

// カテゴリフィルタータブ定義
export const CATEGORY_TABS = [
  { key: "all", label: "すべて", shortLabel: "すべて", icon: Shapes },
  { key: "🎮", label: "ゲーム", shortLabel: "ゲーム", icon: Gamepad2 },
  { key: "📚", label: "シナリオ", shortLabel: "シナリオ", icon: BookOpenText },
];