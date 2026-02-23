import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../lib/DataContext';
import type { GMScenarioCard as GMScenarioCardType } from 'types/database';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import styles from './GMScenarioDetail.module.css';

export function GMScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { gmScenarios, loading } = useData();
  const [showImageModal, setShowImageModal] = useState(false);

  const scenario = useMemo<GMScenarioCardType | null>(() => {
    if (!id || loading.gmScenarios) return null;
    return gmScenarios.find((item: GMScenarioCardType) => item.id === id) ?? null;
  }, [gmScenarios, id, loading.gmScenarios]);

  if (loading.gmScenarios) {
    return (
      <main className="commonPage">
        <div className="commonContainer" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main className="commonPage">
        <div className="commonContainer" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <p>シナリオが見つかりませんでした。</p>
          <button 
            onClick={() => navigate('/scenario?tab=gm-ready')}
            className={styles.backButton}
          >
            GM可能シナリオ一覧に戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="commonPage">
      <section className="commonHero" style={{ paddingBottom: 0 }}>
        <div className="commonTitleRow">
          <span className="commonTitleIcon">✦</span>
          <h1 className="commonTitle">GM SCENARIO DETAIL</h1>
          <span className="commonTitleIcon">✦</span>
        </div>
      </section>

      <div className="commonContainer" style={{ paddingBottom: '40px' }}>
        <button 
          onClick={() => navigate('/scenario?tab=gm-ready')}
          className={styles.backButton}
        >
          ← 一覧に戻る
        </button>

        <div className={styles.detailCard}>
          {/* ヘッダー部分 */}
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <h2 className={styles.title}>{scenario.title}</h2>
              {scenario.category && (
                <ScenarioCategoryBadge
                  category={scenario.category}
                  className={styles.category}
                  iconClassName={styles.categoryIcon}
                  labelClassName={styles.categoryLabel}
                />
              )}
            </div>
          </div>

          {/* カード画像 */}
          <div className={styles.cardImage} onClick={() => scenario.cardImageUrl && setShowImageModal(true)}>
            {scenario.cardImageUrl ? (
              <img src={scenario.cardImageUrl} alt={scenario.title} />
            ) : (
              <div className={styles.imagePlaceholder}>No Image</div>
            )}
          </div>

          {/* カード内容 */}
          <div className={styles.cardContent}>
            <div className={styles.contentColumns}>
              {/* 左カラム */}
              <div className={styles.column}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>制作：</span>
                  <span className={styles.value}>{scenario.production || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>作者様：</span>
                  <span className={styles.value}>{scenario.creator || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>PL人数：</span>
                  <span className={styles.value}>{scenario.plPlayers || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>所要時間：</span>
                  <span className={styles.value}>{scenario.playTime || '-'}</span>
                </div>
              </div>
              
              {/* 右カラム */}
              <div className={styles.column}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>GM回数：</span>
                  <span className={styles.value}>{scenario.gmPlayCount !== undefined ? `${scenario.gmPlayCount}回` : '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>配信：</span>
                  <span className={styles.value}>{scenario.streamOkng === true ? '可' : scenario.streamOkng === false ? '否' : '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>販売ページ：</span>
                  {scenario.scenarioUrl ? (
                    <a 
                      href={scenario.scenarioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.link}
                    >
                      リンク
                    </a>
                  ) : (
                    <span className={styles.value}>-</span>
                  )}
                </div>
              </div>
            </div>

            {/* 備考欄 */}
            {scenario.notes && (
              <div className={styles.notesSection}>
                <span className={styles.label}>備考：</span>
                <p className={styles.notes}>{scenario.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      {showImageModal && scenario.cardImageUrl && (
        <div className={styles.imageModal} onClick={() => setShowImageModal(false)}>
          <img 
            src={scenario.cardImageUrl} 
            alt={scenario.title} 
            className={styles.imageModalContent}
          />
        </div>
      )}
    </main>
  );
}
