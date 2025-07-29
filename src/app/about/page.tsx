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
      description: "Building strong connections among Korean and Korean-American students",
      icon: "🤝"
    },
    {
      title: "Culture",
      description: "Celebrating and sharing Korean heritage and traditions",
      icon: "🇰🇷"
    },
    {
      title: "Sports",
      description: "Participating in intramural sports including our Coed IM Soccer team",
      icon: "⚽"
    },
    {
      title: "Social Events",
      description: "Organizing social gatherings, food events, and cultural celebrations",
      icon: "🍱"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">About KSO</h1>
          </ScrollAnimation>
          <ScrollAnimation>
            <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1">
              University of Chicago Korean Students Organization
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

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ScrollAnimation>
              <div>
                <h2 className="section-title text-2xl sm:text-3xl text-black mb-4 sm:mb-6">Our Mission</h2>
                <p className="font-body text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                  &ldquo;Our mission is to represent the Korean community and strengthen its voice on (and beyond) campus 
                  and to bring together those who have a common interest in Korean culture through social activities and events.&rdquo;
                </p>
                <p className="font-body text-base sm:text-lg text-gray-700">
                  KSO serves as the primary organization for Korean and Korean-American students at the University of Chicago, 
                  providing a supportive community and cultural connection for all students interested in Korean culture.
                </p>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div>
                <h2 className="section-title text-2xl sm:text-3xl text-black mb-4 sm:mb-6">What is KSO?</h2>
                <p className="font-body text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                  KSO is the University of Chicago's Korean Students Organization, dedicated to bringing together 
                  students who have a common interest in Korean culture through social activities and events.
                </p>
                <p className="font-body text-base sm:text-lg text-gray-700">
                  We organize cultural events, social gatherings, and community activities that celebrate Korean 
                  heritage and create meaningful connections among students.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Our Values */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center mb-8 sm:mb-12">
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-3 sm:mb-4">Our Values</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              The core principles that guide our community and activities
            </p>
          </ScrollAnimation>
          
          {/* Mobile: Compact Cards */}
          <div className="block md:hidden space-y-3">
            {values.map((value, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="modern-card p-4 hover-lift shadow-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4 animate-float-slow hover-rotate">{value.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{value.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{value.description}</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="text-center modern-card p-6 hover-lift shadow-lg h-full flex flex-col">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-float-slow hover-rotate flex-shrink-0">{value.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3 flex-shrink-0">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 flex-1">{value.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* History Timeline */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center mb-8 sm:mb-12">
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-3 sm:mb-4">Our History</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Key milestones and achievements in our journey
            </p>
          </ScrollAnimation>
          
          {/* Mobile: Compact List */}
          <div className="block md:hidden space-y-3">
            {milestones.map((milestone, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="modern-card p-4 hover-lift shadow-lg">
                  <div className="flex items-start">
                    <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 animate-pulse-slow hover-scale">
                      {milestone.year}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">{milestone.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Tablet/Desktop: Timeline Layout */}
          <div className="hidden md:block space-y-6 lg:space-y-8">
            {milestones.map((milestone, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 modern-card p-6 hover-lift shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="bg-black text-white rounded-full w-14 md:w-16 h-14 md:h-16 flex items-center justify-center font-bold text-base md:text-lg animate-pulse-slow hover-scale">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold text-black mb-2">{milestone.title}</h3>
                    <p className="text-sm md:text-base text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Accomplishments */}
      <section className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center mb-8 sm:mb-12">
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-3 sm:mb-4">Past Accomplishments</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Celebrating our achievements and community impact
            </p>
          </ScrollAnimation>
          
          {/* Mobile: Horizontal Scroll */}
          <div className="block md:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { number: "Annual", label: "Culture Shows" },
                { number: "Coed IM", label: "Soccer Team" },
                { number: "AAPI", label: "Month Events" },
                { number: "Winter", label: "Formal" },
                { number: "Social", label: "Gatherings" },
                { number: "Korean", label: "Community" }
              ].map((stat, index) => (
                <ScrollAnimation key={index} className={`stagger-${index + 1} flex-shrink-0`}>
                  <div className="text-center min-w-[120px]">
                    <div className="modern-card rounded-lg p-4 hover-lift shadow-lg">
                      <div className="text-2xl font-bold mb-1 text-black">{stat.number}</div>
                      <div className="text-gray-600 text-xs">{stat.label}</div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { number: "Annual", label: "Culture Shows" },
              { number: "Coed IM", label: "Soccer Team" },
              { number: "AAPI", label: "Month Events" },
              { number: "Winter", label: "Formal" },
              { number: "Social", label: "Gatherings" },
              { number: "Korean", label: "Community" }
            ].map((stat, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="text-center modern-card p-6 hover-lift shadow-lg">
                  <div className="text-2xl sm:text-3xl font-bold mb-2 text-black">{stat.number}</div>
                  <div className="text-gray-600 text-sm sm:text-base">{stat.label}</div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Get Involved */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-4 sm:mb-6">Join Our Community</h2>
            <p className="font-body text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Whether you're Korean, Korean-American, or simply interested in Korean culture, 
              there's a place for you in KSO. Join us in celebrating culture, building community, 
              and creating lasting friendships.
            </p>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:ksouchicago@gmail.com"
                className="modern-button bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 hover-lift shadow-lg"
              >
                Contact Us
              </a>
              <a 
                href="https://linkedin.com/company/uchicago-kso"
                target="_blank"
                rel="noopener noreferrer"
                className="modern-button bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 hover-lift shadow-lg"
              >
                Connect on LinkedIn
              </a>
              <Link 
                href="/culture-show"
                className="modern-button border-2 border-black text-black px-8 py-3 rounded-xl font-semibold hover:bg-black hover:text-white hover-lift"
              >
                Attend Culture Show
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
} 