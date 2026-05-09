import { useMemo, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck2, CalendarClock, List, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { GMScenario, PassedScenario } from 'types/database';
import { PageHero } from '../common/PageHero';
import { TabBar, type TabItem } from '../common/TabBar';
import tabBarStyles from '../common/TabBar.module.css';
import { DataTableList, type ColumnDef } from '../common/DataTableList';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
import { useData } from '../../lib/DataContext';
import { useIsNarrowScreen } from '../../lib/useIsNarrowScreen';
import styles from './ScenarioPage.module.css';
import gmCardStyles from './GMScenarioCard.module.css';
import listStyles from '../common/DataTableList.module.css';
import calendarStyles from '../schedule/css/ScheduleCalendar.module.css';

type TabType = 'planned' | 'passed' | 'gm-ready';
type CategoryType = 'all' | '📕' | '📗' | '📙';

interface GMScenarioCardProps {
  card: GMScenario;
}

interface PassedScenarioCardProps {
  card: PassedScenario;
  passNumber: number;
  dateLabel: string;
  onOpen: (scenario: PassedScenario) => void;
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

  const earliest = dates[dates.length - 1];
  const latest = dates[0];

  return (
    <span className={listStyles.dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span>{formatDate(earliest)}</span>
      <span>{formatDate(latest)}</span>
    </span>
  );
}

function formatPassDateLabel(dates: string[]): string {
  if (dates.length === 0) return '未定';
  if (dates.length === 1) return dates[0];

  const latest = dates[0];
  const earliest = dates[dates.length - 1];
  return `${earliest} 〜 ${latest}`;
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

function PassedScenarioCard({ card, passNumber, dateLabel, onOpen }: PassedScenarioCardProps) {
  return (
    <article
      className={styles.passedCard}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(card)}
      onKeyDown={(event) => toggleWithKeyboard(event, () => onOpen(card))}
    >
      {card.endcardImageUrl && (
        <div className={styles.passedCardImageWrap}>
          <img src={card.endcardImageUrl} alt={card.title} className={styles.passedCardImage} />
        </div>
      )}
      <div className={styles.passedCardBody}>
        <div className={styles.passedCardTags}>
          <span className={styles.passedCardTag}>#{passNumber}</span>
          <ScenarioCategoryBadge
            category={card.type}
            className={styles.passedCardTag}
            iconClassName={styles.passedCardTagIcon}
            labelClassName={styles.passedCardTagLabel}
          />
        </div>
        <h3 className={styles.passedCardTitle}>『{card.title}』</h3>
        <div className={styles.passedCardDivider} aria-hidden="true" />
        <p className={styles.passedCardDate}>通過日: {dateLabel}</p>
      </div>
    </article>
  );
}

export function ScenarioPage() {
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
    navigate(`/scenario?${nextParams.toString()}`);
  };

  const setCategory = (nextCategory: CategoryType) => {
    const nextParams = new URLSearchParams(location.search);

    if (nextCategory === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', nextCategory);
    }

    navigate(`/scenario?${nextParams.toString()}`);
  };

  const playerScenarios = passedScenarios.filter((item) => item.role === 'PL');

  const plannedCards: PassedScenario[] = filterByCategory(playerScenarios, activeCategory)
    .filter((item) => !isPastDateExcludingToday(item.date))
    .sort((a, b) => (a.date ?? '9999-99-99').localeCompare(b.date ?? '9999-99-99'));

  const passedCardsRaw: PassedScenario[] = filterByCategory(playerScenarios, activeCategory)
    .filter((item) => isPastDateExcludingToday(item.date))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  // 同じシナリオ（タイトル）の複数日登録をマップで管理
  const passedCardsMergedMap = useMemo(() => {
    const map = new Map<string, PassedScenario[]>();
    
    passedCardsRaw.forEach(scenario => {
      const key = scenario.title;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(scenario);
    });
    
    return map;
  }, [passedCardsRaw]);

  // マージされた通過済みカード（同じシナリオは最新の日付のものだけ）
  const passedCards = useMemo(() => {
    return Array.from(passedCardsMergedMap.values()).map(group => group[0]);
  }, [passedCardsMergedMap]);

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
            ?.map(s => s.date)
            .filter((d): d is string => !!d)
            .sort()
            .reverse() || [];
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
          <div className={styles.passedGridActionRow}>
            <button
              type="button"
              className={styles.passedGridButton}
              onClick={() => navigate(`/scenario/passed-grid${location.search}`)}
            >
              <List size={16} aria-hidden="true" />
              一覧表示を開く
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
        ) : isPassedTab ? (
          <div className={styles.passedCardGrid}>
            {passedCards.map((scenario, index) => {
              const allDates = passedCardsMergedMap.get(scenario.title)
                ?.map((item) => item.date)
                .filter((date): date is string => Boolean(date))
                .sort()
                .reverse() ?? [];

              return (
                <PassedScenarioCard
                  key={scenario.id}
                  card={scenario}
                  passNumber={passedCards.length - index}
                  dateLabel={formatPassDateLabel(allDates)}
                  onOpen={openScenarioDetail}
                />
              );
            })}
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
      </div>
    </main>
  );
}
