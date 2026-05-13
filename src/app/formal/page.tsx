import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import EventPhotoGallery from '@/components/EventPhotoGallery';
import { EVENT_PHOTOS_BUCKET, EVENT_PHOTOS_PREFIX_FORMAL } from '@/lib/event-photos';
import { getFormalEventPhotos } from '@/lib/event-photos-storage.server';

/** Revalidate gallery list from Storage / local public folder. */
export const revalidate = 300;

export default async function FormalPage() {
  const photos = await getFormalEventPhotos();
  const emptyDescription = `No photos found. Upload images to the Supabase bucket “${EVENT_PHOTOS_BUCKET}” under “${EVENT_PHOTOS_PREFIX_FORMAL}/”, or add files to public/formal for local development.`;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-gray-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <ScrollAnimation>
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                  Annual Event
                </p>
                <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                  KSO<br />Formal
                </h1>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="lg:pt-10">
                <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                  &ldquo;Thank you for celebrating with us.&rdquo;
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

      <EventPhotoGallery photos={photos} emptyDescription={emptyDescription} />

      <Footer />
    </div>
  );
}
