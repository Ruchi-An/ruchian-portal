// 小鳥遊ページ用スタイルをインポート
import styles from "./Takanashi.module.css";

// 小鳥遊ページ本体
export function TakanashiPage() {
  return (
    <main className={styles.page}>
      {/* ヒーローセクション */}
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>TAKANASHI</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>
      {/* 本文 */}
      <div className={styles.takanashiContent}>
        <p className={styles.takanashiMessage}>
          まだ未実装です！！<br />
          小鳥遊村に関することを載せたい思い！！！
        </p>
      </div>
    </main>
  );
}
