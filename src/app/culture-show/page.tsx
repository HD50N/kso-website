import { readdirSync } from 'fs';
import path from 'path';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import EventPhotoGallery from '@/components/EventPhotoGallery';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function getCultureShowPhotos(): { src: string; alt: string }[] {
  const dir = path.join(process.cwd(), 'public', 'culture-show');
  try {
    const files = readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort();
    return files.map((name) => ({ src: `/culture-show/${name}`, alt: 'KSO Culture Show' }));
  } catch {
    return [];
  }
}

export default function CultureShowPage() {
  const photos = getCultureShowPhotos();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-gray-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <ScrollAnimation>
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                  Annual Event
                </p>
                <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                  Culture<br />Show
                </h1>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="lg:pt-20">
                <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                  &ldquo;Celebrating Korean culture through performance, art, and community.&rdquo;
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  KSO Culture Show is one of our biggest annual events — a celebration of Korean culture featuring student
                  performances, music, dance, and more.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  More photos or questions? Reach out to{' '}
                  <a
                    href="https://www.instagram.com/uchicagokso?utm_source=ig_web_button_share_sheet&igsh=MWEzNTJibndqMGJ0eA=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-medium underline underline-offset-2 hover:no-underline"
                  >
                    @uchicagokso
                  </a>{' '}
                  on Instagram.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      <EventPhotoGallery
        photos={photos}
        emptyFolderHint="public/culture-show"
        sectionEyebrow="Photos"
        sectionTitle="Gallery"
      />

      {/* Coming Soon */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
              <div>
                <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">Status</p>
                <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-6">Coming Soon</h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-md mb-8">
                  We&apos;re currently planning our next Culture Show. Check back soon for updates on dates, performers,
                  and ticket information.
                </p>
                <div className="divide-y divide-gray-100">
                  <div className="flex items-start gap-8 py-5">
                    <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold flex-shrink-0 w-20">
                      Date
                    </span>
                    <span className="text-sm text-gray-600">TBD — Check back for updates</span>
                  </div>
                  <div className="flex items-start gap-8 py-5">
                    <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold flex-shrink-0 w-20">
                      Venue
                    </span>
                    <span className="text-sm text-gray-600">University of Chicago Campus</span>
                  </div>
                  <div className="flex items-start gap-8 py-5">
                    <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold flex-shrink-0 w-20">
                      Apply
                    </span>
                    <span className="text-sm text-gray-600">Performer applications open soon</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <a
                  href="https://www.instagram.com/uchicagokso?utm_source=ig_web_button_share_sheet&igsh=MWEzNTJibndqMGJ0eA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full border border-gray-200 px-6 py-5 hover:border-black hover:bg-black group transition-colors duration-150"
                >
                  <span className="text-sm font-semibold tracking-tight text-black group-hover:text-white transition-colors">
                    Follow @uchicagokso for Updates
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-white flex-shrink-0 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
                <a
                  href="mailto:ksouchicago@gmail.com"
                  className="flex items-center justify-between w-full border border-gray-200 px-6 py-5 hover:border-black hover:bg-black group transition-colors duration-150"
                >
                  <span className="text-sm font-semibold tracking-tight text-black group-hover:text-white transition-colors">
                    Email Us with Questions
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-white flex-shrink-0 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
                <a
                  href="/applications"
                  className="flex items-center justify-between w-full bg-[#CD2E3A] px-6 py-5 group hover:bg-[#b02633] transition-colors duration-150"
                >
                  <span className="text-sm font-semibold tracking-tight text-white">Apply to Perform</span>
                  <svg
                    className="w-4 h-4 text-white opacity-70 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
}
