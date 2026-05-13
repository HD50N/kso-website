'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';
import AuthPrompt from '@/components/AuthPrompt';

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
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [bio]);

  return (
    <>
      <p
        ref={bioRef}
        className={`text-gray-500 text-xs leading-relaxed mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}
      >
        {bio}
      </p>
      {isTruncated && (
        <button
          onClick={() => {
            const newExpanded = new Set(expandedProfiles);
            if (newExpanded.has(profileId)) { newExpanded.delete(profileId); } else { newExpanded.add(profileId); }
            setExpandedProfiles(newExpanded);
          }}
          className="mt-1 text-[10px] tracking-[0.1em] uppercase text-gray-400 hover:text-black transition-colors"
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
      if (!isRetry) { setError(''); setRetryCount(0); }
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
        setError('');
      }
    } catch (error: any) {
      console.error('Error fetching alumni:', error);
      if (retryCount < 2 && !isRetry) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchAlumni(true), 2000);
        setError('Loading member directory...');
      } else {
        setError('Failed to load member directory. Please refresh the page.');
        setAlumni([]);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => { fetchAlumni(); }, [fetchAlumni]);

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

  const inputClass = "px-4 py-2.5 border border-gray-200 bg-white text-sm text-black focus:outline-none focus:border-black transition-colors";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-[50vh] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-400">Loading...</p>
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Error */}
      {error && !loading && (
        <div className="border-b border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-6 lg:px-16 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-[#CD2E3A] text-sm">{error}</p>
            <button onClick={() => fetchAlumni()} className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[#CD2E3A] hover:text-black transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="border-b border-gray-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                University of Chicago · KSO
              </p>
              <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                Member<br />Directory
              </h1>
            </div>
            <div className="lg:pt-20">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                &ldquo;Connect with members and alumni across classes and majors.&rdquo;
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Connect with KSO members from different graduating classes and backgrounds. Use search and filters to find people in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              placeholder="Search by name or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 ${inputClass}`}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={inputClass}
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
              className={inputClass}
            >
              <option value="all">All Years</option>
              {graduationYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <p className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-medium mb-8">
            {filteredAlumni.length} of {alumni.length} members
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4" />
                  <div className="h-4 bg-gray-100 rounded mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredAlumni.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100">
              {filteredAlumni.map((person) => (
                <div key={person.id} className="bg-white p-5 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="relative group w-14 h-14 mb-4 overflow-hidden bg-gray-100">
                    {person.avatar_url ? (
                      <>
                        <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                          <PhotoDownloadButton
                            imageUrl={person.avatar_url}
                            fileName={`${person.full_name.replace(/\s+/g, '_')}-kso-profile.jpg`}
                            tone="onLight"
                            size="sm"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg font-black text-gray-300">
                          {person.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-black tracking-tight mb-0.5">{person.full_name}</h3>
                  {person.username && (
                    <p className="text-[10px] text-gray-400 mb-2">@{person.username}</p>
                  )}

                  <div className="space-y-0.5 text-xs text-gray-500">
                    {person.user_type && (
                      <p className="capitalize">
                        {person.user_type.replace('_', ' ')}
                        {person.board_position && ` · ${person.board_position}`}
                      </p>
                    )}
                    {person.graduation_year && <p>Class of {person.graduation_year}</p>}
                    {person.major && <p className="line-clamp-1">{person.major}</p>}
                    {person.bio && (
                      <ProfileBio bio={person.bio} profileId={person.id} expandedProfiles={expandedProfiles} setExpandedProfiles={setExpandedProfiles} />
                    )}
                  </div>

                  {(person.linkedin_url || person.instagram_url) && (
                    <div className="mt-3 flex gap-2">
                      {person.linkedin_url && (
                        <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {person.instagram_url && (
                        <a href={person.instagram_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-sm">No members found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
