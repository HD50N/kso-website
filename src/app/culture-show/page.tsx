'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function CultureShow() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Coming Soon Section */}
      <section className="min-h-screen bg-white flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <div className="mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">🎭</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4">
                KSO Culture Show
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-8">
                Date TBD
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation>
            <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-black mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                We're currently planning our next Culture Show. Check back soon for updates on dates, performers, and ticket information.
              </p>
              <div className="text-sm text-gray-500">
                <p>For questions about the Culture Show, please contact us at:</p>
                <a 
                  href="mailto:ksouchicago@gmail.com" 
                  className="text-black hover:underline font-medium"
                >
                  ksouchicago@gmail.com
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