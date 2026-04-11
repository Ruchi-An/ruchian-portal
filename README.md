# Ruchian Portal

RuChiAnさん向けの **React + TypeScript + Vite** 製ポータルサイトです。

---

## ✨ できること

- `/` : 今週のスケジュール画像と外部リンク表示
- `/schedule` : カレンダー表示、未来予定、過去予定の確認
- `/scenario` : 通過予定 / 通過済み / GM可能シナリオの確認
- `/scenario/gm/:id` : GM可能シナリオの詳細表示

---

## 🚀 開発コマンド

```bash
npm install
npm run dev
npm run lint
npm run build
```

---

## 📁 フォルダの見方

初心者向けに、**「どこに何を書くか」** を先にまとめます。

| パス | 役割 |
| --- | --- |
| `src/App.tsx` | 画面遷移だけをまとめた入口 |
| `src/lib/` | Supabase接続、データ取得、共通フック |
| `src/types/database.ts` | アプリ全体で使う型定義 |
| `src/components/layout/` | ヘッダー・フッターなど共通レイアウト |
| `src/components/home/` | ホーム画面用の部品 |
| `src/components/schedule/` | スケジュール画面一式 |
| `src/components/scenario/` | シナリオ画面一式 |
| `src/components/common/` | 複数ページで使い回す共通UI |
| `public/weekly-schedule/` | トップに出す週間画像 |

> フォルダ名を**役割ベース**に変えたので、前より見分けやすくなっています。

---

## 🧭 迷ったときの編集場所

### 文言やリンクを変えたい
- `src/components/home/HomePage.tsx`

### 週間スケジュール画像を変えたい
- `public/weekly-schedule/current.png`

### スケジュール画面を直したい
- `src/components/schedule/`

### シナリオ画面を直したい
- `src/components/scenario/`

### Supabaseから取るデータの形を直したい
- `src/lib/useDataManager.ts`
- `src/types/database.ts`

---

## 🔄 データの流れ

1. `src/lib/supabaseClient.ts` で接続
2. `src/lib/useDataManager.ts` で取得して整形
3. `src/lib/DataContext.tsx` で画面全体に渡す
4. 各コンポーネントで `useData()` を使って表示

---

## ✅ 今回の整理内容

- 使っていないコンポーネントと空フォルダを削除
- 重複していた分岐やリスト表示ロジックを簡略化
- 小さすぎる helper は `HomePage.tsx`・`SchedulePage.tsx`・`ScenarioPage.tsx` にまとめて、ファイル数を削減
- 共通フック `useIsNarrowScreen` を `src/lib/` に移動
- README を実際の構成に合わせて更新

これで、**「ページごとの役割」と「触るべきファイル」** が追いやすくなっています。

