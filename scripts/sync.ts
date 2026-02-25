import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v5 as uuidv5 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const VAULT_PATH = process.env.VAULT_PATH!;
const ENDCARD_BUCKET = process.env.ENDCARD_BUCKET ?? 'endcards';
const ENDCARD_ASSET_DIR = process.env.ENDCARD_ASSET_DIR;
const CONTENT_NOTES_DIR = path.join(VAULT_PATH, '01_Contents');
const EVENT_NOTES_DIR = path.join(VAULT_PATH, '02_Events');
const DAY_NOTES_DIR = path.join(VAULT_PATH, '03_Days');

let vaultFileIndex: Map<string, string[]> | null = null;
let endcardBucketReady = false;

// UUID v5 namespace for generating deterministic IDs from filenames
const NAMESPACE_UUID = 'c3a6d8e0-8b4a-4f3e-9d2c-1a5b7c9e0f1a';

function generateId(fileName: string): string {
  return uuidv5(fileName, NAMESPACE_UUID);
}

function formatStartTime(startTime: string | number | undefined): string | null {
  if (!startTime) return null;
  
  // 数値の場合は分単位と見なしてHH:MM形式に変換
  if (typeof startTime === 'number') {
    const hours = Math.floor(startTime / 60);
    const minutes = startTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // 文字列の場合はそのまま返す（HH:MM形式を想定）
  return startTime;
}

type EventFrontmatter = {
  id?: string;
  release?: boolean;
  fileClass?: string;
  content?: string;
  status: 'pending' | 'planned' | 'done';
  date?: string;
  label?: string;
  start_time?: string | number;
  position?: 'solo' | 'sponsor' | 'joining';
  role?: 'GM' | 'ST' | 'PL';
  members?: string[];
  pc_name?: string;
  gmst_name?: string;
  server?: string;
  is_stream?: boolean;
  stream_url?: string;
  endcard_image?: string;
  endcard?: string;
  memo?: string;
};

type ContentFrontmatter = {
  id?: string;
  release?: boolean;
  fileClass?: string;
  type: 'game' | 'scenario';
  official_url?: string;
  genre?: string;
  memo?: string;
  players?: string;
  game_system?: string;
  production?: string;
  creator?: string;
  duration?: string;
  possible_GM?: boolean;
  possible_stream?: boolean;
  trailer_image?: string;
};

type DayFrontmatter = {
  id?: string;
  release?: boolean;
  fileClass?: string;
  date: string;
  work_off?: boolean;
  stream_off?: boolean;
  will?: 'free' | 'tentative' | 'blocked';
  memo?: string;
};

type ContentCache = Map<string, { type: 'game' | 'scenario'; id: string }>;

function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(dir, name));
}

function readFrontmatter<T>(filePath: string): { data: T; title: string } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  const fileName = path.basename(filePath, '.md');
  const title = parsed.data.title || fileName;
  return { data: parsed.data as T, title };
}

function extractContentLink(content: string | undefined): string | null {
  if (!content) return null;
  const match = content.match(/\[\[([^\]]+)\]\]/);
  return match ? match[1] : null;
}

function extractObsidianAssetRef(value: string): string | null {
  const embedMatch = value.match(/^!?\[\[([^\]]+)\]\]$/);
  if (!embedMatch) return null;
  const rawRef = embedMatch[1] ?? '';
  const noAlias = rawRef.split('|')[0]?.trim() ?? '';
  const noHeading = noAlias.split('#')[0]?.trim() ?? '';
  return noHeading || null;
}

function detectContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.avif') return 'image/avif';
  return 'application/octet-stream';
}

function makeSafeStorageFileName(originalFileName: string): string {
  const ext = path.extname(originalFileName).toLowerCase();
  const rawBase = path.basename(originalFileName, ext);
  const normalizedBase = rawBase.normalize('NFKC');
  const asciiBase = normalizedBase
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  const fallbackBase = generateId(originalFileName);
  const safeBase = asciiBase || fallbackBase;
  return `${safeBase}${ext}`;
}

function looksLikeFileRef(value: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(value.trim());
}

function buildVaultFileIndex(dir: string, result: Map<string, string[]> = new Map()): Map<string, string[]> {
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      buildVaultFileIndex(fullPath, result);
      continue;
    }

    const list = result.get(entry.name) ?? [];
    list.push(fullPath);
    result.set(entry.name, list);
  }

  return result;
}

function getVaultFileIndex(): Map<string, string[]> {
  if (!vaultFileIndex) {
    vaultFileIndex = buildVaultFileIndex(VAULT_PATH);
  }
  return vaultFileIndex;
}

