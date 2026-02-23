// ReactのuseStateフックをインポート
import { useState } from 'react';
// シナリオカード型をインポート
import type { PassedScenario } from 'types/database';
import { ScenarioCategoryBadge } from './lib/ScenarioCategoryBadge';
// スタイルをインポート
import styles from './ScenarioCard.module.css';

// props型定義
interface ScenarioCardListProps {
  cards: PassedScenario[];
  showHeader?: boolean; // ヘッダー行を表示するかどうか
  onSortChange?: (field: 'date' | 'title' | 'pass-number', order: 'asc' | 'desc') => void;
  currentSortField?: 'date' | 'title' | 'pass-number';
  currentSortOrder?: 'asc' | 'desc';
  onCardClick?: (card: PassedScenario) => void; // アドミン編集用のクリックハンドラ
  displayPassNumbers?: number[]; // 絞り込み後の表示用通過番号配列
}

// シナリオカードリストコンポーネント
export function ScenarioCardList({ 
  cards, 
  showHeader = false, 
  onSortChange, 
  currentSortField, 
  currentSortOrder, 
  onCardClick,
  displayPassNumbers
}: ScenarioCardListProps) {
  // 展開されているカードのIDを管理
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  // 画像モーダル表示用のカード
  const [modalCard, setModalCard] = useState<PassedScenario | null>(null);

  // ヘッダークリック時のハンドラ
  const handleHeaderClick = (field: 'date' | 'title' | 'pass-number') => {
    if (onSortChange) {
      const newOrder = currentSortField === field && currentSortOrder === 'asc' ? 'desc' : 'asc';
      onSortChange(field, newOrder);
    }
  };

  // ソートインジケータ取得
  const getSortIndicator = (field: 'date' | 'title' | 'pass-number') => {
    if (currentSortField !== field) return '';
    return currentSortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  // 行クリック時のハンドラ
  const handleRowClick = (card: PassedScenario) => {
    if (onCardClick) {
      onCardClick(card);
    } else {
      setExpandedCardId(expandedCardId === card.id ? null : card.id);
    }
  };

  // カスタムヘッダー（ソート機能付き）
  const renderCustomHeader = () => {
    if (!showHeader) return null;
    
    return (
      <div className={styles.compactHeader}>
        <span className={styles.headerCell} onClick={() => handleHeaderClick('date')}>
          通過日{getSortIndicator('date')}
        </span>
        <span className={styles.headerCell} onClick={() => handleHeaderClick('title')}>
          タイトル{getSortIndicator('title')}
        </span>
        <span className={styles.headerCell} onClick={() => handleHeaderClick('pass-number')}>
          No.{getSortIndicator('pass-number')}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.scenarioListContainer}>
      {renderCustomHeader()}
      
      {cards.map((card, index) => {
        const isExpanded = expandedCardId === card.id;
        
        return (
          <div key={card.id} className={styles.cardWrapper}>
            {/* メイン行（TableListスタイルを模倣） */}
            <div 
              className={`${styles.compactRow} ${isExpanded ? styles.expanded : ''}`}
              onClick={() => handleRowClick(card)}
            >
              <span className={styles.compactDate}>{card.date || '-'}</span>
              <span className={styles.compactTitle}>{card.title}</span>
              <span className={styles.compactPass}>
                {displayPassNumbers?.[index] ? `#${displayPassNumbers[index]}` : '-'}
              </span>
            </div>

            {/* 展開時の詳細情報 */}
            {isExpanded && (
              <div className={styles.expandedDetails}>
                <div className={styles.detailsContent}>
                  {/* 詳細情報（左側） */}
                  <div className={styles.detailsInfo}>
                    <div className={styles.detailsColumns}>
                      {/* 左カラム */}
                      <div className={styles.detailsColumn}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>種類:</span>
                          {card.type ? (
                            <ScenarioCategoryBadge
                              category={card.type}
                              className={`${styles.detailValue} ${styles.detailCategory}`}
                              iconClassName={styles.detailCategoryIcon}
                              labelClassName={styles.detailCategoryLabel}
                            />
                          ) : (
                            <span className={styles.detailValue}>-</span>
                          )}
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>制作:</span>
                          <span className={styles.detailValue}>{card.production || '-'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>作者様:</span>
                          <span className={styles.detailValue}>{card.creator || '-'}</span>
                        </div>
                      </div>
                      {/* 右カラム */}
                      <div className={styles.detailsColumn}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>PC:</span>
                          <span className={styles.detailValue}>{card.pc || '-'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>GM/ST:</span>
                          <span className={styles.detailValue}>{card.gmst?.join(', ') || '-'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>同卓PL:</span>
                          <div className={styles.detailMembers}>
                            {card.pl?.map((member, idx) => (
                              <span key={idx} className={styles.memberTag}>
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* リンク行 */}
                    <div className={styles.detailsLinks}>
                      {card.scenarioUrl ? (
                        <a href={card.scenarioUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          シナリオ
                        </a>
                      ) : (
                        <span className={styles.linkDisabled} title="シナリオURLがありません">シナリオなし</span>
                      )}
                      {card.streamUrl ? (
                        <a href={card.streamUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                          配信
                        </a>
                      ) : (
                        <span className={styles.linkDisabled} title="配信URLがありません">配信なし</span>
                      )}
                    </div>
                  </div>

                  {/* 画像（右側） */}
                  <div className={styles.detailsImage} onClick={() => card.endcardUrl && setModalCard(card)}>
                    {card.endcardUrl ? (
                      <img src={card.endcardUrl} alt={card.title} />
                    ) : (
                      <div className={styles.imagePlaceholder}>No Image</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 画像モーダル */}
      {modalCard && modalCard.endcardUrl && (
        <div className={styles.imageModal} onClick={() => setModalCard(null)}>
          <img 
            src={modalCard.endcardUrl} 
            alt={modalCard.title} 
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// 後方互換性のため、単一カードコンポーネントも残す
export function ScenarioCard(props: {
  card: PassedScenario;
  displayPassNumber?: number;
  showHeader?: boolean;
  onSortChange?: (field: 'date' | 'title' | 'pass-number', order: 'asc' | 'desc') => void;
  currentSortField?: 'date' | 'title' | 'pass-number';
  currentSortOrder?: 'asc' | 'desc';
  onCardClick?: (card: PassedScenario) => void;
}) {
  return (
    <ScenarioCardList
      cards={[props.card]}
      showHeader={props.showHeader}
      onSortChange={props.onSortChange}
      currentSortField={props.currentSortField}
      currentSortOrder={props.currentSortOrder}
      onCardClick={props.onCardClick}
      displayPassNumbers={props.displayPassNumber !== undefined ? [props.displayPassNumber] : undefined}
    />
  );
}
