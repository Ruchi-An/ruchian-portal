import type { BadgeType } from "../../../lib/useScheduleBadges";

interface UseBadgeActionsProps {
  badgeSelector: { dateKey: string } | null;
  openBadgeSelector: (dateKey: string, pos: { x: number; y: number }) => void;
  closeBadgeSelector: () => void;
  getBadgesForDate: (dateKey: string) => BadgeType[];
  addBadge: (dateKey: string, type: BadgeType) => Promise<{ success: boolean }>;
  removeBadge: (dateKey: string, type: BadgeType) => Promise<{ success: boolean }>;
}

export function useBadgeActions({ badgeSelector, openBadgeSelector, closeBadgeSelector, getBadgesForDate, addBadge, removeBadge }: UseBadgeActionsProps) {
  // 日付セル右クリック（バッジ選択UI表示）
  const handleCellRightClick = (dateKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    openBadgeSelector(dateKey, { x: e.clientX, y: e.clientY });
  };

  // バッジ選択UIでバッジを選択・トグル
  const handleBadgeSelect = async (type: BadgeType) => {
    if (!badgeSelector) return;
    const dateKey = badgeSelector.dateKey;
    try {
      const existingBadges = getBadgesForDate(dateKey);
      if (existingBadges.includes(type)) {
        const result = await removeBadge(dateKey, type);
        if (!result.success) alert('バッジの削除に失敗しました');
      } else {
        const result = await addBadge(dateKey, type);
        if (!result.success) alert('バッジの追加に失敗しました');
      }
    } catch {
      alert('エラーが発生しました');
    }
    closeBadgeSelector();
  };

  return {
    handleCellRightClick,
    handleBadgeSelect,
  };
}
