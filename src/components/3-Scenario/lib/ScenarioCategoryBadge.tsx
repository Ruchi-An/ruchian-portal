import { Book, Shapes, type LucideIcon } from 'lucide-react';

type ScenarioCategory = 'all' | '📕' | '📗' | '📙' | string | null | undefined;

type CategoryMeta = {
  label: string;
  Icon: LucideIcon;
  color: string;
};

function getScenarioCategoryMeta(category: ScenarioCategory): CategoryMeta {
  if (category === '📕') return { label: 'マダミス', Icon: Book, color: '#ff6b6b' };
  if (category === '📗') return { label: 'ストプレ', Icon: Book, color: '#7abaff' };
  if (category === '📙') return { label: 'その他', Icon: Book, color: '#6ee7a8' };
  if (category === 'all') return { label: 'すべて', Icon: Shapes, color: 'currentColor' };
  return { label: '未分類', Icon: Shapes, color: 'currentColor' };
}

type ScenarioCategoryBadgeProps = {
  category: ScenarioCategory;
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

export function ScenarioCategoryBadge({
  category,
  showLabel = true,
  className,
  iconClassName,
  labelClassName,
}: ScenarioCategoryBadgeProps) {
  const { label, Icon, color } = getScenarioCategoryMeta(category);

  return (
    <span className={className} title={label} aria-label={label}>
      <Icon className={iconClassName} size={16} strokeWidth={2} aria-hidden="true" style={{ color }} />
      {showLabel && <span className={labelClassName}>{label}</span>}
    </span>
  );
}
