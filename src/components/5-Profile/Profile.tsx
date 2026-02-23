// プロフィールページ用スタイルをインポート
import styles from "./Profile.module.css";

// プロフィールページ本体
export function ProfilePage() {
  return (
    <main className={styles.page}>
      {/* ヒーローセクション */}
      <section className={styles.hero}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}>✦</span>
          <h1 className={styles.title}>PROFILE</h1>
          <span className={styles.titleIcon}>✦</span>
        </div>
      </section>
      {/* プロフィール本文 */}
      <div className={styles.profileContent}>
        <p className={styles.profileMessage}>
          まだ未実装です！！！<br />
          あ、夕星るちあ（せきせいるちあ）といいます！！！<br />
          よろしくお願いします！！！
        </p>
      </div>
    </main>
  );
}
