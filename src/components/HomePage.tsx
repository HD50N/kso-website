'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Link from 'next/link';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';
import SocialBrandIcon, { type SocialBrand } from '@/components/SocialBrandIcon';
import { isRemoteImageUrl } from '@/lib/utils';

type SocialLink = {
  name: string;
  korean: string;
  href: string;
  brand: SocialBrand;
};

type Photo = { src: string; alt: string };

export default function HomePage({ homepagePhotos }: { homepagePhotos: Photo[] }) {

  const upcomingEvents = [
    {
      title: "General Meeting",
      date: "Week 1–2",
      description: "Join us for our general meeting to kick off winter quarter and learn about upcoming events.",
    },
    {
      title: "Family Event",
      date: "Week 3–4",
      description: "A special event for KSO families to bond and celebrate our community together.",
    },
    {
      title: "Winter Formal",
      date: "Week 5",
      description: "Join us for our annual Winter Formal — a night of celebration, dancing, and community.",
    },
    {
      title: "TBD",
      date: "Week 5",
      description: "Details to be announced.",
    },
    {
      title: "Fundraiser",
      date: "Week 6–7",
      description: "Support KSO through our fundraising event. Details to be announced.",
    },
  ];

  const socialLinks: SocialLink[] = [
    { name: 'Instagram', korean: '인스타그램', href: 'https://www.instagram.com/uchicagokso?utm_source=ig_web_button_share_sheet&igsh=MWEzNTJibndqMGJ0eA==', brand: 'instagram' },
    { name: 'Facebook', korean: '페이스북', href: 'https://www.facebook.com/share/g/16cdxUAiLv/', brand: 'facebook' },
    { name: 'LinkedIn', korean: '링크드인', href: 'https://linkedin.com/company/uchicago-kso', brand: 'linkedin' },
    { name: 'Email', korean: '이메일', href: 'mailto:ksouchicago@gmail.com', brand: 'email' },
  ];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft')
        setLightboxIndex((i) => (i === null ? null : (i - 1 + homepagePhotos.length) % homepagePhotos.length));
      if (e.key === 'ArrowRight')
        setLightboxIndex((i) => (i === null ? null : (i + 1) % homepagePhotos.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, homepagePhotos.length]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ── Hero: fill viewport below nav (stripe 3px + h-16 + banner h-9) ── */}
      <section className="relative min-h-[calc(100.5svh-6.5rem)] flex items-center border-b border-gray-100 overflow-hidden">
        {/* Bold red accent column — desktop only */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-[28%] bg-[#CD2E3A] overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 select-none pointer-events-none">
            {/* Taegeuk ghost */}
            <svg viewBox="0 0 100 100" className="w-44 h-44 opacity-[0.18]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g transform="rotate(18 50 50)">
                <g transform="translate(100 0) scale(-1 1)">
                  <circle cx="50" cy="50" r="49" fill="white"/>
                  <g transform="rotate(-90 50 50)">
                    <path d="M50,1 A49,49 0 0,0 50,99 A24.5,24.5 0 0,1 50,50 A24.5,24.5 0 0,0 50,1 Z" fill="#002060"/>
                  </g>
                </g>
              </g>
            </svg>
            {/* Korean flag trigrams: ☰ ☵ / ☲ ☷ */}
            <div className="grid grid-cols-2 gap-5 opacity-[0.22]">
              <span className="text-white text-3xl text-center leading-none">☰</span>
              <span className="text-white text-3xl text-center leading-none">☵</span>
              <span className="text-white text-3xl text-center leading-none">☲</span>
              <span className="text-white text-3xl text-center leading-none">☷</span>
            </div>
            <p className="text-white/20 text-[9px] tracking-[0.3em] uppercase font-medium">한국 문화 동아리</p>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-16 w-full py-24 lg:py-0">
          <div className="lg:w-[68%]">
            <ScrollAnimation>
              <div className="mb-10 lg:mb-14">
                <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-1.5">
                  University of Chicago · Est. 1976
                </p>
                <p className="text-[11px] text-gray-300 font-medium tracking-widest">한국 문화 동아리 · 시카고 대학교</p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <h1 className="text-[4rem] sm:text-[6rem] lg:text-[6rem] xl:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter mb-10 lg:mb-14">
                Korean<br />Students<br />Organization
              </h1>
            </ScrollAnimation>
            <ScrollAnimation>
              <p className="text-gray-500 text-base sm:text-lg max-w-md leading-relaxed mb-10 lg:mb-14">
                Representing the Korean community and strengthening its voice on campus and beyond.
              </p>
            </ScrollAnimation>
            <ScrollAnimation>
              <Link href="#winter-events">
                <span className="inline-block border border-black text-black text-[10px] tracking-[0.22em] uppercase font-semibold px-8 py-4 hover:bg-black hover:text-white transition-colors cursor-pointer">
                  Explore Events
                </span>
              </Link>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── Formal Highlights ── */}
      {homepagePhotos.length > 0 && (
        <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100" id="formal-highlights">
          <div className="max-w-7xl mx-auto">
            <ScrollAnimation>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">Gallery</p>
                  <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">2025–2026 Highlights</h2>
                </div>
                <div className="hidden sm:flex items-center gap-5">
                  <Link
                    href="/formal"
                    className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 hover:text-black transition-colors"
                  >
                    Formal →
                  </Link>
                  <Link
                    href="/culture-show"
                    className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 hover:text-black transition-colors"
                  >
                    Culture Show →
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 auto-rows-[minmax(140px,1fr)]">
                {homepagePhotos.map((photo, index) => (
                  <div
                    key={photo.src}
                    className={`relative overflow-hidden bg-gray-100 group ${
                      index === 0
                        ? 'col-span-2 row-span-2 min-h-[200px] sm:min-h-[280px]'
                        : 'aspect-[4/3]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className="absolute inset-0 z-0 focus:outline-none cursor-zoom-in"
                      aria-label={`View ${photo.alt} photo ${index + 1}`}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes={
                          index === 0
                            ? '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw'
                            : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                        }
                        quality={78}
                        priority={index === 0}
                        loading={index === 0 ? undefined : 'lazy'}
                        unoptimized={isRemoteImageUrl(photo.src)}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </button>
                    <div className="absolute bottom-2 right-2 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                      <PhotoDownloadButton imageUrl={photo.src} tone="onLight" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="sm:hidden mt-6 flex items-center justify-center gap-6">
                <Link href="/formal" className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 hover:text-black transition-colors">
                  Formal →
                </Link>
                <Link href="/culture-show" className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 hover:text-black transition-colors">
                  Culture Show →
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </section>
      )}

      {/* ── Events Timeline ── */}
      <section id="winter-events" className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="mb-14">
              <div className="flex gap-1 mb-4">
                <div className="w-5 h-[2px] bg-[#CD2E3A]" />
                <div className="w-5 h-[2px] bg-[#0047A0]" />
              </div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">일정 · Schedule</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Winter 2025–2026</h2>
              <p className="text-sm text-gray-400 mt-1.5">겨울 학기</p>
            </div>
          </ScrollAnimation>

          <div className="divide-y divide-gray-100">
            {upcomingEvents.map((event, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="flex items-start gap-6 sm:gap-12 py-7 sm:py-8 -mx-2 px-2 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-20 sm:w-28 pt-0.5">
                    <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold leading-relaxed">
                      {event.date}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-gray-200 text-[10px] font-mono tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">{event.title}</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-lg">{event.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sponsors ── */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium text-center mb-14">
              Our Sponsors
            </p>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-28">
              <div className="text-center">
                <img
                  src="/weee!.jpg"
                  alt="Weee!"
                  className="w-20 h-20 object-contain mx-auto mb-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
                <div className="text-sm font-bold text-black tracking-tight">Weee!</div>
                <div className="text-xs text-gray-400 mt-1">Food & Grocery Sponsor</div>
              </div>
              <div className="text-center">
                <img
                  src="/thefaceshop.jpg"
                  alt="The Face Shop"
                  className="w-20 h-20 object-contain mx-auto mb-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
                <div className="text-sm font-bold text-black tracking-tight">The Face Shop</div>
                <div className="text-xs text-gray-400 mt-1">Clean Beauty Sponsor</div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── Mission Quote ── */}
      <section className="py-28 sm:py-36 lg:py-44 px-6 lg:px-16 border-b border-gray-100">
        <ScrollAnimation>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-8">
              <div className="w-6 h-[2px] bg-[#CD2E3A]" />
              <div className="w-6 h-[2px] bg-[#0047A0]" />
            </div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-gray-300 font-medium mb-10">우리의 사명 · Our Mission</p>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light text-black leading-snug italic tracking-tight mb-8">
              &ldquo;Our mission is to represent the Korean community and strengthen its voice on campus and beyond — bringing together those who share a common interest in Korean culture.&rdquo;
            </blockquote>
            <div className="flex justify-center gap-1 mt-2 mb-4">
              <div className="w-6 h-[2px] bg-[#CD2E3A]" />
              <div className="w-6 h-[2px] bg-[#0047A0]" />
            </div>
            <p className="text-xs text-gray-400 tracking-[0.18em] uppercase">— 한국 문화 동아리 · University of Chicago · Est. 1976</p>
          </div>
        </ScrollAnimation>
      </section>

      {/* ── Impact ── */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="flex justify-center gap-1 mb-4">
              <div className="w-5 h-[2px] bg-[#CD2E3A]" />
              <div className="w-5 h-[2px] bg-[#0047A0]" />
            </div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium text-center mb-14">
              우리의 공동체 · Our Community
            </p>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-gray-100 divide-y divide-x lg:divide-y-0 divide-gray-100">
              {[
                { label: 'KSO', sub: 'Community', korean: '공동체' },
                { label: 'Culture', sub: 'Show', korean: '문화쇼' },
                { label: 'AAPI', sub: 'Events', korean: '행사' },
                { label: 'Alumni', sub: 'Network', korean: '동문' },
              ].map((stat, i) => (
                <div key={i} className="text-center py-10 px-6">
                  <div className="text-xl sm:text-2xl font-black text-black tracking-tight mb-1">{stat.label}</div>
                  <div className="text-[10px] text-gray-400 tracking-[0.16em] uppercase font-medium mb-1">{stat.sub}</div>
                  <div className="text-[10px] text-[#CD2E3A] font-medium">{stat.korean}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── Connect ── */}
      <section className="py-20 lg:py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">Social</p>
                <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Connect With Us</h2>
                <p className="text-base text-[#CD2E3A] font-medium mt-1.5 tracking-wider">연결하기</p>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Stay updated with our latest events, announcements, and community highlights.
              </p>
            </div>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-100 divide-x divide-y sm:divide-y-0 divide-gray-100">
              {socialLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className={`flex flex-col items-center justify-center py-10 px-4 text-center group transition-colors duration-200 ${
                    index < 2 ? 'hover:bg-[#CD2E3A]' : 'hover:bg-[#0047A0]'
                  }`}
                >
                  <SocialBrandIcon
                    brand={link.brand}
                    className="w-8 h-8 mb-3 text-gray-500 group-hover:text-white transition-colors"
                  />
                  <span className="text-[10px] text-gray-300 group-hover:text-white/70 transition-colors mb-1 tracking-wider">{link.korean}</span>
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-gray-500 group-hover:text-white transition-colors">
                    {link.name}
                  </span>
                  <svg className="w-3.5 h-3.5 mt-2.5 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              ))}
            </div>
          </ScrollAnimation>
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
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i === null ? null : (i - 1 + homepagePhotos.length) % homepagePhotos.length)); }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative max-w-6xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full max-w-[min(100vw-2rem,1400px)] h-[min(85vh,920px)] mx-auto">
              <Image
                src={homepagePhotos[lightboxIndex].src}
                alt={homepagePhotos[lightboxIndex].alt}
                fill
                sizes="100vw"
                quality={85}
                priority
                unoptimized={isRemoteImageUrl(homepagePhotos[lightboxIndex].src)}
                className="object-contain shadow-2xl"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <p className="text-white/50 text-xs tracking-[0.14em] uppercase">
                {lightboxIndex + 1} / {homepagePhotos.length}
              </p>
              <PhotoDownloadButton imageUrl={homepagePhotos[lightboxIndex].src} tone="onDark" size="md" />
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i === null ? null : (i + 1) % homepagePhotos.length)); }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
