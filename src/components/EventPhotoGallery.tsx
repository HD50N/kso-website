'use client';

import { useState, useEffect } from 'react';
import ScrollAnimation from '@/components/ScrollAnimation';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';

type Photo = { src: string; alt: string };

type EventPhotoGalleryProps = {
  photos: Photo[];
  /** Shown when `photos` is empty, e.g. <code>public/culture-show</code> */
  emptyFolderHint: string;
  sectionEyebrow?: string;
  sectionTitle?: string;
};

export default function EventPhotoGallery({
  photos,
  emptyFolderHint,
  sectionEyebrow = 'Photos',
  sectionTitle = 'Gallery',
}: EventPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  if (photos.length === 0) {
    return (
      <section className="py-20 lg:py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Add photos to the{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 text-xs">{emptyFolderHint}</code> folder to see them here.
          </p>
        </div>
      </section>
    );
  }

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
            {photos.map((photo, index) => (
              <ScrollAnimation key={photo.src}>
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 group">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="absolute inset-0 z-0 focus:outline-none"
                    aria-label={`Open photo ${index + 1} in gallery`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        </div>
      </section>

      {lightboxIndex !== null && (
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
              setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + photos.length) % photos.length));
            }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            <img
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].alt}
              className="max-w-full max-h-[75vh] sm:max-h-[85vh] object-contain shadow-2xl"
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <p className="text-white/50 text-xs tracking-[0.14em] uppercase">
                {lightboxIndex + 1} / {photos.length}
              </p>
              <PhotoDownloadButton imageUrl={photos[lightboxIndex].src} tone="onDark" size="md" />
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % photos.length));
            }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
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
