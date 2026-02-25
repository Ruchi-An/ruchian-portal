import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck2, CalendarClock, ShieldCheck, Star } from 'lucide-react';
import type { PassedScenario as ScenarioCardType, GMScenario as GMScenarioCardType } from 'types/database';
import { ScenarioCard } from './ScenarioCard';
import { GMScenarioCard } from './GMScenarioCard';
import { TabBar, type TabItem } from '../common/TabBar';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import { useData } from '../../lib/DataContext';
import styles from './Scenario.module.css';

type TabType = 'planned' | 'passed' | 'gm-ready';
type CategoryType = 'all' | '📕' | '📗' | '📙';

const TABS: TabItem[] = [
  { key: 'planned', label: '通過予定', shortLabel: '通過予定', icon: CalendarClock },
  { key: 'passed', label: '通過済み', shortLabel: '通過済み', icon: CalendarCheck2 },
  { key: 'gm-ready', label: 'GM可能シナリオ', shortLabel: 'GM可能', icon: ShieldCheck },
];

const CATEGORY_TABS: Array<{ key: CategoryType; label: string }> = [
  { key: 'all', label: 'すべて' },
  { key: '📕', label: 'マダミス' },
  { key: '📗', label: 'ストプレ' },
  { key: '📙', label: 'その他' },
];

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

export function ScenarioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { passedScenarios, gmScenarios, loading } = useData();
  const [isNarrowScreen, setIsNarrowScreen] = useState(() => window.innerWidth < 600);

  useEffect(() => {
    const onResize = () => setIsNarrowScreen(window.innerWidth < 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const activeTab: TabType = (() => {
    const tab = params.get('tab');
    if (tab === 'gm-ready') return 'gm-ready';
    if (tab === 'planned') return 'planned';
    return 'passed';
  })();

  const activeCategory: CategoryType = (() => {
    const category = params.get('category');
    if (category === '📕' || category === '📗' || category === '📙') return category;
    return 'all';
  })();

  const setTab = (next: TabType) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('tab', next);
    navigate(`/scenario?${nextParams.toString()}`);
  };

  const setCategory = (next: CategoryType) => {
    const nextParams = new URLSearchParams(location.search);
    if (next === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', next);
    }
    navigate(`/scenario?${nextParams.toString()}`);
  };

  const filterScenarioCardsByCategory = (items: ScenarioCardType[]): ScenarioCardType[] => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.type === activeCategory);
  };

  const filterGmCardsByCategory = (items: GMScenarioCardType[]): GMScenarioCardType[] => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.type === activeCategory);
  };

  const plannedCards: ScenarioCardType[] = filterScenarioCardsByCategory(passedScenarios)
    .filter((item) => item.role === 'PL')
    .filter((item) => !isPastDateExcludingToday(item.date))
    .sort((a, b) => (a.date ?? '9999-99-99').localeCompare(b.date ?? '9999-99-99'));

  const passedCards: ScenarioCardType[] = filterScenarioCardsByCategory(passedScenarios)
    .filter((item) => item.role === 'PL')
    .filter((item) => isPastDateExcludingToday(item.date))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  const gmCards: GMScenarioCardType[] = filterGmCardsByCategory(gmScenarios)
    .sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  const visibleCards = activeTab === 'planned' ? plannedCards : passedCards;
  const isLoading = loading.passedScenarios || loading.gmScenarios;

  return (
    <main className="commonPage">
      <section className="commonHero" style={{ paddingBottom: 0 }}>
        <div className="commonTitleRow">
          <Star className="commonTitleIcon" size={28} strokeWidth={2} aria-hidden="true" />
          <h1 className="commonTitle">SCENARIO</h1>
          <Star className="commonTitleIcon" size={28} strokeWidth={2} aria-hidden="true" />
        </div>
      </section>

      <div className="commonContainer" style={{ paddingBottom: '40px' }}>
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={(key) => setTab(key as TabType)} isNarrowScreen={isNarrowScreen} />

        <div className="commonTabs" style={{ marginTop: '-0.5rem', paddingTop: '0.1rem' }}>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`commonTab ${activeCategory === tab.key ? 'active' : ''}`}
              onClick={() => setCategory(tab.key)}
            >
              <ScenarioCategoryBadge
                category={tab.key}
                showLabel={!isNarrowScreen || tab.key === 'all'}
                className={styles.categoryTabContent}
                iconClassName={styles.categoryTabIcon}
                labelClassName={styles.categoryTabLabel}
              />
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={styles.emptyMessage}>Loading...</div>
        ) : activeTab === 'gm-ready' ? (
          gmCards.length === 0 ? (
            <div className={styles.emptyMessage}>該当するGM可能シナリオはありません。</div>
          ) : (
            <div className={styles.cardGrid}>
              {gmCards.map((gmScenario) => (
                <GMScenarioCard key={gmScenario.id} card={gmScenario} />
              ))}
            </div>
          )
        ) : visibleCards.length === 0 ? (
          <div className={styles.emptyMessage}>
            {activeTab === 'planned' ? '通過予定シナリオはまだありません。' : '通過済みシナリオはまだありません。'}
          </div>
        ) : (
          <div className={styles.compactList}>
            {visibleCards.map((scenarioCard, index) => (
              <ScenarioCard
                key={scenarioCard.id}
                card={{ ...scenarioCard, displayPassNumber: index + 1 }}
                displayPassNumber={index + 1}
                showHeader={index === 0}
                onSortChange={() => undefined}
                currentSortField="pass-number"
                currentSortOrder="asc"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
