'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function AlumniPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [alumni, setAlumni] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
    
    if (user) {
      fetchAlumni();
    }
  }, [user, authLoading, router]);

  const fetchAlumni = async () => {
    try {
      console.log('Fetching alumni directory...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Error fetching alumni:', error);
        setError(error.message);
      } else {
        console.log('Fetched alumni data:', data);
        setAlumni(data || []);
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      setError('Failed to load alumni directory');
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
              {authLoading ? 'Checking authentication...' : 'Loading member directory...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Alumni Directory Section */}
      <section className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
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

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    setLoading(true);
                    fetchAlumni();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredAlumni.length} of {alumni.length} members
              </p>
            </div>

            {/* Alumni Grid */}
            {filteredAlumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((person) => (
                  <ScrollAnimation key={person.id}>
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="text-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                          {person.avatar_url ? (
                            <img
                              src={person.avatar_url}
                              alt={person.full_name}
                              className="w-20 h-20 object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-gray-600">
                                {person.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                                                              <h3 className="text-xl font-bold text-black mb-2">{person.full_name}</h3>
                                      {person.username && (
                                        <p className="text-gray-500 text-sm mb-2">@{person.username}</p>
                                      )}

                                      <div className="space-y-2 text-sm text-gray-600">
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
                          <p className="text-gray-600 text-sm mt-4 line-clamp-3">
                            {person.bio}
                          </p>
                        )}

                        {person.linkedin_url && (
                          <div className="mt-4">
                            <a
                              href={person.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                              </svg>
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No alumni found matching your criteria.</p>
              </div>
            )}
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
} 