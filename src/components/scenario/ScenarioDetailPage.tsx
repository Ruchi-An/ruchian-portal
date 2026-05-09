import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Link, Undo2, Video } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { PassedScenario } from 'types/database';
import { useData } from '../../lib/DataContext';
import { PageHero } from '../common/PageHero';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import styles from './GMScenarioDetailPage.module.css';

type TabType = 'planned' | 'passed' | 'gm-ready';
type CategoryType = 'all' | '📕' | '📗' | '📙';

function parseDateKey(date: string): Date | null {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

function isPastDateExcludingToday(date?: string | null): boolean {
  if (!date) return false;

  const parsed = parseDateKey(date);
  if (!parsed) return false;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return parsed.getTime() < todayStart.getTime();
}

function filterByCategory<T extends { type?: string | null }>(items: T[], category: CategoryType): T[] {
  if (category === 'all') return items;
  return items.filter((item) => item.type === category);
}

export function ScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { passedScenarios, loading } = useData();
  const [showImageModal, setShowImageModal] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const activeTab: TabType = (() => {
    const tab = params.get('tab');
    if (tab === 'gm-ready' || tab === 'planned' || tab === 'passed') return tab;
    return 'passed';
  })();
  const activeCategory: CategoryType = (() => {
    const category = params.get('category');
    if (category === '📕' || category === '📗' || category === '📙') return category;
    return 'all';
  })();

  const scenario = useMemo<PassedScenario | null>(() => {
    if (!id || loading.passedScenarios) return null;
    return passedScenarios.find((item) => item.id === id) ?? null;
  }, [id, loading.passedScenarios, passedScenarios]);

  const playerScenarios = useMemo(
    () => passedScenarios.filter((item) => item.role === 'PL'),
    [passedScenarios],
  );

  const plannedCards = useMemo(
    () => filterByCategory(playerScenarios, activeCategory)
      .filter((item) => !isPastDateExcludingToday(item.date))
      .sort((a, b) => (a.date ?? '9999-99-99').localeCompare(b.date ?? '9999-99-99')),
    [activeCategory, playerScenarios],
  );

  const passedCardsRaw = useMemo(
    () => filterByCategory(playerScenarios, activeCategory)
      .filter((item) => isPastDateExcludingToday(item.date))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [activeCategory, playerScenarios],
  );

  const passedCardsMergedMap = useMemo(() => {
    const map = new Map<string, PassedScenario[]>();
    passedCardsRaw.forEach((item) => {
      const list = map.get(item.title) ?? [];
      list.push(item);
      map.set(item.title, list);
    });
    return map;
  }, [passedCardsRaw]);

  const passedCards = useMemo(
    () => Array.from(passedCardsMergedMap.values()).map((group) => group[0]),
    [passedCardsMergedMap],
  );

  const visibleCards = activeTab === 'planned' ? plannedCards : passedCards;

  const currentIndex = useMemo(() => {
    if (!scenario) return -1;

    const indexById = visibleCards.findIndex((item) => item.id === scenario.id);
    if (indexById >= 0) return indexById;

    if (activeTab === 'passed') {
      return visibleCards.findIndex((item) => item.title === scenario.title);
    }

    return -1;
  }, [activeTab, scenario, visibleCards]);

  const previousScenario = currentIndex > 0 ? visibleCards[currentIndex - 1] : null;
  const nextScenario = currentIndex >= 0 && currentIndex < visibleCards.length - 1
    ? visibleCards[currentIndex + 1]
    : null;

  const passNumber = useMemo(() => {
    if (!scenario || currentIndex < 0) return null;

    if (activeTab === 'passed') {
      return String(visibleCards.length - currentIndex);
    }

    if (activeTab === 'planned') {
      return scenario.date ? String(passedCards.length + 1 + currentIndex) : '-';
    }

    return null;
  }, [activeTab, currentIndex, passedCards.length, scenario, visibleCards.length]);

  const displayTitle = passNumber ? `No.${passNumber}｜${scenario?.title ?? ''}` : (scenario?.title ?? '');
  const detailImageUrl = useMemo(() => {
    if (!scenario) return null;

    // 通過日で画像を切り替え
    if (scenario.date) {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const scenarioDate = parseDateKey(scenario.date);

      if (scenarioDate) {
        const isPastOrToday = scenarioDate.getTime() <= todayStart.getTime();

        if (isPastOrToday) {
          // 通過済み（今日以前）：エンドカードのみ
          return scenario.endcardImageUrl ?? null;
        } else {
          // 通過予定（今日より後）：サムネイルのみ
          return scenario.thumbnailImageUrl ?? null;
        }
      }
    }

    // 日付がない場合はサムネイル
    return scenario.thumbnailImageUrl ?? null;
  }, [scenario]);

  const backTarget = location.search ? `/scenario${location.search}` : '/scenario?tab=passed';
  const hasGmMembers = Boolean(scenario?.gmst?.length);
  const hasPlayerMembers = Boolean(scenario?.pl?.length);
  const moveToScenario = (target: PassedScenario | null) => {
    if (!target) return;
    navigate(`/scenario/detail/${encodeURIComponent(target.id)}${location.search}`);
  };

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
            <Undo2 size={18} aria-hidden="true" />
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
        <button type="button" onClick={() => navigate(backTarget)} className={styles.backButton}>
          <Undo2 size={18} aria-hidden="true" />
          一覧に戻る
        </button>

        <div className={styles.scenarioNavigationRow}>
          <button
            type="button"
            className={`${styles.scenarioNavButton} ${styles.scenarioNavButtonPrev} ${!previousScenario ? styles.scenarioNavButtonDisabled : ''}`}
            onClick={() => moveToScenario(previousScenario)}
            disabled={!previousScenario}
            aria-label="前のしなりお"
            title="前のしなりお"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            前のしなりお
          </button>
          <button
            type="button"
            className={`${styles.scenarioNavButton} ${styles.scenarioNavButtonNext} ${!nextScenario ? styles.scenarioNavButtonDisabled : ''}`}
            onClick={() => moveToScenario(nextScenario)}
            disabled={!nextScenario}
            aria-label="次のしなりお"
            title="次のしなりお"
          >
            次のしなりお
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>{displayTitle}</h2>
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
                      <Link size={17} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      className={`${styles.iconLinkButton} ${styles.iconLinkButtonDisabled}`}
                      aria-label="シナリオページ未設定"
                      title="シナリオページ未設定"
                    >
                      <Link size={17} aria-hidden="true" />
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

          {detailImageUrl && (
            <div className={styles.cardImage} onClick={() => setShowImageModal(true)}>
              <img src={detailImageUrl} alt={scenario.title} />
            </div>
          )}

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

            <div className={styles.sectionDivider} aria-hidden="true" />

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

      {showImageModal && detailImageUrl && (
        <div className={styles.imageModal} onClick={() => setShowImageModal(false)}>
          <img
            src={detailImageUrl}
            alt={scenario.title}
            className={styles.imageModalContent}
          />
        </div>
      )}
    </main>
  );
}
