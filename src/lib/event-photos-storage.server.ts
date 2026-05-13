import 'server-only';

import { readdirSync } from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  EVENT_IMAGE_EXT,
  EVENT_PHOTOS_BUCKET,
  EVENT_PHOTOS_PREFIX_CULTURE_SHOW,
  EVENT_PHOTOS_PREFIX_FORMAL,
  type EventPhoto,
} from '@/lib/event-photos';

function createStorageListClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) return null;
  const key = serviceRole ?? anon;
  if (!key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function isImageFileName(name: string): boolean {
  return EVENT_IMAGE_EXT.test(name) && !name.startsWith('.');
}

/** Supabase list entries with `metadata.size` are files; others are treated as prefixes to recurse into. */
function isStorageFileObject(item: { name: string; metadata?: Record<string, unknown> | null }): boolean {
  const size = item.metadata && typeof item.metadata.size === 'number' ? item.metadata.size : null;
  return size !== null && size >= 0;
}

async function listImageObjectPathsRecursive(
  supabase: SupabaseClient,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const collected: string[] = [];
  const limit = 1000;
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[event-photos] storage list failed:', prefix, error.message);
      }
      return collected;
    }

    if (!data?.length) break;

    for (const item of data) {
      if (item.name.startsWith('.')) continue;
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (isStorageFileObject(item)) {
        if (isImageFileName(item.name)) collected.push(fullPath);
      } else {
        const nested = await listImageObjectPathsRecursive(supabase, bucket, fullPath);
        collected.push(...nested);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return collected;
}

async function photosFromSupabasePrefix(
  supabase: SupabaseClient,
  folderPrefix: string,
  alt: string,
): Promise<EventPhoto[]> {
  const paths = await listImageObjectPathsRecursive(supabase, EVENT_PHOTOS_BUCKET, folderPrefix);
  paths.sort();
  return paths.map((objectPath) => {
    const { data } = supabase.storage.from(EVENT_PHOTOS_BUCKET).getPublicUrl(objectPath);
    return { src: data.publicUrl, alt };
  });
}

function photosFromLocalPublicDir(relativeDir: string, alt: string): EventPhoto[] {
  const dir = path.join(process.cwd(), 'public', relativeDir);
  try {
    const files = readdirSync(dir).filter((f) => isImageFileName(f)).sort();
    return files.map((name) => ({ src: `/${relativeDir}/${name}`, alt }));
  } catch {
    return [];
  }
}

async function photosForFolder(
  storagePrefix: string,
  localRelativeDir: string,
  alt: string,
): Promise<EventPhoto[]> {
  const supabase = createStorageListClient();
  if (supabase) {
    const remote = await photosFromSupabasePrefix(supabase, storagePrefix, alt);
    if (remote.length > 0) return remote;
  }
  return photosFromLocalPublicDir(localRelativeDir, alt);
}

export async function getFormalEventPhotos(): Promise<EventPhoto[]> {
  return photosForFolder(EVENT_PHOTOS_PREFIX_FORMAL, 'formal', 'KSO Formal');
}

export async function getCultureShowEventPhotos(): Promise<EventPhoto[]> {
  return photosForFolder(EVENT_PHOTOS_PREFIX_CULTURE_SHOW, 'culture-show', 'KSO Culture Show');
}

function pickEvenlySpaced<T>(items: T[], count: number): T[] {
  if (items.length === 0) return [];
  const n = Math.min(count, items.length);
  const step = Math.max(1, Math.floor(items.length / n));
  return Array.from({ length: n }, (_, i) => items[Math.min(i * step, items.length - 1)]!);
}

function basenameFromPhotoUrl(src: string): string {
  try {
    const noQuery = src.split('?')[0] ?? src;
    const base = noQuery.includes('://') ? new URL(noQuery).pathname.split('/').pop() : noQuery.split('/').pop();
    return base ?? '';
  } catch {
    return '';
  }
}

/** Homepage strip: mirrors previous formal + DSC culture-show sampling, then interleaves. */
export async function getHomepageEventPhotos(): Promise<EventPhoto[]> {
  const supabase = createStorageListClient();

  let formalPhotos: EventPhoto[] = [];
  let csPhotos: EventPhoto[] = [];

  if (supabase) {
    const allFormal = await photosFromSupabasePrefix(supabase, EVENT_PHOTOS_PREFIX_FORMAL, 'KSO Winter Formal');
    const allCs = await photosFromSupabasePrefix(
      supabase,
      EVENT_PHOTOS_PREFIX_CULTURE_SHOW,
      'KSO Culture Show',
    );
    formalPhotos = pickEvenlySpaced(allFormal, 5);
    const dsc = allCs.filter((p) => basenameFromPhotoUrl(p.src).toUpperCase().startsWith('DSC'));
    csPhotos = pickEvenlySpaced(dsc.length > 0 ? dsc : allCs, 5);
  }

  if (formalPhotos.length === 0) {
    const localFormal = photosFromLocalPublicDir('formal', 'KSO Winter Formal');
    formalPhotos = pickEvenlySpaced(localFormal, 5);
  }
  if (csPhotos.length === 0) {
    const allLocalCs = photosFromLocalPublicDir('culture-show', 'KSO Culture Show');
    const dscLocal = allLocalCs.filter((p) => basenameFromPhotoUrl(p.src).toUpperCase().startsWith('DSC'));
    csPhotos = pickEvenlySpaced(dscLocal.length > 0 ? dscLocal : allLocalCs, 5);
  }

  const mixed: EventPhoto[] = [];
  const len = Math.max(formalPhotos.length, csPhotos.length);
  for (let i = 0; i < len; i++) {
    if (i < csPhotos.length) mixed.push(csPhotos[i]!);
    if (i < formalPhotos.length) mixed.push(formalPhotos[i]!);
  }
  return mixed.slice(0, 10);
}
