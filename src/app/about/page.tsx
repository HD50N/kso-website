import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
    },
    {
      year: "Ongoing",
      title: "Community Building",
      description: "Continuing to represent the Korean community and strengthen its voice on campus and beyond."
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
      <section className="bg-korean-gradient text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in">About KSO</h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-white opacity-90 px-4 animate-slide-in-up stagger-1">
            시카고 대학교 한국 학생 동아리
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="section-title text-2xl sm:text-3xl text-gray-900 mb-4 sm:mb-6">Our Mission</h2>
              <p className="font-body text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                "Our mission is to represent the Korean community and strengthen its voice on (and beyond) campus 
                and to bring together those who have a common interest in Korean culture through social activities and events."
              </p>
              <p className="font-body text-base sm:text-lg text-gray-700">
                KSO serves as the primary organization for Korean and Korean-American students at the University of Chicago, 
                providing a supportive community and cultural connection for all students interested in Korean culture.
              </p>
            </div>
            <div>
              <h2 className="section-title text-2xl sm:text-3xl text-gray-900 mb-4 sm:mb-6">What is KSO?</h2>
              <p className="font-body text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
                KSO is the University of Chicago's Korean Students Organization, dedicated to bringing together 
                students who have a common interest in Korean culture through social activities and events.
              </p>
              <p className="font-body text-base sm:text-lg text-gray-700">
                We organize cultural events, social gatherings, and community activities that celebrate Korean 
                heritage and create meaningful connections among students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">Our Values</h2>
          
          {/* Mobile: Compact Cards */}
          <div className="block md:hidden space-y-3">
            {values.map((value, index) => (
              <div key={index} className="modern-card p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-4 animate-float-slow hover-rotate">{value.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{value.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-float-slow hover-rotate">{value.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">Our History</h2>
          
          {/* Mobile: Compact List */}
          <div className="block md:hidden space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="modern-card p-4">
                <div className="flex items-start">
                  <div className="bg-korean-red text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 animate-pulse-slow hover-scale">
                    {milestone.year}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Timeline Layout */}
          <div className="hidden md:block space-y-6 lg:space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div className="bg-korean-red text-white rounded-full w-14 md:w-16 h-14 md:h-16 flex items-center justify-center font-bold text-base md:text-lg animate-pulse-slow hover-scale">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accomplishments */}
      <section className="section-padding bg-korean-red text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Past Accomplishments</h2>
          
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
                <div key={index} className="flex-shrink-0 text-center min-w-[120px]">
                  <div className="glass rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">{stat.number}</div>
                    <div className="text-white opacity-90 text-xs">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-2">Annual</div>
              <div className="text-white opacity-90 text-sm sm:text-base">Culture Shows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-2">Coed IM</div>
              <div className="text-white opacity-90 text-sm sm:text-base">Soccer Team</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-2">AAPI</div>
              <div className="text-white opacity-90 text-sm sm:text-base">Month Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-2">Winter</div>
              <div className="text-white opacity-90 text-sm sm:text-base">Formal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold mb-2">Social</div>
              <div className="text-white opacity-90 text-sm sm:text-base">Gatherings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Korean</div>
              <div className="text-white opacity-90 text-sm sm:text-base">Community</div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Community</h2>
          <p className="text-lg text-gray-700 mb-8">
            Whether you're Korean, Korean-American, or simply interested in Korean culture, 
            there's a place for you in KSO. Join us in celebrating culture, building community, 
            and creating lasting friendships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/forms"
              className="bg-korean-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Join KSO
            </a>
            <a 
              href="/culture-show"
              className="border-2 border-korean-red korean-red px-8 py-3 rounded-lg font-semibold hover:bg-korean-red hover:text-white transition-colors"
            >
              Attend Culture Show
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 