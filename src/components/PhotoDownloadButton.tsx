'use client';

import { useState } from 'react';
import { downloadImageFromUrl, suggestFilenameFromUrl } from '@/lib/downloadImage';

type Tone = 'onLight' | 'onDark';
type Size = 'sm' | 'md';

const toneClass: Record<Tone, string> = {
  onLight:
    'border border-gray-200 bg-white/95 text-black shadow-sm hover:border-black hover:bg-white',
  onDark: 'border border-white/25 bg-black/50 text-white hover:bg-black/70',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
};

type PhotoDownloadButtonProps = {
  imageUrl: string;
  /** Full filename including extension; otherwise derived from the URL */
  fileName?: string;
  tone?: Tone;
  size?: Size;
  className?: string;
  label?: string;
};

export default function PhotoDownloadButton({
  imageUrl,
  fileName,
  tone = 'onLight',
  size = 'md',
  className = '',
  label = 'Download image',
}: PhotoDownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  if (!imageUrl) return null;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await downloadImageFromUrl(imageUrl, fileName || suggestFilenameFromUrl(imageUrl));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-40 ${toneClass[tone]} ${sizeClass[size]} ${className}`}
    >
      <svg className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </button>
  );
}
