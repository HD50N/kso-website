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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="modern-card p-6 sm:p-8 hover-lift shadow-lg">
              <h2 className="section-title text-2xl sm:text-3xl text-black mb-3 sm:mb-4">Coming Soon</h2>
              <p className="font-body text-base sm:text-lg text-gray-700 mb-4">
                Applications will appear here soon. Check back later for opportunities and roles within KSO.
              </p>
              <p className="font-body text-sm sm:text-base text-gray-600">
                For questions, please contact us at
                {' '}
                <a href="mailto:kso@uchicago.edu" className="text-black underline">kso@uchicago.edu</a>.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
}


