import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export const metadata = {
  title: 'Applications | UChicago KSO',
  description: 'Apply for KSO opportunities and roles.',
};

export default function ApplicationsPage() {
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
                  University of Chicago · KSO
                </p>
                <h1 className="text-[3rem] sm:text-[4.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-black text-black leading-[0.87] tracking-tighter">
                  Applications
                </h1>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="lg:pt-20">
                <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                  &ldquo;Get involved — perform, lead, and shape what KSO does next.&rdquo;
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Opportunities and roles within UChicago KSO. Open forms and deadlines will be listed below as they go live.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation>
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-2">Open Now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">Opportunities</h2>
            </div>
          </ScrollAnimation>

          <div className="divide-y divide-gray-100">
            <ScrollAnimation>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 py-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-gray-200 text-[10px] font-mono tabular-nums">01</span>
                    <h3 className="text-xl font-black text-black tracking-tight">Culture Show — Perform</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xl pl-10">
                    Sign up to perform at Culture Show. Fill out the form to apply for a performance slot. Open to all KSO members and interested students.
                  </p>
                </div>
                <div className="pl-10 sm:pl-0 flex-shrink-0">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdQxpIpm-MJbrVMHlhyhs8wLGOESImGn2D9gmERP70ERop6Rg/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-8 border border-gray-200 px-6 py-4 hover:border-black hover:bg-black group transition-colors duration-150"
                  >
                    <span className="text-sm font-semibold tracking-tight text-black group-hover:text-white transition-colors whitespace-nowrap">
                      Open Form
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-white flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 py-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-gray-200 text-[10px] font-mono tabular-nums">02</span>
                    <h3 className="text-xl font-black text-black tracking-tight">More Opportunities</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xl pl-10">
                    Additional applications will appear here. Check back later for other opportunities and roles within KSO. Questions? Contact us at{' '}
                    <a href="mailto:ksouchicago@gmail.com" className="text-black underline underline-offset-2 hover:no-underline">
                      ksouchicago@gmail.com
                    </a>.
                  </p>
                </div>
                <div className="pl-10 sm:pl-0 flex-shrink-0">
                  <span className="flex items-center gap-2 px-6 py-4 border border-gray-100 text-sm text-gray-300 tracking-tight">
                    Coming Soon
                  </span>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
