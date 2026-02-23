# Supabase Migration

本番用DB構成は `migrations/202602220001_init_portal_schema.sql` で定義しています。

## 適用手順

### 1) Supabase SQL Editor で実行
1. Supabaseプロジェクトを開く
2. SQL Editorで `migrations/202602220001_init_portal_schema.sql` を実行

### 2) Supabase CLI を使う場合
```bash
supabase db push
```

## 適用前チェック（重要）
- `scripts/sync.ts` を動かす前に、必ず `202602220001_init_portal_schema.sql` を適用してください。
- `.env.local` の `SUPABASE_SERVICE_ROLE_KEY` は **service_role** のキーを設定してください。
- `anon` キーを `SUPABASE_SERVICE_ROLE_KEY` に設定すると、スキーマ作成や同期書き込みが失敗します。

## endcard画像（Obsidian → Supabase Storage）
- `scripts/sync.ts` は `endcard` が `![[image.png]]` / `[[image.png]]` / `image.png` の場合、ローカル画像を Supabase Storage にアップロードして公開URLを `schedules.endcard` に保存します。
- 既に `https://` から始まるURLが入っている場合はそのまま保存します。

### 必須/推奨設定
- `.env.local`:
  - `VAULT_PATH=...` （Obsidian Vaultのルート）
  - `SUPABASE_URL=...`
  - `SUPABASE_SERVICE_ROLE_KEY=...`
  - `ENDCARD_BUCKET=endcards`（未指定時は `endcards`）
  - `ENDCARD_ASSET_DIR=...`（任意。添付画像フォルダを別管理している場合）

### Supabase側の準備
- Storageに `ENDCARD_BUCKET` で指定したバケットを作成してください。
- 公開URL表示を使う場合、バケットを Public にしてください。

## よくあるエラー
- `PGRST205: Could not find the table 'public.game_info' in the schema cache`
  - 原因: マイグレーション未適用
  - 対処: SQL Editor で `migrations/202602220001_init_portal_schema.sql` を実行

## このマイグレーションで作成されるもの
- テーブル: `game_info`, `scenario_info`, `schedules`, `scenario_sessions`, `days_status`
- Enum: `content_type`, `schedule_status`, `schedule_position`, `schedule_role`, `day_will`
- 制約:
  - `scenario_sessions.schedule_id -> schedules.id` FK (CASCADE)
  - `schedules.status` と `date` の整合チェック
  - `schedules.content_type + content_id` の参照整合（トリガーで実質FK）
- RLS:
  - `anon/authenticated` は SELECT のみ
  - INSERT/UPDATE/DELETE は不可

## 同期スクリプトとの関係
- 同期処理: `scripts/sync.ts`
- 想定Frontmatterクラス:
  - `fc-content`
  - `fc-event`
  - `fc-day`
- `release: true` のノートのみ同期
