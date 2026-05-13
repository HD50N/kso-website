import Link from 'next/link';
import Navigation from './Navigation';
import Footer from './Footer';

interface AuthPromptProps {
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export default function AuthPrompt({ title, description, features, ctaText, ctaHref }: AuthPromptProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <section className="border-b border-gray-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-6">
                Members Only
              </p>
              <h1 className="text-[3.5rem] sm:text-[5rem] lg:text-[6rem] font-black text-black leading-[0.87] tracking-tighter mb-8">
                {title}
              </h1>
              <p className="text-base text-gray-500 leading-relaxed max-w-md">
                {description}
              </p>
            </div>

            <div className="lg:pt-12">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <div className="divide-y divide-gray-100 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4 py-4">
                    <span className="text-gray-200 text-[10px] font-mono tabular-nums flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                href={ctaHref}
                className="inline-block bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-8 py-4 hover:bg-gray-800 transition-colors"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
