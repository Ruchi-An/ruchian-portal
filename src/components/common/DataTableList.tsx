import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import styles from './DataTableList.module.css';

export interface ColumnDef<T = unknown> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  render: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableListProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  getRowKey: (item: T, index: number) => string | number;
  gridTemplateColumns?: string;
}

function runRowAction<T>(event: KeyboardEvent<HTMLDivElement>, item: T, onRowClick?: (item: T) => void) {
  if (!onRowClick) return;

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onRowClick(item);
  }
}

export function DataTableList<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = '該当するデータがありません',
  getRowKey,
  gridTemplateColumns,
}: DataTableListProps<T>) {
  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      </div>
    );
  }

  const gridStyle: CSSProperties | undefined = gridTemplateColumns
    ? { gridTemplateColumns }
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header} style={gridStyle}>
          {columns.map((column) => (
            <span
              key={column.key}
              className={`${styles.headerCell} ${styles[`align-${column.headerAlign || 'center'}`]} ${column.headerClassName || ''}`}
            >
              {column.header}
            </span>
          ))}
        </div>

        <div className={styles.rows}>
          {data.map((item, index) => (
            <div
              key={getRowKey(item, index)}
              className={styles.row}
              style={gridStyle}
              onClick={() => onRowClick?.(item)}
              onKeyDown={(event) => runRowAction(event, item, onRowClick)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((column) => (
                <span
                  key={column.key}
                  className={`${styles.cell} ${styles[`align-${column.align || 'left'}`]} ${column.className || ''}`}
                >
                  {column.render(item)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
