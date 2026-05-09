import { useState } from 'react';
import Footer from '../layout/Footer.tsx';
import styles from './HomePage.module.css';

const WEEKLY_SCHEDULE_IMAGE = '/weekly-schedule/current.png';
const FALLBACK_IMAGE = '/サムネ-準備中.png';
const CHARACTER_IMAGE = '/立ち絵-01.png';

const SOCIAL_LINKS = [
  {
    href: 'https://www.youtube.com/@RuChiAn_',
    label: 'ゆーちゅーぶ',
    icon: '▶',
    ariaLabel: 'YouTubeを新しいタブで開く',
    modifierClass: styles.btnYoutube,
  },
  {
    href: 'https://twitter.com/RuChiAn_',
    label: 'えっくす',
    icon: '𝕏',
    ariaLabel: 'Xを新しいタブで開く',
    modifierClass: styles.btnX,
  },
  {
    href: 'https://gi-pt.com/main/wishlist/fan-view/3a20381c-018a-b68a-45e4-d4b8ddef04e1',
    label: 'ほしいもの',
    icon: '♡',
    ariaLabel: '欲しいものリストを新しいタブで開く',
    modifierClass: styles.btnWishlist,
  },
] as const;

export default function HomePage() {
  const [scheduleSrc, setScheduleSrc] = useState(WEEKLY_SCHEDULE_IMAGE);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className={styles.hero} aria-label="ヒーローセクション">
        <div className={styles.heroInner}>

          {/* テキスト側 */}
          <div className={styles.heroContent}>
            <p className={styles.heroTagline}>
              <span className={styles.heroTaglineStar}>★</span>
              <span>インコを愛するゲーム配信者</span>
              <span className={styles.heroTaglineStar}>★</span>
            </p>
            <h1 className={styles.heroName}>夕星るちあ</h1>
            <p className={styles.heroSub}><br />楽しいと思うことをみんなと一緒に。<br />正体隠匿系からホラー系、シナリオ系などなど<br />幅広く遊んでいます！<br />チャンネル登録やいいね、うれしいです！<br />いつもありがとう！</p>
            <div className={styles.heroButtons}>
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`${styles.heroBtn} ${link.modifierClass}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.ariaLabel}
                >
                  <span className={styles.heroBtnIcon}>{link.icon}</span>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* キャラクター立ち絵 */}
          <div className={styles.heroCharWrap} aria-hidden="true">
            <img
              src={CHARACTER_IMAGE}
              alt=""
              className={styles.heroChar}
            />
          </div>
        </div>

        {/* 下スクロール誘導 */}
        <div className={styles.heroScroll} aria-hidden="true">
          <span className={styles.heroScrollArrow}>↓</span>
          <span className={styles.heroScrollText}>週間スケジュール</span>
        </div>
      </section>

      {/* ===== 週間スケジュール ===== */}
      <section className={styles.scheduleSection} aria-label="週間スケジュール">
        <div className={styles.scheduleSectionInner}>
          <h2 className={styles.scheduleSectionTitle}>今週のスケジュール</h2>
          <div className={styles.scheduleImageWrap}>
            <button
              type="button"
              className={styles.scheduleImageButton}
              onClick={() => setIsScheduleModalOpen(true)}
              aria-label="今週のスケジュール画像を拡大表示"
            >
              <img
                src={scheduleSrc}
                alt="今週の週間スケジュール"
                className={styles.scheduleImage}
                onError={() => {
                  if (scheduleSrc !== FALLBACK_IMAGE) {
                    setScheduleSrc(FALLBACK_IMAGE);
                  }
                }}
              />
            </button>
          </div>
        </div>
      </section>

      {isScheduleModalOpen && (
        <div
          className={styles.scheduleImageModal}
          onClick={() => setIsScheduleModalOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsScheduleModalOpen(false);
            }
          }}
          aria-label="拡大スケジュール画像を閉じる"
        >
          <img
            src={scheduleSrc}
            alt="今週の週間スケジュール（拡大）"
            className={styles.scheduleImageModalContent}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </>
  );
}
