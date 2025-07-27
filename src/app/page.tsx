import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Link from 'next/link';

export default function Home() {
  const upcomingEvents = [
    {
      title: "KSO Culture Show",
      date: "Coming Soon",
      description: "Our biggest event of the year featuring traditional and modern Korean performances, food, and cultural exhibits.",
      image: "/placeholder-culture-show.jpg"
    },
    {
      title: "Winter Formal",
      date: "2024-2025",
      description: "Join us for our annual winter formal celebration with the Korean community.",
      image: "/placeholder-formal.jpg"
    },
    {
      title: "AAPI Month Celebration",
      date: "May 2024",
      description: "Celebrate AAPI month with KSO, featuring special events and cultural activities.",
      image: "/placeholder-aapi.jpg"
    }
  ];

  const socialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/uchicagokso', icon: '📸' },
    { name: 'Facebook', href: 'https://facebook.com/ksouchicago', icon: '📘' },
    { name: 'Email', href: 'mailto:kso@uchicago.edu', icon: '✉️' }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-korean-gradient text-white overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <ScrollAnimation className="text-center">
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 sm:mb-6 animate-bounce-in">
              Korean Students Organization
            </h1>
            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 text-white animate-slide-in-up stagger-1">
              University of Chicago
            </p>
            <p className="font-body text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto text-white animate-fade-in stagger-2 px-4">
              Representing the Korean community and strengthening its voice on campus and beyond
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-scale-in stagger-3 px-4">
              <Link 
                href="/about"
                className="modern-button bg-white korean-red px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-100 hover-lift hover-pulse shadow-lg text-sm sm:text-base animate-float-slow"
              >
                Learn More
              </Link>
              <Link 
                href="/forms"
                className="modern-button border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:korean-red hover-lift hover-glow animate-float-slow"
              >
                Join Us
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="section-padding bg-gray-50">
        <ScrollAnimation className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold gradient-text mb-8">Our Mission</h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            "Our mission is to represent the Korean community and strengthen its voice on (and beyond) campus 
            and to bring together those who have a common interest in Korean culture through social activities and events."
          </p>
        </ScrollAnimation>
      </section>

      {/* Upcoming Events */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl gradient-text mb-3 sm:mb-4">Upcoming Events</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">Check out our latest events and stay connected with the Korean community</p>
          </ScrollAnimation>
          
          {/* Mobile: Compact List View */}
          <div className="block sm:hidden space-y-3">
            {upcomingEvents.map((event, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="modern-card hover-lift shadow-md">
                  <div className="flex items-center p-4">
                                      <div className="flex-shrink-0 w-12 h-12 bg-korean-gradient-gold rounded-lg flex items-center justify-center mr-4 animate-pulse-slow">
                    <span className="text-white text-xl animate-wave">🎭</span>
                  </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="card-title text-base font-semibold text-gray-900 truncate">{event.title}</h3>
                      <p className="korean-red text-sm font-medium">{event.date}</p>
                      <p className="text-gray-600 text-xs mt-1 line-clamp-2">{event.description}</p>
                    </div>
                    <Link 
                      href="/culture-show"
                      className="flex-shrink-0 korean-red text-sm font-semibold hover:text-red-700 transition-colors"
                    >
                      →
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Tablet/Desktop: Card Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {upcomingEvents.map((event, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="modern-card hover-lift overflow-hidden shadow-lg">
                  <div className="h-40 sm:h-48 bg-korean-gradient-gold flex items-center justify-center relative overflow-hidden animate-shimmer">
                    <span className="text-white text-4xl sm:text-6xl animate-float-fast">🎭</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="card-title text-lg sm:text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
                    <p className="korean-red font-medium mb-3 sm:mb-4 text-base sm:text-lg">{event.date}</p>
                    <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{event.description}</p>
                    <Link 
                      href="/culture-show"
                      className="korean-red font-semibold hover:text-red-700 transition-colors inline-flex items-center group text-sm sm:text-base hover-scale"
                    >
                      Learn More 
                      <span className="ml-2 group-hover:translate-x-1 transition-transform animate-pulse">→</span>
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="section-padding bg-korean-red text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="section-title text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 sm:mb-4">Our Impact</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-4">Celebrating decades of community building and cultural celebration</p>
          </ScrollAnimation>
          
          {/* Mobile: Compact Horizontal Scroll */}
          <div className="block sm:hidden">
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { number: "KSO", label: "Community" },
                { number: "Culture", label: "Show" },
                { number: "Coed IM", label: "Soccer" },
                { number: "AAPI", label: "Events" }
              ].map((stat, index) => (
                <ScrollAnimation key={index} className={`stagger-${index + 1} flex-shrink-0`}>
                  <div className="glass rounded-lg p-4 hover-lift min-w-[120px]">
                    <div className="text-2xl font-bold mb-1 animate-pulse-fast">{stat.number}</div>
                    <div className="text-white/90 text-xs font-medium">{stat.label}</div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            {[
              { number: "KSO", label: "Community" },
              { number: "Culture", label: "Show" },
              { number: "Coed IM", label: "Soccer" },
              { number: "AAPI", label: "Events" }
            ].map((stat, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover-lift">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 animate-pulse-slow">{stat.number}</div>
                  <div className="text-white/90 text-sm sm:text-base lg:text-lg font-medium">{stat.label}</div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media & Contact */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="section-title text-xl sm:text-2xl md:text-3xl lg:text-4xl gradient-text mb-4 sm:mb-6 lg:mb-8">Connect With Us</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-12 max-w-2xl mx-auto px-4">
              Stay updated with our latest events, announcements, and community highlights!
            </p>
          </ScrollAnimation>
          
          {/* Mobile: Compact Horizontal Scroll */}
          <div className="block sm:hidden mb-6">
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {socialLinks.map((link, index) => (
                <ScrollAnimation key={link.name} className={`stagger-${index + 1} flex-shrink-0`}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modern-card flex flex-col items-center p-4 hover-lift hover-glow min-w-[80px]"
                  >
                    <span className="text-2xl mb-2 animate-float-fast hover-rotate">{link.icon}</span>
                    <span className="text-gray-700 font-semibold text-xs">{link.name}</span>
                  </a>
                </ScrollAnimation>
              ))}
            </div>
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden sm:flex sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {socialLinks.map((link, index) => (
              <ScrollAnimation key={link.name} className={`stagger-${index + 1}`}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modern-card flex flex-col items-center p-6 sm:p-8 hover-lift hover-glow min-w-[100px] sm:min-w-[120px]"
                >
                  <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-float-slow hover-rotate">{link.icon}</span>
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">{link.name}</span>
                </a>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
