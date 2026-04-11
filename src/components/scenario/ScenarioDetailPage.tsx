import { useMemo, useState } from 'react';
import { BookOpenText, Video } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { PassedScenario } from 'types/database';
import { useData } from '../../lib/DataContext';
import { PageHero } from '../common/PageHero';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import styles from './GMScenarioDetailPage.module.css';

export function ScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { passedScenarios, loading } = useData();
  const [showImageModal, setShowImageModal] = useState(false);

  const scenario = useMemo<PassedScenario | null>(() => {
    if (!id || loading.passedScenarios) return null;
    return passedScenarios.find((item) => item.id === id) ?? null;
  }, [id, loading.passedScenarios, passedScenarios]);

  const backTarget = location.search ? `/scenario${location.search}` : '/scenario?tab=passed';
  const hasGmMembers = Boolean(scenario?.gmst?.length);
  const hasPlayerMembers = Boolean(scenario?.pl?.length);

  if (loading.passedScenarios) {
    return (
      <main className="commonPage">
        <div className="commonContainer" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <p>読み込み中...</p>
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
            type="button"
            onClick={() => navigate(backTarget)}
            className={styles.backButton}
          >
            シナリオ一覧に戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="commonPage">
      <PageHero title="しなりお詳細" />

      <div className="commonContainer" style={{ paddingBottom: '40px' }}>
        <button
          type="button"
          onClick={() => navigate(backTarget)}
          className={styles.backButton}
        >
          ← 一覧に戻る
        </button>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>{scenario.title}</h2>
              </div>
              <div className={styles.metaRow}>
                {scenario.type && (
                  <ScenarioCategoryBadge
                    category={scenario.type}
                    className={styles.category}
                    iconClassName={styles.categoryIcon}
                    labelClassName={styles.categoryLabel}
                  />
                )}

                <div className={styles.headerActions}>
                  {scenario.scenarioUrl ? (
                    <a
                      href={scenario.scenarioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.iconLinkButton}
                      aria-label="シナリオページを開く"
                      title="シナリオページ"
                    >
                      <BookOpenText size={17} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      className={`${styles.iconLinkButton} ${styles.iconLinkButtonDisabled}`}
                      aria-label="シナリオページ未設定"
                      title="シナリオページ未設定"
                    >
                      <BookOpenText size={17} aria-hidden="true" />
                    </span>
                  )}
                  {scenario.streamUrl ? (
                    <a
                      href={scenario.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.iconLinkButton}
                      aria-label="配信URLを開く"
                      title="配信URL"
                    >
                      <Video size={17} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      className={`${styles.iconLinkButton} ${styles.iconLinkButtonDisabled}`}
                      aria-label="配信URL未設定"
                      title="配信URL未設定"
                    >
                      <Video size={17} aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardImage} onClick={() => scenario.endcardImageUrl && setShowImageModal(true)}>
            {scenario.endcardImageUrl ? (
              <img src={scenario.endcardImageUrl} alt={scenario.title} />
            ) : (
              <div className={styles.imagePlaceholder}>画像なし</div>
            )}
          </div>

          <div className={styles.cardContent}>
            <div className={styles.contentColumns}>
              <div className={styles.column}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>通過日：</span>
                  <span className={styles.value}>{scenario.date || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>役割：</span>
                  <span className={styles.value}>{scenario.role || '-'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>PC：</span>
                  <span className={styles.value}>{scenario.pc || '-'}</span>
                </div>
              </div>

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
                  <span className={styles.label}>システム：</span>
                  <span className={styles.value}>{scenario.gameSystem || '-'}</span>
                </div>
              </div>
            </div>

            <div className={styles.column}>
              <div className={styles.infoItem}>
                <span className={styles.label}>GM/ST：</span>
                {hasGmMembers ? (
                  <div className={styles.tagList}>
                    {scenario.gmst?.map((member, index) => (
                      <span key={`${member}-${index}`} className={styles.memberTag}>
                        {member}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.value}>-</span>
                )}
              </div>

              <div className={`${styles.infoItem} ${styles.infoItemWide}`}>
                <span className={styles.label}>同卓PL：</span>
                {hasPlayerMembers ? (
                  <div className={styles.tagList}>
                    {scenario.pl?.map((member, index) => (
                      <span key={`${member}-${index}`} className={styles.memberTag}>
                        {member}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.value}>-</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showImageModal && scenario.endcardImageUrl && (
        <div className={styles.imageModal} onClick={() => setShowImageModal(false)}>
          <img
            src={scenario.endcardImageUrl}
            alt={scenario.title}
            className={styles.imageModalContent}
          />
        </div>
      )}
    </main>
  );
}