function resolveLocalAssetPath(assetRef: string, noteFilePath: string): string | null {
  const normalized = assetRef.replace(/\\/g, '/').trim();
  if (!normalized) return null;

  if (path.isAbsolute(normalized) && fs.existsSync(normalized)) {
    return normalized;
  }

  const noteDirCandidate = path.resolve(path.dirname(noteFilePath), normalized);
  if (fs.existsSync(noteDirCandidate)) return noteDirCandidate;

  const vaultCandidate = path.resolve(VAULT_PATH, normalized);
  if (fs.existsSync(vaultCandidate)) return vaultCandidate;

  if (ENDCARD_ASSET_DIR) {
    const assetDirCandidate = path.resolve(ENDCARD_ASSET_DIR, normalized);
    if (fs.existsSync(assetDirCandidate)) return assetDirCandidate;
  }

  const byNameCandidates = getVaultFileIndex().get(path.basename(normalized));
  if (byNameCandidates && byNameCandidates.length > 0) {
    return byNameCandidates[0];
  }

  return null;
}

async function resolveImageValue(
  imageRaw: string | undefined,
  noteFilePath: string,
  storagePathPrefix: string,
  fieldName: 'endcard_image' | 'trailer_image',
): Promise<string | null> {
  if (!imageRaw) return null;

  const trimmed = imageRaw.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const obsidianRef = extractObsidianAssetRef(trimmed);
  const candidate = obsidianRef ?? trimmed;

  if (!looksLikeFileRef(candidate)) {
    return trimmed;
  }

  const localPath = resolveLocalAssetPath(candidate, noteFilePath);
  if (!localPath) {
    console.warn(`⚠️  ${fieldName} file not found: ${candidate} (${noteFilePath})`);
    return trimmed;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const fileName = path.basename(localPath);
  const safeStorageFileName = makeSafeStorageFileName(fileName);
  const storagePath = `${storagePathPrefix}/${safeStorageFileName}`;
  const contentType = detectContentType(localPath);

  const bucketReady = await ensureEndcardBucket();
  if (!bucketReady) {
    console.error(`❌ ${fieldName} upload skipped: bucket '${ENDCARD_BUCKET}' is unavailable`);
    return trimmed;
  }

  const { error: uploadError } = await supabase.storage
    .from(ENDCARD_BUCKET)
    .upload(storagePath, fileBuffer, { upsert: true, contentType });

  if (uploadError) {
    console.error(`❌ ${fieldName} upload failed: ${storagePath}`, uploadError.message);
    return trimmed;
  }

  const { data } = supabase.storage.from(ENDCARD_BUCKET).getPublicUrl(storagePath);
  const publicUrl = data.publicUrl;

  if (!publicUrl) {
    console.warn(`⚠️  ${fieldName} public URL not generated: ${storagePath}`);
    return trimmed;
  }

  console.log(`🖼️  ${fieldName} uploaded: ${fileName} -> ${storagePath}`);
  return publicUrl;
}

async function resolveEndcardImageValue(endcardImageRaw: string | undefined, eventId: string, noteFilePath: string): Promise<string | null> {
  return resolveImageValue(endcardImageRaw, noteFilePath, `events/${eventId}`, 'endcard_image');
}

async function resolveTrailerImageValue(trailerImageRaw: string | undefined, scenarioId: string, noteFilePath: string): Promise<string | null> {
  return resolveImageValue(trailerImageRaw, noteFilePath, `scenarios/${scenarioId}`, 'trailer_image');
}

async function ensureEndcardBucket(): Promise<boolean> {
  if (endcardBucketReady) return true;

  const { data, error } = await supabase.storage.getBucket(ENDCARD_BUCKET);
  if (!error && data) {
    endcardBucketReady = true;
    return true;
  }

  if (error && !/not found|does not exist/i.test(error.message)) {
    console.error(`❌ failed to check bucket '${ENDCARD_BUCKET}': ${error.message}`);
    return false;
  }

  const { error: createError } = await supabase.storage.createBucket(ENDCARD_BUCKET, {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'],
  });

  if (createError) {
    console.error(`❌ failed to create bucket '${ENDCARD_BUCKET}': ${createError.message}`);
    return false;
  }

  endcardBucketReady = true;
  console.log(`🪣 created missing bucket: ${ENDCARD_BUCKET}`);
  return true;
}

async function deleteMissingByIds(table: string, ids: string[]): Promise<string[]> {
  const { data, error } = await supabase.from(table).select('id');
  if (error) throw error;

  const existingIds = (data ?? []).map((row) => row.id as string);
  const deleteTargets = existingIds.filter((id) => !ids.includes(id));

  if (deleteTargets.length > 0) {
    const { error: deleteError } = await supabase.from(table).delete().in('id', deleteTargets);
    if (deleteError) throw deleteError;
    console.log(`🗑️  Deleted ${deleteTargets.length} items from ${table}`);
  }

  return deleteTargets;
}

async function deleteEndcardAssetsByEventIds(eventIds: string[]) {
  if (eventIds.length === 0) return;

  const bucketReady = await ensureEndcardBucket();
  if (!bucketReady) {
    console.warn(`⚠️  skip endcard cleanup: bucket '${ENDCARD_BUCKET}' is unavailable`);
    return;
  }

  for (const eventId of eventIds) {
    const { data: files, error: listError } = await supabase.storage
      .from(ENDCARD_BUCKET)
      .list(eventId, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (listError) {
      console.warn(`⚠️  failed to list endcards for ${eventId}: ${listError.message}`);
      continue;
    }

    const fileNames = (files ?? []).filter((item) => item.name).map((item) => `${eventId}/${item.name}`);
    if (fileNames.length === 0) continue;

    const { error: removeError } = await supabase.storage
      .from(ENDCARD_BUCKET)
      .remove(fileNames);

    if (removeError) {
      console.warn(`⚠️  failed to remove endcards for ${eventId}: ${removeError.message}`);
      continue;
    }

    console.log(`🧹 removed ${fileNames.length} endcard file(s) for event ${eventId}`);
  }
}

async function syncContents(): Promise<ContentCache> {
  const files = getMarkdownFiles(CONTENT_NOTES_DIR);
  const syncedGameIds: string[] = [];
  const syncedScenarioIds: string[] = [];
  const contentCache: ContentCache = new Map();

  for (const filePath of files) {
    try {
      const { data: content, title } = readFrontmatter<ContentFrontmatter>(filePath);

      // 同期条件チェック
      if (content.release !== true) continue;
      if (content.fileClass !== 'fc-content') continue;
      if (!content.type || (content.type !== 'game' && content.type !== 'scenario')) {
        console.warn(`⚠️  Invalid type: ${filePath}`);
        continue;
      }
      if (!title) {
        console.warn(`⚠️  Missing title: ${filePath}`);
        continue;
      }

      const fileName = path.basename(filePath, '.md');
      const id = content.id || generateId(fileName);
      contentCache.set(fileName, { type: content.type, id });

      if (content.type === 'game') {
        const { error } = await supabase.from('game_info').upsert(
          {
            id,
            title,
            official_url: content.official_url ?? null,
            genre: content.genre ?? null,
            memo: content.memo ?? null,
          },
          { onConflict: 'id' },
        );
        if (error) throw error;
        syncedGameIds.push(id);
        continue;
      }

      const resolvedTrailerImage = await resolveTrailerImageValue(content.trailer_image, id, filePath);

      const { error } = await supabase.from('scenario_info').upsert(
        {
          id,
          title,
          official_url: content.official_url ?? null,
          genre: content.genre ?? null,
          memo: content.memo ?? null,
          players: content.players ?? null,
          game_system: content.game_system ?? null,
          production: content.production ?? null,
          creator: content.creator ?? null,
          duration: content.duration ?? null,
          possible_gm: content.possible_GM ?? false,
          possible_stream: content.possible_stream ?? false,
          trailer_image: resolvedTrailerImage,
        },
        { onConflict: 'id' },
      );

      if (error) throw error;
      syncedScenarioIds.push(id);
    } catch (err) {
      console.error(`❌ Error syncing content: ${filePath}`, err);
    }
  }

  await deleteMissingByIds('game_info', syncedGameIds);
  await deleteMissingByIds('scenario_info', syncedScenarioIds);

  console.log(`✅ Synced ${syncedGameIds.length} games, ${syncedScenarioIds.length} scenarios`);
  return contentCache;
}

async function syncEvents(contentCache: ContentCache) {
  const files = getMarkdownFiles(EVENT_NOTES_DIR);
  const syncedScheduleIds: string[] = [];

  for (const filePath of files) {
    try {
      const { data: event } = readFrontmatter<EventFrontmatter>(filePath);

      // 同期条件チェック
      if (event.release !== true) continue;
      if (event.fileClass !== 'fc-event') continue;
      if (!event.status || !['pending', 'planned', 'done'].includes(event.status)) {
        console.warn(`⚠️  Invalid status: ${filePath}`);
        continue;
      }

      // pending以外は日付必須
      if (event.status !== 'pending' && !event.date) {
        console.warn(`⚠️  Missing date for non-pending event: ${filePath}`);
        continue;
      }

      const fileName = path.basename(filePath, '.md');
      const id = event.id || generateId(fileName);

      // contentリンク解決
      const contentLinkName = extractContentLink(event.content);
      let content_type: 'game' | 'scenario' | 'real' = 'real';
      let content_id: string | null = null;

      if (contentLinkName && contentCache.has(contentLinkName)) {
        const resolved = contentCache.get(contentLinkName)!;
        content_type = resolved.type;
        content_id = resolved.id;
      }

      const formattedStartTime = formatStartTime(event.start_time);
      const resolvedEndcardImage = await resolveEndcardImageValue(event.endcard_image ?? event.endcard, id, filePath);
      console.log(`📝 [${fileName}] start_time: ${JSON.stringify(event.start_time)} -> ${JSON.stringify(formattedStartTime)}`);

      const { error } = await supabase.from('schedules').upsert(
        {
          id,
          content_type,
          content_id,
          status: event.status,
          date: event.status === 'pending' ? null : event.date ?? null,
          label: event.label ?? null,
          start_time: formattedStartTime,
          position: event.position ?? null,
          role: event.role ?? null,
          members: event.members ?? [],
          pc_name: event.pc_name ?? null,
          gmst_name: event.gmst_name ?? null,
          server: event.server ?? null,
          is_stream: event.is_stream ?? false,
          stream_url: event.stream_url ?? null,
          endcard_image: resolvedEndcardImage,
          memo: event.memo ?? null,
        },
        { onConflict: 'id' },
      );

      if (error) throw error;
      syncedScheduleIds.push(id);
    } catch (err) {
      console.error(`❌ Error syncing event: ${filePath}`, err);
    }
  }

  const deletedScheduleIds = await deleteMissingByIds('schedules', syncedScheduleIds);
  await deleteEndcardAssetsByEventIds(deletedScheduleIds);

  // scenario_sessions同期
  const { data: scenarioSchedules, error } = await supabase
    .from('schedules')
    .select('id, content_type')
    .eq('content_type', 'scenario');

  if (error) throw error;

  const scenarioSessionIds = (scenarioSchedules ?? []).map((row) => row.id as string);

  for (const scheduleId of scenarioSessionIds) {
    const { error: upsertError } = await supabase.from('scenario_sessions').upsert(
      {
        id: scheduleId,
        schedule_id: scheduleId,
      },
      { onConflict: 'schedule_id' },
    );
    if (upsertError) throw upsertError;
  }

  await deleteMissingByIds('scenario_sessions', scenarioSessionIds);

  console.log(`✅ Synced ${syncedScheduleIds.length} events (${scenarioSessionIds.length} scenarios)`);
}

async function syncDays() {
  const files = getMarkdownFiles(DAY_NOTES_DIR);
  const syncedIds: string[] = [];

  for (const filePath of files) {
    try {
      const { data: day } = readFrontmatter<DayFrontmatter>(filePath);

      // 同期条件チェック
      if (day.release !== true) continue;
      if (day.fileClass !== 'fc-day') continue;
      if (!day.date) {
        console.warn(`⚠️  Missing date: ${filePath}`);
        continue;
      }

      const fileName = path.basename(filePath, '.md');
      const id = day.id || generateId(fileName);

      const { error } = await supabase.from('days_status').upsert(
        {
          id,
          date: day.date,
          work_off: day.work_off ?? false,
          stream_off: day.stream_off ?? false,
          will: day.will ?? 'free',
          memo: day.memo ?? null,
        },
        { onConflict: 'id' },
      );

      if (error) throw error;
      syncedIds.push(id);
    } catch (err) {
      console.error(`❌ Error syncing day: ${filePath}`, err);
    }
  }

  await deleteMissingByIds('days_status', syncedIds);

  console.log(`✅ Synced ${syncedIds.length} days`);
}

async function main() {
  if (!VAULT_PATH) throw new Error('VAULT_PATH is required');
  
  console.log('🔄 Starting sync...');
  console.log(`📂 Vault: ${VAULT_PATH}`);
  
  const contentCache = await syncContents();
  await syncEvents(contentCache);
  await syncDays();
  
  console.log('✅ sync complete');
}

main().catch((error) => {
  console.error('❌ sync failed', error);
  process.exit(1);
});
