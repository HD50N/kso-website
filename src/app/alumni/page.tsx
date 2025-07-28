'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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

  useEffect(() => {
    // Start loading data immediately, don't wait for full auth context
    fetchAlumni();
  }, []);

  // Handle authentication redirect separately
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchAlumni = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setError('');
        setRetryCount(0);
      }
      
      setLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('id, full_name, username, graduation_year, major, user_type, board_position, linkedin_url, instagram_url, bio, avatar_url')
        .order('full_name');

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

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
  };

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {authLoading ? 'Checking authentication...' : 
               retryCount > 0 ? `Loading member directory... (Retry ${retryCount}/2)` : 'Loading member directory...'}
            </p>
            {error && !authLoading && (
              <p className="mt-2 text-sm text-gray-500">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
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

      {/* Alumni Directory Section */}
      <section className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">Member Directory</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with KSO members from across different graduating classes and backgrounds. 
              This directory is only accessible to authenticated members.
            </p>
          </div>

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
          {filteredAlumni.length > 0 ? (
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

                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                      <p className="capitalize">
                        {person.user_type?.replace('_', ' ')}
                        {person.board_position && ` • ${person.board_position}`}
                      </p>
                      
                      {person.graduation_year && (
                        <p>Class of {person.graduation_year}</p>
                      )}
                      
                      {person.major && (
                        <p>{person.major}</p>
                      )}
                    </div>

                    {person.bio && (
                      <p className="text-gray-600 text-xs sm:text-sm mt-2 sm:mt-4 line-clamp-2 sm:line-clamp-3">
                        {person.bio}
                      </p>
                    )}

                    {(person.linkedin_url || person.instagram_url) && (
                      <div className="mt-auto pt-2 sm:pt-4 flex justify-center space-x-3">
                        {person.linkedin_url && (
                          <a
                            href={person.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        {person.instagram_url && (
                          <a
                            href={person.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-pink-600 hover:text-pink-800 text-xs sm:text-sm"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Instagram
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