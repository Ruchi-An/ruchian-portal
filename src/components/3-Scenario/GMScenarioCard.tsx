import { useNavigate } from 'react-router-dom';
import type { GMScenarioCard as GMScenarioCardType } from 'types/database';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import styles from './GMScenarioCard.module.css';

interface GMScenarioCardProps {
  card: GMScenarioCardType;
}

export function GMScenarioCard({ card }: GMScenarioCardProps) {
  const navigate = useNavigate();
  // cardImageUrlが文字列の場合は配列に変換、存在しない場合は空配列
  const images = Array.isArray(card.cardImageUrl)
    ? card.cardImageUrl
    : card.cardImageUrl
    ? [card.cardImageUrl]
    : [];
  const firstImage = images[0];

  const handleClick = () => {
    navigate(`/scenario/gm/${card.id}`);
  };

  const streamBadgeText = card.streamOkng === true ? '配信可' : card.streamOkng === false ? '配信不可' : null;

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.row}>
        <div className={styles.badgeCol}>
          {card.category && (
            <ScenarioCategoryBadge
              category={card.category}
              className={styles.badge}
              iconClassName={styles.badgeIcon}
              labelClassName={styles.badgeLabel}
            />
          )}
          {card.plPlayers && <span className={styles.badge}>{card.plPlayers}</span>}
          {streamBadgeText && <span className={styles.badge}>{streamBadgeText}</span>}
        </div>

        <div className={styles.titleCol}>
          <h3 className={styles.title}>{card.title}</h3>
          <span className={styles.gmCount}>GM/ST回数: {card.gmPlayCount ?? '-'}</span>
        </div>

        <div className={styles.thumb}>
          <div className={styles.cardImage}>
            {firstImage ? (
              <img src={firstImage} alt={card.title} />
            ) : (
              <div className={styles.imagePlaceholder}>No Image</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
