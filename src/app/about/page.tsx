'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Link from 'next/link';

export default function About() {
  const milestones = [
    {
      year: "2024",
      title: "AAPI Month Celebration",
      description: "Celebrated AAPI month with @thefaceshop, @uchicagoakdphi, and @uchicagokso, featuring bento boxes from @morikawabento."
    },
    {
      year: "2024",
      title: "Winter Formal",
      description: "Hosted our annual KSO 2024-2025 Winter Formal, bringing together the Korean community for celebration."
    },
    {
      year: "2024",
      title: "Coed IM Soccer",
      description: "Congratulations to our KSO Coed IM Soccer team on completing another successful season."
    },
    {
      year: "2024",
      title: "Social Events",
      description: "Organized various social events including s'mores and drinks at the Point with HKSA, and community gatherings."
    },
    {
      year: "2024",
      title: "Culture Show",
      description: "Preparing for our annual KSO Culture Show, one of our biggest events celebrating Korean culture and performances."
    }
  ];

  const values = [
    {
      title: "Community",
      korean: "공동체",
      description: "Building strong connections among Korean and Korean-American students"
    },
    {
      title: "Culture",
      korean: "문화",
      description: "Celebrating and sharing Korean heritage and traditions"
    },
    {
      title: "Sports",
      korean: "스포츠",
      description: "Participating in intramural sports including our Coed IM Soccer team"
    },
    {
      title: "Social Events",
      korean: "사교 행사",
      description: "Organizing social gatherings, food events, and cultural celebrations"
    }
  ];

  const accomplishments = [
    { label: 'Culture Shows', sub: 'Annual' },
    { label: 'Soccer Team', sub: 'Coed IM' },
    { label: 'AAPI Events', sub: 'Month' },
    { label: 'Winter Formal', sub: 'Annual' },
    { label: 'Social Gatherings', sub: 'Regular' },
    { label: 'Korean Community', sub: 'Building' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ── Hero — editorial split ── */}
      <section className="border-b border-gray-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <ScrollAnimation>
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-1.5">
                  University of Chicago · Est. 1976
                </p>
                <p className="text-[11px] text-gray-300 font-medium tracking-widest mb-10">한국 문화 동아리 · 시카고 대학교</p>
                <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                  About<br />KSO
                </h1>
                <p className="text-[#CD2E3A] text-lg font-medium mt-4 tracking-wider">소개</p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="lg:pt-10">
                <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                  &ldquo;Our mission is to represent the Korean community and strengthen its voice on (and beyond) campus and to bring together those who have a common interest in Korean culture through social activities and events.&rdquo;
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  KSO serves as the primary organization for Korean and Korean-American students at the University of Chicago, providing a supportive community and cultural connection for all students interested in Korean culture.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">가치관 · Principles</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Our Values</h2>
            </div>
          </ScrollAnimation>

          {/* Mobile: horizontal scroll pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 md:hidden scrollbar-hide">
            {values.map((value, index) => (
              <ScrollAnimation key={index} className="flex-shrink-0">
                <div className="border border-gray-200 px-5 py-4 min-w-[200px] max-w-[220px]">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <div className="text-xs font-black text-black tracking-tight">{value.title}</div>
                    <div className="text-[10px] text-[#CD2E3A] font-medium">{value.korean}</div>
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">{value.description}</div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Desktop: 2×2 bordered grid */}
          <div className="hidden md:grid md:grid-cols-2 border border-gray-100">
            {values.map((value, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div
                  className={`px-8 py-8 ${index % 2 === 0 ? 'border-r border-gray-100' : ''} ${index < 2 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-base font-black text-black tracking-tight">{value.title}</h3>
                    <span className="text-[11px] text-[#CD2E3A] font-medium">{value.korean}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── History Timeline ── */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="mb-14">
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">역사 · History</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Our History</h2>
            </div>
          </ScrollAnimation>

          <div className="divide-y divide-gray-100">
            {milestones.map((milestone, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="flex items-start gap-8 sm:gap-16 py-7 sm:py-8 -mx-2 px-2 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-14 sm:w-20 pt-0.5">
                    <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-gray-200 text-[10px] font-mono tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">{milestone.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xl">{milestone.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accomplishments ── */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="mb-14">
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">Achievements</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Past Accomplishments</h2>
            </div>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="grid grid-cols-2 sm:grid-cols-3 border border-gray-100 divide-x divide-y divide-gray-100">
              {accomplishments.map((stat, i) => (
                <div key={i} className="text-center py-9 px-4">
                  <div className="text-sm sm:text-base font-black text-black tracking-tight">{stat.label}</div>
                  <div className="text-[10px] text-gray-400 tracking-[0.16em] uppercase font-medium mt-1.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ── Get Involved ── */}
      <section className="py-14 lg:py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <ScrollAnimation>
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-4">함께하기 · Join Us</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight mb-2 leading-none">
                Join Our<br />Community
              </h2>
              <p className="text-[#CD2E3A] text-base font-medium mb-6 tracking-wider">우리 공동체에 함께하세요</p>
              <p className="text-gray-500 text-base leading-relaxed max-w-md">
                Whether you&apos;re Korean, Korean-American, or simply interested in Korean culture,
                there&apos;s a place for you in KSO. Join us in celebrating culture, building community,
                and creating lasting friendships.
              </p>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="space-y-2.5">
                <a
                  href="mailto:ksouchicago@gmail.com"
                  className="flex items-center justify-between w-full border border-gray-200 px-6 py-5 hover:border-black hover:bg-black group transition-colors duration-150"
                >
                  <span className="text-sm font-semibold tracking-tight text-black group-hover:text-white transition-colors">
                    Contact Us
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-white flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/uchicago-kso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full border border-gray-200 px-6 py-5 hover:border-black hover:bg-black group transition-colors duration-150"
                >
                  <span className="text-sm font-semibold tracking-tight text-black group-hover:text-white transition-colors">
                    Connect on LinkedIn
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-white flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
                <Link
                  href="/culture-show"
                  className="flex items-center justify-between w-full bg-[#CD2E3A] px-6 py-5 group hover:bg-[#b02633] transition-colors duration-150"
                >
                  <span className="text-sm font-semibold tracking-tight text-white">
                    Attend Culture Show
                  </span>
                  <svg className="w-4 h-4 text-white opacity-70 group-hover:opacity-100 flex-shrink-0 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
