'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthPrompt from '@/components/AuthPrompt';

// Component to handle bio expansion with truncation detection
function ProfileBio({ 
  bio, 
  profileId, 
  expandedProfiles, 
  setExpandedProfiles 
}: { 
  bio: string; 
  profileId: string; 
  expandedProfiles: Set<string>; 
  setExpandedProfiles: (set: Set<string>) => void;
}) {
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const isExpanded = expandedProfiles.has(profileId);

  useEffect(() => {
    if (bioRef.current) {
      const element = bioRef.current;
      // Check if content is truncated by comparing scroll height to client height
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [bio]);

  return (
    <>
      <p 
        ref={bioRef}
        className={`text-gray-600 mt-1 ${isExpanded ? '' : 'line-clamp-1'}`}
      >
        {bio}
      </p>
      {isTruncated && (
        <button
          onClick={() => {
            const newExpanded = new Set(expandedProfiles);
            if (newExpanded.has(profileId)) {
              newExpanded.delete(profileId);
            } else {
              newExpanded.add(profileId);
            }
            setExpandedProfiles(newExpanded);
          }}
          className="mt-1 text-xs text-gray-500 hover:text-black transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

export default function AlumniPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [alumni, setAlumni] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());

  const fetchAlumni = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setError('');
        setRetryCount(0);
      }
      
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, graduation_year, major, user_type, board_position, linkedin_url, instagram_url, bio, avatar_url')
        .order('full_name');

      if (error) {
        console.error('Error fetching alumni:', error);
        throw new Error('Failed to load member directory');
      } else {
        setAlumni((data as Profile[]) || []);
        setError(''); // Clear any previous errors
      }
    } catch (error: any) {
      console.error('Error fetching alumni:', error);
      
      if (retryCount < 2 && !isRetry) {
        // Retry up to 2 times
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchAlumni(true), 2000); // Retry after 2 seconds
        setError('Loading member directory... Retrying...');
      } else {
        setError('Failed to load member directory. Please refresh the page.');
        setAlumni([]);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    // Start loading data immediately, don't wait for full auth context
    fetchAlumni();
  }, [fetchAlumni]);

  // No authentication redirect - let users see the page but show login prompt if not authenticated

  const filteredAlumni = alumni.filter((person) => {
    const matchesSearch = person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.major && person.major.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || person.user_type === filterType;
    
    const matchesYear = filterYear === 'all' || 
                       (person.graduation_year && person.graduation_year.toString() === filterYear);

    return matchesSearch && matchesType && matchesYear;
  });

  const graduationYears = Array.from(
    new Set(alumni.map(person => person.graduation_year).filter((year): year is number => year !== null && year !== undefined))
  ).sort((a, b) => b - a);

  // Show loading only for auth, not for content loading
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Member Directory"
        description="Connect with KSO alumni and current members. Sign in to access the full member directory."
        features={[
          "Connect with Korean culture and community",
          "Build professional networks with alumni", 
          "Access exclusive member resources",
          "Stay updated on KSO events and activities"
        ]}
        ctaText="Sign In to Access Directory"
        ctaHref="/auth"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Error Display */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchAlumni()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-white text-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-bounce-in text-black">Member Directory</h1>
          <p className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-gray-700 px-4 animate-slide-in-up stagger-1">
            Connect with KSO members from across different graduating classes and backgrounds
          </p>
        </div>
      </section>

      {/* Horizontal separator line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-300"></div>
      </div>

      {/* Alumni Directory Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name or major..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="undergrad">Undergraduate</option>
                <option value="grad">Graduate</option>
                <option value="alumni">Alumni</option>
                <option value="board_member">Board Member</option>
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Years</option>
                {graduationYears.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredAlumni.length} of {alumni.length} members
            </p>
          </div>

          {/* Alumni Grid */}
          {loading ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 border border-gray-100 h-full flex flex-col animate-pulse">
                  <div className="text-center flex-1 flex flex-col">
                    {/* Avatar skeleton */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 sm:mb-3 md:mb-4 bg-gray-200"></div>
                    
                    {/* Name skeleton */}
                    <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded mb-1 sm:mb-2"></div>
                    
                    {/* Username skeleton */}
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1 sm:mb-2 w-3/4 mx-auto"></div>

                    {/* Info skeleton */}
                    <div className="space-y-1 sm:space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                    </div>

                    {/* Bio skeleton */}
                    <div className="mt-2 sm:mt-4 space-y-1">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAlumni.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {filteredAlumni.map((person) => (
                <div key={person.id} className="bg-white rounded-xl shadow-lg p-2 sm:p-4 md:p-6 border border-gray-100 hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="text-center flex-1 flex flex-col">
                    {/* Avatar */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 sm:mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                      {person.avatar_url ? (
                        <img
                          src={person.avatar_url}
                          alt={person.full_name}
                          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">
                            {person.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-sm sm:text-base md:text-xl font-bold text-black mb-1 sm:mb-2">{person.full_name}</h3>
                    {person.username && (
                      <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-1">@{person.username}</p>
                    )}

                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      <p className="capitalize line-clamp-1">
                        {person.user_type?.replace('_', ' ')}
                        {person.board_position && ` • ${person.board_position}`}
                      </p>
                      
                      {person.graduation_year && (
                        <p className="line-clamp-1">Class of {person.graduation_year}</p>
                      )}
                      
                      {person.major && (
                        <p className="line-clamp-1">{person.major}</p>
                      )}
                      
                      {person.bio && (
                        <ProfileBio 
                          bio={person.bio}
                          profileId={person.id}
                          expandedProfiles={expandedProfiles}
                          setExpandedProfiles={setExpandedProfiles}
                        />
                      )}
                    </div>

                    {(person.linkedin_url || person.instagram_url) && (
                      <div className="mt-auto pt-2 sm:pt-4 flex justify-center space-x-2 sm:space-x-3">
                        {person.linkedin_url && (
                          <a
                            href={person.linkedin_url}
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
                        {person.instagram_url && (
                          <a
                            href={person.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 bg-pink-600 hover:bg-pink-700 text-white rounded-full transition-colors hover-scale"
                            title="View Instagram Profile"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No members found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 