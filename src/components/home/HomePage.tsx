import { useState } from 'react';
import Footer from '../layout/Footer.tsx';
import styles from './HomePage.module.css';

const WEEKLY_SCHEDULE_IMAGE = '/weekly-schedule/current.png';
const FALLBACK_IMAGE = '/サムネ-準備中.png';

const SOCIAL_LINKS = [
  {
    href: 'https://gi-pt.com/main/wishlist/fan-view/3a20381c-018a-b68a-45e4-d4b8ddef04e1',
    label: '欲しいものリスト',
    modifierClass: 'socialButton--wishlist',
    ariaLabel: '欲しいものリストを新しいタブで開く',
  },
  {
    href: 'https://www.youtube.com/@RuChiAn_',
    label: 'YouTube',
    modifierClass: 'socialButton--youtube',
    ariaLabel: 'YouTubeを新しいタブで開く',
  },
  {
    href: 'https://twitter.com/RuChiAn_',
    label: 'X',
    modifierClass: 'socialButton--x',
    ariaLabel: 'Xを新しいタブで開く',
  },
] as const;

export default function HomePage() {
  const [imageSrc, setImageSrc] = useState(WEEKLY_SCHEDULE_IMAGE);

  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.heroImageWrap}>
          <img
            src={imageSrc}
            alt="今週の週間スケジュール"
            className={styles.topHeroImage}
            onError={() => {
              if (imageSrc !== FALLBACK_IMAGE) {
                setImageSrc(FALLBACK_IMAGE);
              }
            }}
          />
        </div>
      </section>

      <div className="homeGrid">
        <section className="floatingSection cardSection wishlistCard">
          <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>
            <p className="sectionDescription wishlistDescription">
              応援・フォローはこちら ♡
            </p>

            <div className="wishlistActionRow">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`detailButton socialButton ${link.modifierClass}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.ariaLabel}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
