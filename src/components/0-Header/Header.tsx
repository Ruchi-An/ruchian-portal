// Reactのフック・ルーター・スタイルをインポート
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import styles from './Header.module.css';

// ヘッダーコンポーネント本体
export default function Header() {
  // メニュー開閉状態
  const [open, setOpen] = useState(false);

  // Escapeキーでメニューを閉じる
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // メニューの開閉トグル
  const toggleMenu = () => setOpen((v) => !v);
  // メニューを閉じる
  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header}>
      {/* ハンバーガーメニューボタン */}
      <button
        type="button"
        className={styles.menuButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="header-menu"
        onClick={toggleMenu}
      >
        <Menu className={styles.menuIcon} size={20} strokeWidth={2.2} aria-hidden="true" />
      </button>

      {/* ナビゲーションメニュー */}
      <nav
        id="header-menu"
        className={`${styles.nav} ${open ? styles.navOpen : styles.navClosed}`}
        role="menu"
      >
        <Link to="/" className={styles.navLink} onClick={closeMenu} role="menuitem">TOP</Link>
        <Link to="/schedule" className={styles.navLink} onClick={closeMenu} role="menuitem">SCHEDULE</Link>
        <Link to="/scenario" className={styles.navLink} onClick={closeMenu} role="menuitem">SCENARIO</Link>
      </nav>
    </header>
  );
}
