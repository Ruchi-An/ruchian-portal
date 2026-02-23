import { createContext, useContext, type ReactNode } from 'react';
import { useDataManager } from './useDataManager';

// コンテキストの型定義
type DataContextType = ReturnType<typeof useDataManager>;

// コンテキストの作成
const DataContext = createContext<DataContextType | undefined>(undefined);

// プロバイダーコンポーネント
export function DataProvider({ children }: { children: ReactNode }) {
  const dataManager = useDataManager();
  
  return (
    <DataContext.Provider value={dataManager}>
      {children}
    </DataContext.Provider>
  );
}

// カスタムフック：コンテキストを使用
// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

