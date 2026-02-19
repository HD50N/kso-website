import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export const metadata = {
  title: 'Applications | UChicago KSO',
  description: 'Apply for KSO opportunities and roles.',
};

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">Applications</h1>
          </ScrollAnimation>
          <ScrollAnimation>
            <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1">
              Opportunities and roles within UChicago KSO
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <ScrollAnimation>
            <div className="modern-card p-6 sm:p-8 hover-lift shadow-lg border-2 border-black">
              <h2 className="section-title text-2xl sm:text-3xl text-black mb-3 sm:mb-4">Culture Show — Perform</h2>
              <p className="font-body text-base sm:text-lg text-gray-700 mb-6">
                Sign up to perform at Culture Show! Fill out the form below to apply.
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdQxpIpm-MJbrVMHlhyhs8wLGOESImGn2D9gmERP70ERop6Rg/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Open Culture Show form
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="modern-card p-6 sm:p-8 hover-lift shadow-lg">
              <h2 className="section-title text-2xl sm:text-3xl text-black mb-3 sm:mb-4">More opportunities</h2>
              <p className="font-body text-base sm:text-lg text-gray-700 mb-4">
                Additional applications will appear here. Check back later for other opportunities and roles within KSO.
              </p>
              <p className="font-body text-sm sm:text-base text-gray-600">
                For questions, please contact us at
                {' '}
                <a href="mailto:kso@uchicago.edu" className="text-black underline hover:no-underline">kso@uchicago.edu</a>.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
}


