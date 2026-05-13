/** Strip characters that are invalid in filenames on common filesystems. */
export function sanitizeFilename(name: string): string {
  const trimmed = name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
  return trimmed.slice(0, 120) || 'photo';
}

/**
 * Pick a reasonable filename from a URL path (handles relative `/foo/bar.jpg` and absolute URLs).
 */
export function suggestFilenameFromUrl(url: string, fallback = 'kso-photo.jpg'): string {
  try {
    const noQuery = url.split('?')[0] || url;
    const pathOnly = noQuery.includes('://') ? new URL(noQuery).pathname : noQuery;
    const parts = pathOnly.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last) return fallback;
    const name = decodeURIComponent(last);
    if (/\.(jpe?g|png|gif|webp|avif)$/i.test(name)) return sanitizeFilename(name);
    return `${sanitizeFilename(name)}.jpg`;
  } catch {
    return fallback;
  }
}

/**
 * Download an image in the browser. Uses fetch+blob when CORS allows; otherwise falls back to opening the URL.
 */
export async function downloadImageFromUrl(url: string, suggestedName?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!url) return;

  const name = sanitizeFilename(suggestedName || suggestFilenameFromUrl(url));

  const absoluteUrl =
    url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')
      ? url
      : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;

  try {
    const res = await fetch(absoluteUrl, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const a = document.createElement('a');
    a.href = absoluteUrl;
    a.download = name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
