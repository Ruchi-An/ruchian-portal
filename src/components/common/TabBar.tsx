import styles from './TabBar.module.css';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  key: string;
  label: string;
  shortLabel?: string;  // 画面幅が狭い時に使用
  icon?: LucideIcon;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'primary' | 'secondary';  // メインタブ or サブタブ
  spacing?: 'normal' | 'compact';      // 余白の設定
  isNarrowScreen?: boolean;             // 画面幅が600px未満かどうか
}

export function TabBar({ tabs, activeTab, onTabChange, variant = 'primary', spacing = 'normal', isNarrowScreen = false }: TabBarProps) {
  const containerClass = [
    styles.tabBar,
    variant === 'secondary' ? styles.secondary : '',
    spacing === 'compact' ? styles.compact : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className={styles.tabContent}>
            {tab.icon && <tab.icon className={styles.tabIcon} size={16} strokeWidth={2} aria-hidden="true" />}
            <span>{isNarrowScreen && tab.shortLabel ? tab.shortLabel : tab.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
