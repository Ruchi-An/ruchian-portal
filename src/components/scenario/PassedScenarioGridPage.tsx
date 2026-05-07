import { useMemo, type KeyboardEvent } from 'react';
import { CalendarCheck2, CalendarClock, LayoutGrid, ShieldCheck, Undo2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { GMScenario, PassedScenario } from 'types/database';
import { useData } from '../../lib/DataContext';
import { useIsNarrowScreen } from '../../lib/useIsNarrowScreen';
import { PageHero } from '../common/PageHero';
import { TabBar, type TabItem } from '../common/TabBar';
import tabBarStyles from '../common/TabBar.module.css';
import { DataTableList, type ColumnDef } from '../common/DataTableList';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import styles from './PassedScenarioGridPage.module.css';
import gmCardStyles from './GMScenarioCard.module.css';
import listStyles from '../common/DataTableList.module.css';
import calendarStyles from '../schedule/css/ScheduleCalendar.module.css';

type TabType = 'planned' | 'passed' | 'gm-ready';
type CategoryType = 'all' | '📕' | '📗' | '📙';

interface GMScenarioCardProps {
  card: GMScenario;
}

const TABS: TabItem[] = [
  { key: 'planned', label: '通過予定', shortLabel: '通過予定', icon: CalendarClock },
  { key: 'passed', label: '通過済み', shortLabel: '通過済み', icon: CalendarCheck2 },
  { key: 'gm-ready', label: 'GM可能', shortLabel: 'GM可能', icon: ShieldCheck },
];

const CATEGORY_TABS: Array<{ key: CategoryType; label: string }> = [
  { key: 'all', label: 'すべて' },
  { key: '📕', label: 'まだみす' },
  { key: '📗', label: 'すとぷれ' },
  { key: '📙', label: 'そのた' },
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

function filterByCategory<T extends { type?: string | null }>(items: T[], category: CategoryType): T[] {
  if (category === 'all') return items;
  return items.filter((item) => item.type === category);
}

function toggleWithKeyboard(event: KeyboardEvent<HTMLElement>, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

function formatDateWithWeekday(date?: string | null): ReactNode {
  if (!date) return '未定';
  const dateValue = new Date(`${date}T00:00:00`);
  const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(dateValue);

  return (
    <span className={listStyles.dateLabel}>
      {date}（{weekday}）
    </span>
  );
}

function formatScenarioTitle(title?: string | null): string {
  const safeTitle = title?.trim();
  return safeTitle ? `『${safeTitle}』` : '-';
}

function formatMultipleDates(dates: string[]): ReactNode {
  if (dates.length <= 1) {
    return formatDateWithWeekday(dates[0]);
  }

  const formatDate = (date: string) => {
    const dateObj = new Date(`${date}T00:00:00`);
    const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(dateObj);
    return `${date}（${weekday}）`;
  };

  const latest = dates[0];
  const earliest = dates[dates.length - 1];

  return (
    <span className={listStyles.dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span>{formatDate(earliest)}</span>
      <span>{formatDate(latest)}</span>
    </span>
  );
}

function GMScenarioCard({ card }: GMScenarioCardProps) {
  const navigate = useNavigate();
  const images = Array.isArray(card.cardImageUrl)
    ? card.cardImageUrl
    : card.cardImageUrl
      ? [card.cardImageUrl]
      : [];
  const firstImage = images[0];

  const openDetail = () => {
    navigate(`/scenario/gm/${card.id}`);
  };

  return (
    <div
      className={gmCardStyles.card}
      onClick={openDetail}
      onKeyDown={(event) => toggleWithKeyboard(event, openDetail)}
      role="button"
      tabIndex={0}
    >
      <div className={gmCardStyles.cardImage}>
        {firstImage ? (
          <img src={firstImage} alt={card.title} />
        ) : (
          <div className={gmCardStyles.imagePlaceholder}>画像なし</div>
        )}
      </div>

      <div className={gmCardStyles.cardContent}>
        <div className={gmCardStyles.badgesContainer}>
          {card.category && (
            <ScenarioCategoryBadge
              category={card.category}
              className={gmCardStyles.badge}
              iconClassName={gmCardStyles.badgeIcon}
              labelClassName={gmCardStyles.badgeLabel}
            />
          )}
          {card.plPlayers && <span className={gmCardStyles.badge}>{card.plPlayers}</span>}
        </div>

        <div className={gmCardStyles.titleSection}>
          <h3 className={gmCardStyles.title}>『{card.title}』</h3>
        </div>

        <div className={gmCardStyles.gmCountContainer}>
          <span className={gmCardStyles.gmCount}>GM回数: {card.gmPlayCount ?? '-'}</span>
        </div>
      </div>
    </div>
  );
}

export function PassedScenarioGridPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { passedScenarios, gmScenarios, loading } = useData();
  const isNarrowScreen = useIsNarrowScreen();

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

  const setTab = (nextTab: TabType) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('tab', nextTab);
    navigate(`/scenario/passed-grid?${nextParams.toString()}`);
  };

  const setCategory = (nextCategory: CategoryType) => {
    const nextParams = new URLSearchParams(location.search);

    if (nextCategory === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', nextCategory);
    }

    navigate(`/scenario/passed-grid?${nextParams.toString()}`);
  };

  const playerScenarios = useMemo(
    () => passedScenarios.filter((item) => item.role === 'PL'),
    [passedScenarios],
  );

  const plannedCards: PassedScenario[] = useMemo(
    () => filterByCategory(playerScenarios, activeCategory)
      .filter((item) => !isPastDateExcludingToday(item.date))
      .sort((a, b) => (a.date ?? '9999-99-99').localeCompare(b.date ?? '9999-99-99')),
    [activeCategory, playerScenarios],
  );

  const passedCardsRaw: PassedScenario[] = useMemo(
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

  const gmCards: GMScenario[] = filterByCategory(gmScenarios, activeCategory)
    .sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  const visibleCards = activeTab === 'planned' ? plannedCards : passedCards;
  const isPassedTab = activeTab === 'passed';
  const isLoading = loading.passedScenarios || loading.gmScenarios;

  const openScenarioDetail = (scenario: PassedScenario) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('tab', activeTab);
    navigate(`/scenario/detail/${encodeURIComponent(scenario.id)}?${nextParams.toString()}`);
  };

  const goMainCard = () => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('tab', activeTab);
    navigate(`/scenario?${nextParams.toString()}`);
  };

  const scenarioColumns: ColumnDef<PassedScenario>[] = [
    {
      key: 'serial',
      header: 'No.',
      align: 'center',
      headerAlign: 'center',
      className: calendarStyles.tableCellTime,
      headerClassName: calendarStyles.tableHeaderTime,
      divider: true,
      render: (_scenario: PassedScenario, index: number) => (
        <span className={styles.serialNumber}>
          {isPassedTab
            ? String(visibleCards.length - index)
            : _scenario.date
              ? String(passedCards.length + 1 + index)
              : '-'
          }
        </span>
      ),
    },
    {
      key: 'title',
      header: 'タイトル',
      align: 'left',
      headerAlign: 'center',
      className: calendarStyles.tableCellTitle,
      headerClassName: calendarStyles.tableHeaderTitle,
      divider: true,
      render: (scenario) => (
        <span className={listStyles.titleWithIcon}>
          <ScenarioCategoryBadge
            category={scenario.type}
            showLabel={false}
            className={listStyles.categoryBadge}
            iconClassName={listStyles.categoryIcon}
          />
          <span className={listStyles.titleText}>{formatScenarioTitle(scenario.title)}</span>
        </span>
      ),
    },
    {
      key: 'date',
      header: isPassedTab ? '通過日' : '通過予定日',
      align: 'center',
      headerAlign: 'center',
      className: calendarStyles.tableCellDate,
      headerClassName: calendarStyles.tableHeaderDate,
      render: (scenario) => {
        if (isPassedTab && passedCardsMergedMap) {
          const allDates = passedCardsMergedMap.get(scenario.title)
            ?.map((item) => item.date)
            .filter((date): date is string => Boolean(date))
            .sort()
            .reverse() ?? [];
          return formatMultipleDates(allDates);
        }
        return formatDateWithWeekday(scenario.date);
      },
    },
  ];

  return (
    <main className="commonPage">
      <PageHero title="しなりお" />

      <div className="commonContainer" style={{ paddingBottom: '40px' }}>
        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(key) => setTab(key as TabType)}
          isNarrowScreen={isNarrowScreen}
        />

        <div className={`${tabBarStyles.tabBar} ${tabBarStyles.secondary} ${tabBarStyles.compact}`}>
          {CATEGORY_TABS.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={`${tabBarStyles.tab} ${activeCategory === tab.key ? tabBarStyles.active : ''}`}
              onClick={() => setCategory(tab.key)}
            >
              <span className={tabBarStyles.tabContent}>
                <ScenarioCategoryBadge
                  category={tab.key}
                  showLabel={!isNarrowScreen || tab.key === 'all'}
                  className={styles.categoryTabContent}
                  iconClassName={styles.categoryTabIcon}
                  labelClassName={styles.categoryTabLabel}
                />
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'passed' && (
          <div className={styles.viewModeActionRow}>
            <button type="button" onClick={goMainCard} className={styles.mainViewButton}>
              <LayoutGrid size={16} aria-hidden="true" />
              カード表示に戻る
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.emptyMessage}>読み込み中...</div>
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
          <DataTableList
            columns={scenarioColumns}
            data={visibleCards}
            onRowClick={openScenarioDetail}
            emptyMessage={activeTab === 'planned' ? '通過予定シナリオはまだありません。' : '通過済みシナリオはまだありません。'}
            getRowKey={(scenario) => scenario.id}
            gridTemplateColumns="clamp(30px, 8vw, 70px) minmax(0, 1fr) clamp(80px, 15vw, 200px)"
          />
        )}

        <button type="button" onClick={goMainCard} className={styles.backButton}>
          <Undo2 size={18} aria-hidden="true" />
          メインページに戻る
        </button>
      </div>
    </main>
  );
}