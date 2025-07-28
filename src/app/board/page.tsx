'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Profile, BoardPosition } from '@/lib/supabase';

export default function Board() {
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    try {
      // Fetch board positions from the database
      const { data: positions, error: positionsError } = await supabase
        .from('board_positions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (positionsError) {
        console.error('Error fetching board positions:', positionsError);
        setBoardMembers([]);
        setLoading(false);
        return;
      }

      if (!positions || positions.length === 0) {
        setBoardMembers([]);
        setLoading(false);
        return;
      }

      // Fetch all users from the database
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .not('username', 'is', null);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setBoardMembers([]);
        setLoading(false);
        return;
      }

      // Create a map of usernames to user data
      const userMap = new Map();
      users?.forEach(user => {
        userMap.set(user.username, user);
      });

      // Build board members array by combining position data with user data
      const combinedBoardMembers = positions.map((position) => {
        if (position.username && userMap.has(position.username)) {
          // Use database data for users with usernames
          const user = userMap.get(position.username);
          return {
            name: user.full_name,
            role: position.role,
            year: user.graduation_year ? `Class of ${user.graduation_year}` : 'Class of 2025',
            major: user.major || 'Various Majors',
            bio: user.bio || 'KSO Executive Board Member.',
            linkedin: user.linkedin_url || '#',
            username: user.username,
            avatar_url: user.avatar_url,
            hasUser: true
          };
        } else {
          // Show "COMING SOON" for positions without usernames
          return {
            name: 'COMING SOON',
            role: position.role,
            year: 'TBD',
            major: 'TBD',
            bio: 'This position will be filled soon. Stay tuned!',
            linkedin: '#',
            username: null,
            hasUser: false
          };
        }
      });

      setBoardMembers(combinedBoardMembers);
    } catch (error) {
      console.error('Error fetching board members:', error);
      setBoardMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading executive board...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">Executive Board</h1>
          </ScrollAnimation>
          <ScrollAnimation>
            <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1">
              Meet the dedicated leaders who make KSO possible
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

      {/* Executive Board Members */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center mb-8 sm:mb-12">
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-3 sm:mb-4">2024-2025 Executive Board</h2>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Our dedicated team of leaders working to build and strengthen the Korean community
            </p>
          </ScrollAnimation>
          
          {/* Mobile: Compact List */}
          <div className="block md:hidden space-y-3">
            {boardMembers.map((member, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className={`modern-card overflow-hidden hover-lift shadow-lg ${!member.hasUser ? 'border-2 border-dashed border-gray-300' : ''}`}>
                  <div className="flex p-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center mr-4 animate-pulse-slow hover-scale overflow-hidden">
                      {member.hasUser && member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                          member.hasUser ? 'bg-black' : 'bg-gray-200'
                        }`}>
                          <span className={`text-2xl animate-float-slow ${
                            member.hasUser ? 'text-white' : 'text-gray-500'
                          }`}>
                            {member.hasUser ? '👤' : '⏳'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold mb-1 line-clamp-1 ${
                        member.hasUser ? 'text-black' : 'text-gray-500'
                      }`}>{member.name}</h3>
                      <p className="text-black text-sm font-medium mb-1">{member.role}</p>
                      <p className="text-gray-600 text-xs mb-1">{member.year} • {member.major}</p>
                      <p className="text-gray-700 text-xs line-clamp-2 mb-2">{member.bio}</p>
                      {member.hasUser && (
                        <a 
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 bg-black hover:bg-gray-800 text-white rounded-full transition-colors hover-scale"
                          title="View LinkedIn Profile"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Tablet/Desktop: Card Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {boardMembers.map((member, index) => (
              <ScrollAnimation key={index} className={`stagger-${index + 1}`}>
                <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow hover-lift h-full flex flex-col ${
                  !member.hasUser ? 'border-2 border-dashed border-gray-300' : ''
                }`}>
                  <div className={`h-48 lg:h-64 flex items-center justify-center animate-shimmer flex-shrink-0 overflow-hidden ${
                    member.hasUser ? 'bg-black' : 'bg-gray-200'
                  }`}>
                    {member.hasUser && member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`text-4xl lg:text-6xl animate-float-slow ${
                        member.hasUser ? 'text-white' : 'text-gray-500'
                      }`}>
                        {member.hasUser ? '👤' : '⏳'}
                      </span>
                    )}
                  </div>
                  <div className="p-4 lg:p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-lg lg:text-xl font-semibold line-clamp-1 ${
                        member.hasUser ? 'text-black' : 'text-gray-500'
                      }`}>{member.name}</h3>
                      {member.hasUser && (
                        <a 
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-black hover:bg-gray-800 text-white rounded-full transition-colors hover-scale ml-2"
                          title="View LinkedIn Profile"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-black font-medium mb-2 text-sm lg:text-base line-clamp-1">{member.role}</p>
                    <p className="text-gray-600 text-xs lg:text-sm mb-2">{member.year}</p>
                    <p className="text-gray-600 text-xs lg:text-sm mb-3">{member.major}</p>
                    <p className="text-gray-700 text-xs lg:text-sm line-clamp-3 flex-1">{member.bio}</p>
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



      {/* Leadership Opportunities */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-4 sm:mb-6">Leadership Opportunities</h2>
            <p className="font-body text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              KSO provides numerous opportunities for students to develop leadership skills, 
              gain valuable experience, and make a meaningful impact on our community.
            </p>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-center modern-card p-6 hover-lift shadow-lg">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-black mb-2">Event Planning</h3>
                <p className="text-gray-600">Organize and execute major events like our annual Culture Show.</p>
              </div>
              <div className="text-center modern-card p-6 hover-lift shadow-lg">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-black mb-2">Professional Growth</h3>
                <p className="text-gray-600">Build your resume with leadership experience and community involvement.</p>
              </div>
            </div>
          </ScrollAnimation>
          <ScrollAnimation>
            <a 
              href="mailto:ksouchicago@gmail.com"
              className="modern-button bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 hover-lift shadow-lg"
            >
              Contact Us About Leadership
            </a>
          </ScrollAnimation>
        </div>
      </section>

      {/* Horizontal separator line */}
      <ScrollAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-300"></div>
        </div>
      </ScrollAnimation>

      {/* Contact Board */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimation>
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl text-black mb-4 sm:mb-6">Get in Touch</h2>
            <p className="font-body text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Have questions about KSO or want to get involved? Our executive board is here to help!
            </p>
          </ScrollAnimation>
          <ScrollAnimation>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:ksouchicago@gmail.com"
                className="modern-button bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 hover-lift shadow-lg"
              >
                Email Us
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
} 