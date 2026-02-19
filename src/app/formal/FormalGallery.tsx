'use client';

import { useState, useEffect } from 'react';
import ScrollAnimation from '@/components/ScrollAnimation';

type Photo = { src: string; alt: string };

export default function FormalGallery({ photos }: { photos: Photo[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  if (photos.length === 0) {
    return (
      <section className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Add photos to the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">public/formal</code> folder to see them here.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-padding px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <h2 className="section-title text-2xl sm:text-3xl font-bold text-black text-center mb-4">
              Gallery
            </h2>
            <p className="text-gray-500 text-center text-sm sm:text-base max-w-md mx-auto mb-12 sm:mb-16">
              Click any photo to view full size
            </p>
          </ScrollAnimation>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
            {photos.map((photo, index) => (
              <ScrollAnimation key={photo.src}>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#fafafa] group shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" aria-hidden="true" />
                </button>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + photos.length) % photos.length));
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous photo"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative max-w-6xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].alt}
              className="max-w-full max-h-[75vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="mt-3 text-white/70 text-sm">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % photos.length));
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next photo"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
