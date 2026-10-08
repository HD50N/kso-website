'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ScrollAnimation from '@/components/ScrollAnimation';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';

type Photo = { src: string; alt: string };

type EventPhotoGalleryProps = {
  photos: Photo[];
  /** @deprecated Unused — empty galleries render nothing. Kept optional for call-site compatibility. */
  emptyDescription?: string;
  sectionEyebrow?: string;
  sectionTitle?: string;
};

/** Initial grid batch — avoids fetching every full original on first paint/scroll. */
const PAGE_SIZE = 12;

export default function EventPhotoGallery({
  photos,
  sectionEyebrow = 'Photos',
  sectionTitle = 'Gallery',
}: EventPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  /** Hide tiles whose remote file 404s (e.g. deleted from Storage). */
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(() => new Set());

  const workingPhotos = photos.filter((p) => !failedSrcs.has(p.src));
  const visiblePhotos = workingPhotos.slice(0, visibleCount);
  const hasMore = visibleCount < workingPhotos.length;

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i === null || i <= 0 ? i : i - 1));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => {
          if (i === null || i >= workingPhotos.length - 1) return i;
          return i + 1;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, workingPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (lightboxIndex >= workingPhotos.length) {
      setLightboxIndex(workingPhotos.length > 0 ? workingPhotos.length - 1 : null);
      return;
    }
    setVisibleCount((n) => Math.max(n, Math.min(lightboxIndex + 1, workingPhotos.length)));
  }, [lightboxIndex, workingPhotos.length]);

  function markFailed(src: string) {
    setFailedSrcs((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }

  if (workingPhotos.length === 0) return null;

  return (
    <>
      <section className="py-20 lg:py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">{sectionEyebrow}</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">{sectionTitle}</h2>
            </div>
          </ScrollAnimation>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
            {visiblePhotos.map((photo, index) => (
              <ScrollAnimation key={photo.src}>
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 group">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="absolute inset-0 z-0 focus:outline-none"
                    aria-label={`Open photo ${index + 1} in gallery`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      quality={65}
                      loading="lazy"
                      onError={() => markFailed(photo.src)}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="absolute bottom-2 right-2 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                    <PhotoDownloadButton imageUrl={photo.src} tone="onLight" size="sm" />
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => Math.min(n + PAGE_SIZE, workingPhotos.length))}
                className="border border-gray-200 px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-gray-600 hover:border-black hover:text-black transition-colors"
              >
                Load more ({workingPhotos.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && workingPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev === null || prev <= 0 ? prev : prev - 1));
            }}
            disabled={lightboxIndex <= 0}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            className="relative max-w-6xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-[min(100vw-2rem,1400px)] h-[min(85vh,920px)] mx-auto">
              <Image
                src={workingPhotos[lightboxIndex].src}
                alt={workingPhotos[lightboxIndex].alt}
                fill
                sizes="(max-width: 1400px) 100vw, 1400px"
                quality={75}
                priority
                onError={() => markFailed(workingPhotos[lightboxIndex].src)}
                className="object-contain shadow-2xl"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <p className="text-white/50 text-xs tracking-[0.14em] uppercase">
                {lightboxIndex + 1} / {workingPhotos.length}
              </p>
              <PhotoDownloadButton imageUrl={workingPhotos[lightboxIndex].src} tone="onDark" size="md" />
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev === null || prev >= workingPhotos.length - 1 ? prev : prev + 1,
              );
            }}
            disabled={lightboxIndex >= workingPhotos.length - 1}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
