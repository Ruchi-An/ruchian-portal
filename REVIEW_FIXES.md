# ポータル全体のコード見直し・修正レポート 📋

## 🔍 見つかった問題と修正内容

### ✅ **問題1: 型定義の重複（scenario.ts と database.ts）**

**問題内容:**
- `src/types/scenario.ts` に `ScenarioCard` と `GMScenarioCard` の型定義が存在
- `src/types/database.ts` に `PassedScenario` と `GMScenario` の型定義が存在
- 同じ意味の型が2つのファイルに分散していた

**修正内容:**
1. `scenario.ts` の型定義を `database.ts` に統合
2. `ScenarioCard` と `GMScenarioCard` を deprecated コメント付きで `database.ts` に追加
3. 以下の3つのコンポーネントのインポートを更新:
   - `ScenarioCard.tsx`: `types/scenario` → `types/database`
   - `GMScenarioCard.tsx`: `types/scenario` → `types/database`
   - `Scenario.tsx`: `types/scenario` → `types/database`

4. エクスポート箇所を整理:
   - `DataContext.tsx`: `ScenarioCard`, `GMScenarioCard` をエクスポート
   - `useDataManager.ts`: `ScenarioCard`, `GMScenarioCard` をエクスポート

**ファイル変更:**
- `src/types/database.ts`: 型定義追加
- `src/components/3-Scenario/ScenarioCard.tsx`: インポート更新
- `src/components/3-Scenario/GMScenarioCard.tsx`: インポート更新
- `src/components/3-Scenario/Scenario.tsx`: インポート更新
- `src/lib/DataContext.tsx`: エクスポート追加
- `src/lib/useDataManager.ts`: エクスポート追加

---

### ✅ **問題2: カレンダーが読み込み中のまま表示されない**

**問題内容:**
- `Schedule.tsx` で `loading` を直接チェックしていた
- `useDataManager` の戻り値は `loading` オブジェクト（`loading.schedules`, `loading.badges` など）
- バッジ読み込み中でもカレンダーが表示されず、ユーザーに読み込み画面が表示され続けた

**修正内容:**
```tsx
// Before (間違い)
{loading ? (

// After (正解)
{loading.schedules ? (
```

スケジュール専用の読み込み状態 `loading.schedules` のみをチェックするように修正。

**ファイル変更:**
- `src/components/2-Schedule/Schedule.tsx`: 読み込み状態の条件を修正

---

### ✅ **問題3: useSchedules.ts が古く統合されていない**

**問題内容:**
- `useSchedules.ts` に古い型定義 `Event` と `ScheduleData` が存在
- `useDataManager.ts` に新しい型定義がある
- `useSchedules()` フック自体がどのコンポーネントからも使用されていない
- 型の競合や混乱の原因になる可能性

**修正内容:**
1. `useSchedules.ts` の先頭に deprecation コメントを追加
2. 全型定義に `@deprecated` JSDoc タグを追加
3. `useDataManager` への移行を促すコメントを追加

```typescript
/**
 * ⚠️ DEPRECATED: このファイルは使用されていません
 * useDataManager.ts に統合されました。
 * 新しいコードでは useData() フックを使用してください。
 */
```

**ファイル変更:**
- `src/lib/useSchedules.ts`: deprecation コメント追加

---

## 📊 修正前後の型システム構造

### Before (修正前)
```
types/
├── database.ts
│   ├── ScheduleData, ScheduleDataRow
│   ├── ScheduleBadge, ScheduleBadgeRow
│   ├── PassedScenario, PassedScenarioRow
│   ├── GMScenario, GMScenarioRow
│   └── 変換関数
├── scenario.ts  ⚠️ 重複定義
│   ├── ScenarioCard
│   └── GMScenarioCard
└── (その他)

lib/
├── useSchedules.ts  ⚠️ 古い型定義・未使用
├── useDataManager.ts
└── DataContext.tsx
```

### After (修正後)
```
types/
├── database.ts
│   ├── ScheduleData, ScheduleDataRow
│   ├── ScheduleBadge, ScheduleBadgeRow
│   ├── PassedScenario, PassedScenarioRow
│   ├── GMScenario, GMScenarioRow
│   ├── ScenarioCard (統合・deprecated)
│   ├── GMScenarioCard (統合・deprecated)
│   └── 変換関数
└── scenario.ts  ⚠️ 削除候補（現在は参照なし）

lib/
├── useSchedules.ts  ⚠️ deprecated マーク済み
├── useDataManager.ts  ✓ 統一された型定義
└── DataContext.tsx  ✓ 全型をエクスポート
```

---

## ✨ 修正による改善点

1. **型定義の一元化** 
   - すべてのデータベース関連の型が `database.ts` に集中
   - 保守性向上・混乱の削減

2. **カレンダー表示の修正**
   - 正確な読み込み状態判定により、バッジ読み込み中でもカレンダーが表示される
   - ユーザー体験の向上

3. **古いコードの明確化**
   - deprecated マークにより、開発者が新しいコードを使用することを認識可能
   - 段階的な移行が可能

4. **エラーなし**
   - 全ファイルのコンパイルエラーなし
   - 型安全性を維持

---

## 📋 確認チェックリスト

- [x] `database.ts` に型定義が統合されている
- [x] `scenario.ts` への参照がすべて `database.ts` に更新されている
- [x] `Schedule.tsx` のローディング状態が `loading.schedules` に修正されている
- [x] `useSchedules.ts` が deprecated マーク済み
- [x] すべてのコンポーネントでエラーなし
- [x] 型システムが一貫している
- [x] DataContext が全型をエクスポート

---

## 🚀 今後の推奨アクション

1. **`scenario.ts` の削除**
   - 現在は参照されていないため、削除しても安全
   - 削除後も `database.ts` に型定義があるため問題なし

2. **`useSchedules.ts` の削除**
   - deprecated マーク後、一定期間経過後に削除推奨

3. **開発者ドキュメントの更新**
   - データ管理には `useData()` フック使用を記載
   - 型定義は `database.ts` から import することを明記

---

**修正日時:** 2026年1月11日  
**確認状況:** ✅ エラーなし・完全修正

