import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Board() {
  const boardMembers = [
    {
      name: "Hudson Chung",
      role: "President",
      year: "Class of 2025",
      major: "Various Majors",
      image: "/placeholder-president.jpg",
      bio: "Leading KSO with passion for community building and cultural celebration.",
      linkedin: "https://linkedin.com/in/hudson-chung"
    },
    {
      name: "Yoo-bin Kwon",
      role: "VP Internal",
      year: "Class of 2025",
      major: "Various Majors",
      image: "/placeholder-vp-internal.jpg",
      bio: "Managing internal operations and member relations within KSO.",
      linkedin: "https://linkedin.com/in/yoobin-kwon"
    },
    {
      name: "Nato Yeung",
      role: "VP External",
      year: "Class of 2025",
      major: "Various Majors",
      image: "/placeholder-vp-external.jpg",
      bio: "Building external partnerships and representing KSO to the broader community.",
      linkedin: "https://linkedin.com/in/nato-yeung"
    },
    {
      name: "Lauren Chang",
      role: "Secretary",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-secretary.jpg",
      bio: "Keeping our organization organized and maintaining clear communication.",
      linkedin: "https://linkedin.com/in/lauren-chang"
    },
    {
      name: "SeoYoung Min",
      role: "Treasurer",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-treasurer1.jpg",
      bio: "Managing our finances and ensuring sustainable growth of KSO.",
      linkedin: "https://linkedin.com/in/seoyoung-min"
    },
    {
      name: "Alex Jung",
      role: "Treasurer",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-treasurer2.jpg",
      bio: "Co-managing our finances and ensuring sustainable growth of KSO.",
      linkedin: "https://linkedin.com/in/alex-jung"
    },
    {
      name: "Josh Park",
      role: "Social Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-social1.jpg",
      bio: "Planning and executing engaging social events that bring our community together.",
      linkedin: "https://linkedin.com/in/josh-park"
    },
    {
      name: "Min Seo Kim",
      role: "Social Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-social2.jpg",
      bio: "Co-planning and executing engaging social events that bring our community together.",
      linkedin: "https://linkedin.com/in/minseo-kim"
    },
    {
      name: "Jean Sung",
      role: "Social Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-social3.jpg",
      bio: "Co-planning and executing engaging social events that bring our community together.",
      linkedin: "https://linkedin.com/in/jean-sung"
    },
    {
      name: "BenJamin Kim",
      role: "Culture Show Chair",
      year: "Class of 2025",
      major: "Various Majors",
      image: "/placeholder-culture1.jpg",
      bio: "Creating unforgettable cultural experiences through our annual show.",
      linkedin: "https://linkedin.com/in/benjamin-kim"
    },
    {
      name: "James Jeong",
      role: "Culture Show Chair",
      year: "Class of 2025",
      major: "Various Majors",
      image: "/placeholder-culture2.jpg",
      bio: "Co-creating unforgettable cultural experiences through our annual show.",
      linkedin: "https://linkedin.com/in/james-jeong"
    },
    {
      name: "Irene Cho",
      role: "Fundraising Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-fundraising1.jpg",
      bio: "Managing fundraising initiatives and securing resources for KSO events.",
      linkedin: "https://linkedin.com/in/irene-cho"
    },
    {
      name: "Ella Cho",
      role: "Fundraising Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-fundraising2.jpg",
      bio: "Co-managing fundraising initiatives and securing resources for KSO events.",
      linkedin: "https://linkedin.com/in/ella-cho"
    },
    {
      name: "Tiffany Kim",
      role: "Communications Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-communications1.jpg",
      bio: "Managing KSO's communications and digital presence.",
      linkedin: "https://linkedin.com/in/tiffany-kim"
    },
    {
      name: "Andrew Kim",
      role: "Communications Chair",
      year: "Class of 2026",
      major: "Various Majors",
      image: "/placeholder-communications2.jpg",
      bio: "Co-managing KSO's communications and digital presence.",
      linkedin: "https://linkedin.com/in/andrew-kim"
    }
  ];

  const committees = [
    {
      name: "Culture Show Committee",
      description: "Led by BenJamin Kim and James Jeong, plans and executes our annual KSO Culture Show.",
      members: "15 members"
    },
    {
      name: "Social Events Committee",
      description: "Led by Josh Park, Min Seo Kim, and Jean Sung, organizes social gatherings and community events.",
      members: "12 members"
    },
    {
      name: "Fundraising Committee",
      description: "Led by Irene Cho and Ella Cho, manages fundraising initiatives and secures resources.",
      members: "10 members"
    },
    {
      name: "Communications Committee",
      description: "Led by Tiffany Kim and Andrew Kim, manages KSO's communications and digital presence.",
      members: "8 members"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-korean-gradient text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in">Executive Board</h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-white opacity-90 px-4 animate-slide-in-up stagger-1">
            Meet the dedicated leaders who make KSO possible
          </p>
        </div>
      </section>

      {/* Executive Board Members */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">2024-2025 Executive Board</h2>
          
          {/* Mobile: Compact List */}
          <div className="block md:hidden space-y-3">
            {boardMembers.map((member, index) => (
              <div key={index} className="modern-card overflow-hidden">
                <div className="flex p-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-korean-gradient-gold rounded-lg flex items-center justify-center mr-4 animate-pulse-slow hover-scale">
                    <span className="text-white text-2xl animate-float-slow">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{member.name}</h3>
                    <p className="korean-red text-sm font-medium mb-1">{member.role}</p>
                    <p className="text-gray-600 text-xs mb-1">{member.year} • {member.major}</p>
                    <p className="text-gray-700 text-xs line-clamp-2 mb-2">{member.bio}</p>
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors hover-scale"
                      title="View LinkedIn Profile"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Card Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {boardMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 lg:h-64 bg-korean-gradient-gold flex items-center justify-center animate-shimmer">
                  <span className="text-white text-4xl lg:text-6xl animate-float-slow">👤</span>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900">{member.name}</h3>
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors hover-scale"
                      title="View LinkedIn Profile"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                  <p className="korean-red font-medium mb-2 text-sm lg:text-base">{member.role}</p>
                  <p className="text-gray-600 text-xs lg:text-sm mb-2">{member.year}</p>
                  <p className="text-gray-600 text-xs lg:text-sm mb-3">{member.major}</p>
                  <p className="text-gray-700 text-xs lg:text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committees */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">Our Committees</h2>
          
          {/* Mobile: Compact Cards */}
          <div className="block md:hidden space-y-3">
            {committees.map((committee, index) => (
              <div key={index} className="modern-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">{committee.name}</h3>
                  <span className="korean-red text-xs font-medium">{committee.members}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{committee.description}</p>
                <a 
                  href="/forms"
                  className="korean-red hover:text-red-700 font-semibold text-xs inline-flex items-center"
                >
                  Join Committee →
                </a>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8">
            {committees.map((committee, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3">{committee.name}</h3>
                <p className="text-sm lg:text-base text-gray-600 mb-4">{committee.description}</p>
                <div className="flex items-center justify-between">
                  <span className="korean-red font-medium text-sm lg:text-base">{committee.members}</span>
                  <a 
                    href="/forms"
                    className="korean-red hover:text-red-700 font-semibold text-sm"
                  >
                    Join Committee →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Opportunities */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Leadership Opportunities</h2>
          <p className="text-lg text-gray-700 mb-8">
            KSO provides numerous opportunities for students to develop leadership skills, 
            gain valuable experience, and make a meaningful impact on our community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Committee Leadership</h3>
              <p className="text-gray-600">Lead one of our specialized committees and develop project management skills.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Planning</h3>
              <p className="text-gray-600">Organize and execute major events like our annual Culture Show.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Growth</h3>
              <p className="text-gray-600">Build your resume with leadership experience and community involvement.</p>
            </div>
          </div>
                      <a 
              href="/forms"
              className="bg-korean-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Apply for Leadership Position
            </a>
        </div>
      </section>

      {/* Contact Board */}
      <section className="py-16 bg-korean-red text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Have questions about KSO or want to get involved? Our executive board is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <a 
                href="mailto:kso@uchicago.edu"
                className="bg-white korean-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Email Us
              </a>
              <a 
                href="/forms"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:korean-red transition-colors"
              >
              Join KSO
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 