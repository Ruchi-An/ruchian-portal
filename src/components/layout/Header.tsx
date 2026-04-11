import { BookOpenText, CalendarDays, House, type LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

type NavItem = {
  to: string;
  label: string;
  Icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'とっぷ', Icon: House },
  { to: '/schedule', label: 'すけじゅーる', Icon: CalendarDays },
  { to: '/scenario', label: 'しなりお', Icon: BookOpenText },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="メインメニュー">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            aria-label={label}
            title={label}
          >
            <Icon className={styles.navIcon} size={18} strokeWidth={2.3} aria-hidden="true" />
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
