import { readdirSync } from 'fs';
import path from 'path';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import FormalGallery from './FormalGallery';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function getFormalPhotos(): { src: string; alt: string }[] {
  const formalDir = path.join(process.cwd(), 'public', 'formal');
  try {
    const files = readdirSync(formalDir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort();
    return files.map((name) => ({ src: `/formal/${name}`, alt: 'KSO Formal' }));
  } catch {
    return [];
  }
}

export default function FormalPage() {
  const photos = getFormalPhotos();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-korean-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <ScrollAnimation>
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl" aria-hidden="true">🎩</span>
            </div>
            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl text-white mb-4 drop-shadow-sm">
              KSO Formal
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-body max-w-xl mx-auto mb-6">
              Thank you for celebrating with us
            </p>
            <p className="text-sm sm:text-base text-white/80 font-body">
              More photos or questions? Reach out to{' '}
              <a
                href="https://instagram.com/uchicagokso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-medium hover:underline underline-offset-2"
              >
                @uchicagokso
              </a>{' '}
              on Instagram
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <FormalGallery photos={photos} />

      <Footer />
    </div>
  );
}
