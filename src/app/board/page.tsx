'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Profile, BoardPosition } from '@/lib/supabase';

/** Up to two letters from first + last name (or first two of a single word). */
function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const w = parts[0]!;
    return w.slice(0, 2).toUpperCase();
  }
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function ProfileBio({
  bio,
  index,
  expandedProfiles,
  setExpandedProfiles
}: {
  bio: string;
  index: number;
  expandedProfiles: Set<number>;
  setExpandedProfiles: (set: Set<number>) => void;
}) {
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const isExpanded = expandedProfiles.has(index);

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
        className={`text-gray-500 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}
      >
        {bio}
      </p>
      {isTruncated && (
        <button
          onClick={() => {
            const newExpanded = new Set(expandedProfiles);
            if (newExpanded.has(index)) { newExpanded.delete(index); } else { newExpanded.add(index); }
            setExpandedProfiles(newExpanded);
          }}
          className="mt-1.5 text-[10px] tracking-[0.1em] uppercase text-gray-400 hover:text-black transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

function ProfileBioDesktop({
  bio,
  index,
  expandedProfiles,
  setExpandedProfiles
}: {
  bio: string;
  index: number;
  expandedProfiles: Set<number>;
  setExpandedProfiles: (set: Set<number>) => void;
}) {
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const isExpanded = expandedProfiles.has(index);

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
        className={`text-gray-500 text-xs lg:text-sm leading-relaxed flex-1 ${isExpanded ? '' : 'line-clamp-2'}`}
      >
        {bio}
      </p>
      {isTruncated && (
        <button
          onClick={() => {
            const newExpanded = new Set(expandedProfiles);
            if (newExpanded.has(index)) { newExpanded.delete(index); } else { newExpanded.add(index); }
            setExpandedProfiles(newExpanded);
          }}
          className="mt-2 text-[10px] tracking-[0.1em] uppercase text-gray-400 hover:text-black transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

export default function Board() {
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<number>>(new Set());

  const fetchBoardMembers = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) { setError(''); setRetryCount(0); }
      setLoading(true);

      const { data: positions, error: positionsError } = await supabase
        .from('board_positions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (positionsError) throw new Error('Failed to load board positions');
      if (!positions || positions.length === 0) { setBoardMembers([]); setLoading(false); return; }

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, username, graduation_year, major, linkedin_url, instagram_url, bio, avatar_url')
        .not('username', 'is', null);

      let userData: any[] = [];
      if (usersError) { userData = []; } else { userData = users || []; }

      const assignedUsernames = positions
        .map((pos: BoardPosition) => pos.username)
        .filter((username: string | null | undefined) => username !== null && username !== undefined);

      const relevantUsers = userData.filter(user => assignedUsernames.includes(user.username));
      const userMap = new Map();
      relevantUsers.forEach(user => { userMap.set(user.username, user); });

      const combinedBoardMembers = positions.map((position: BoardPosition) => {
        if (position.username && userMap.has(position.username)) {
          const user = userMap.get(position.username);
          return {
            name: user.full_name,
            role: position.role,
            year: user.graduation_year ? `${user.graduation_year}` : 'Class of 2025',
            major: user.major || 'Various Majors',
            bio: user.bio || 'KSO Executive Board Member.',
            linkedin: user.linkedin_url || '#',
            instagram: user.instagram_url || '#',
            username: user.username,
            avatar_url: user.avatar_url,
            hasUser: true
          };
        } else {
          return {
            name: 'Coming Soon',
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
      setError('');
    } catch (error: any) {
      console.error('Error fetching board members:', error);
      if (retryCount < 2 && !isRetry) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchBoardMembers(true), 2000);
        setError('Loading board members...');
      } else {
        setError('Failed to load board members. Please refresh the page.');
        setBoardMembers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => { fetchBoardMembers(); }, [fetchBoardMembers]);

  const socialButton = (href: string, type: 'linkedin' | 'instagram') => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-7 h-7 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors"
      title={type === 'linkedin' ? 'LinkedIn' : 'Instagram'}
    >
      {type === 'linkedin' ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )}
    </a>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Error */}
      {error && !loading && (
        <div className="border-b border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-6 lg:px-16 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-[#CD2E3A] text-sm">{error}</p>
            <button onClick={() => fetchBoardMembers()} className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[#CD2E3A] hover:text-black transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="border-b border-gray-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                University of Chicago · KSO
              </p>
              <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                Executive<br />Board
              </h1>
            </div>
            <div className="lg:pt-10">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                &ldquo;Meet the dedicated leaders who make KSO possible.&rdquo;
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our executive board works tirelessly to organize events, build community, and represent Korean culture at the University of Chicago.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Board Members */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">

          {/* Mobile: list */}
          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, index) => (
                <div key={index} className="flex items-start gap-5 py-6 animate-pulse">
                  <div className="w-14 shrink-0 aspect-[3/4] bg-gray-100 border border-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-100 rounded mb-1 w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : (
              boardMembers.map((member, index) => (
                <div key={index} className="flex items-start gap-5 py-6">
                  <div className="relative w-14 shrink-0 aspect-[3/4]">
                    <div className="absolute inset-0 border border-gray-200 bg-white p-[3px] shadow-sm">
                      <div
                        className={`relative h-full w-full overflow-hidden ${
                          member.hasUser && member.avatar_url ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        {member.hasUser && member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="h-full w-full object-contain object-center"
                          />
                        ) : member.hasUser ? (
                          <div
                            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-semibold tracking-tight text-gray-600 select-none"
                            aria-label={member.name}
                          >
                            {initialsFromFullName(member.name)}
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[#CD2E3A] block mb-1">{member.role}</span>
                    <h3 className="text-base font-bold text-black tracking-tight mb-0.5">{member.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{member.year} · {member.major}</p>
                    {member.bio && (
                      <ProfileBio bio={member.bio} index={index} expandedProfiles={expandedProfiles} setExpandedProfiles={setExpandedProfiles} />
                    )}
                    {member.hasUser && (member.linkedin !== '#' || member.instagram !== '#') && (
                      <div className="flex gap-2 mt-3">
                        {member.linkedin !== '#' && socialButton(member.linkedin, 'linkedin')}
                        {member.instagram !== '#' && socialButton(member.instagram, 'instagram')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white auto-rows-fr">
            {loading ? (
              [...Array(8)].map((_, index) => (
                <div key={index} className="bg-white p-6 animate-pulse">
                  <div className="mx-auto mb-5 aspect-[3/4] w-[68%] max-w-[220px] border border-gray-100 bg-white" />
                  <div className="h-3 bg-gray-100 rounded mb-2 w-2/3" />
                  <div className="h-4 bg-gray-100 rounded mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : (
              boardMembers.map((member, index) => {
                const hasPhoto = Boolean(member.hasUser && member.avatar_url);
                return (
                  <div key={index} className="bg-white flex flex-col">
                    {/* Photo — portrait scaled inside a mat + frame */}
                    <div
                      className={`relative flex shrink-0 flex-col border-b border-gray-100 ${
                        member.hasUser ? 'bg-[#fafafa]' : 'bg-white'
                      } min-h-[240px] lg:min-h-[300px]`}
                    >
                      <div className="flex flex-1 items-center justify-center px-5 py-6 lg:px-6 lg:py-8">
                        {hasPhoto ? (
                          <div className="relative w-[68%] max-w-[200px] lg:max-w-[232px] aspect-[3/4] border border-gray-200 bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                            <div className="relative h-full w-full overflow-hidden bg-gray-50">
                              <img
                                src={member.avatar_url}
                                alt={member.name}
                                className="h-full w-full object-contain object-center"
                              />
                            </div>
                          </div>
                        ) : member.hasUser ? (
                          <div className="relative flex aspect-[3/4] w-[68%] max-w-[200px] lg:max-w-[232px] items-center justify-center border border-gray-200 bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                            <div
                              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-2xl lg:text-3xl font-semibold tracking-tight text-gray-600 select-none"
                              aria-label={member.name}
                            >
                              {initialsFromFullName(member.name)}
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex aspect-[3/4] w-[68%] max-w-[200px] lg:max-w-[232px] items-center justify-center border border-dashed border-gray-200 bg-white p-1.5">
                            <div className="flex h-full w-full items-center justify-center bg-white">
                              <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 bg-white px-4 py-2.5 text-center">
                        <span className="text-[9px] tracking-[0.16em] uppercase font-semibold text-[#CD2E3A]">{member.role}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-black tracking-tight mb-0.5">{member.name}</h3>
                      {member.year && <p className="text-xs text-gray-400 mb-3">Class of {member.year}</p>}
                      {member.hasUser && member.username && (
                        <p className="text-xs text-gray-400 mb-3">@{member.username}</p>
                      )}
                      {member.major && <p className="text-xs text-gray-500 mb-3 line-clamp-1">{member.major}</p>}
                      {member.bio && (
                        <ProfileBioDesktop bio={member.bio} index={index} expandedProfiles={expandedProfiles} setExpandedProfiles={setExpandedProfiles} />
                      )}
                      {member.hasUser && (member.linkedin !== '#' || member.instagram !== '#') && (
                        <div className="flex gap-2 mt-auto pt-4">
                          {member.linkedin !== '#' && socialButton(member.linkedin, 'linkedin')}
                          {member.instagram !== '#' && socialButton(member.instagram, 'instagram')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-4">Get Involved</p>
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-6 leading-tight">
                Leadership<br />Opportunities
              </h2>
              <p className="text-gray-500 text-base leading-relaxed max-w-md">
                KSO provides numerous opportunities to develop leadership skills, gain valuable experience, and make a meaningful impact on our community.
              </p>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-6 py-5 border-b border-gray-100">
                <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold flex-shrink-0 w-20">Events</span>
                <span className="text-sm text-gray-600">Organize and execute major events like our annual Culture Show.</span>
              </div>
              <div className="flex items-start gap-6 py-5 border-b border-gray-100">
                <span className="text-[#CD2E3A] text-[10px] tracking-[0.14em] uppercase font-semibold flex-shrink-0 w-20">Growth</span>
                <span className="text-sm text-gray-600">Build your resume with leadership experience and community involvement.</span>
              </div>
              <a
                href="mailto:ksouchicago@gmail.com"
                className="flex items-center justify-between w-full border border-gray-200 px-6 py-5 hover:border-black hover:bg-black group transition-colors duration-150 mt-4"
              >
                <span className="text-sm font-semibold tracking-tight text-black group-hover:text-white transition-colors">
                  Contact Us About Leadership
                </span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-white flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
