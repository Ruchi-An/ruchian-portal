import { BookOpenText, Gamepad2, Globe, Shapes, type LucideIcon } from 'lucide-react';

type CategoryMeta = {
  label: string;
  Icon: LucideIcon;
};

function getScheduleCategoryMeta(category?: string | null): CategoryMeta {
  if (category === '🎮') return { label: 'ゲーム', Icon: Gamepad2 };
  if (category === '📚') return { label: 'シナリオ', Icon: BookOpenText };
  if (category === '🌏') return { label: 'リアル', Icon: Globe };
  return { label: '未分類', Icon: Shapes };
}

type ScheduleCategoryBadgeProps = {
  category?: string | null;
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

export function ScheduleCategoryBadge({
  category,
  showLabel = true,
  className,
  iconClassName,
  labelClassName,
}: ScheduleCategoryBadgeProps) {
  const { label, Icon } = getScheduleCategoryMeta(category);

  return (
    <span className={className} title={label} aria-label={label}>
      <Icon className={iconClassName} size={16} strokeWidth={2} aria-hidden="true" />
      {showLabel && <span className={labelClassName}>{label}</span>}
    </span>
  );
}
