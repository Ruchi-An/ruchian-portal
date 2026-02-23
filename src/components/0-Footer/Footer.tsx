// フッター用スタイルをインポート
import styles from './Footer.module.css';

// フッターコンポーネント本体
export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* フッターの内容 */}
      <div className={styles.content}>
        SekiseiRuchia PortalSite
      </div>
    </footer>
  );
}
