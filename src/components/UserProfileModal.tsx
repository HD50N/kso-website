'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PhotoDownloadButton from '@/components/PhotoDownloadButton';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  graduation_year?: number;
  major?: string;
  bio?: string;
  linkedin_url?: string;
  instagram_url?: string;
  user_type?: string;
  board_position?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userId, isOpen, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-[70] p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400">Member profile</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-black transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-sm text-gray-400">Loading profile…</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#CD2E3A] mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchProfile}
                className="text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0 w-16 h-16 border border-gray-100 bg-gray-50 overflow-hidden">
                  {profile.avatar_url ? (
                    <>
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-16 h-16 object-cover" />
                      <div className="absolute bottom-0 right-0 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                        <PhotoDownloadButton
                          imageUrl={profile.avatar_url}
                          fileName={`${profile.full_name?.replace(/\s+/g, '_') || 'member'}-kso-profile.jpg`}
                          tone="onLight"
                          size="sm"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-lg font-black text-gray-400">
                        {profile.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-black tracking-tight">{profile.full_name}</h3>
                  {profile.username && <p className="text-xs text-gray-400">@{profile.username}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-block border border-gray-200 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-700">
                      {profile.user_type?.replace('_', ' ') || 'undergrad'}
                    </span>
                    {profile.is_admin && (
                      <span className="inline-block border border-[#CD2E3A]/40 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-[#CD2E3A]">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold border-b border-gray-100 pb-2">
                    Basic information
                  </h4>
                  
                  <div className="space-y-3">
                    {profile.graduation_year && (
                      <div>
                        <p className="text-[10px] tracking-[0.14em] uppercase text-gray-400 font-medium mb-1">Graduation year</p>
                        <p className="text-sm text-black">Class of {profile.graduation_year}</p>
                      </div>
                    )}

                    {profile.major && (
                      <div>
                        <p className="text-[10px] tracking-[0.14em] uppercase text-gray-400 font-medium mb-1">Major</p>
                        <p className="text-sm text-black">{profile.major}</p>
                      </div>
                    )}

                    {profile.board_position && (
                      <div>
                        <p className="text-[10px] tracking-[0.14em] uppercase text-gray-400 font-medium mb-1">Board position</p>
                        <p className="text-sm text-black">{profile.board_position}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="space-y-4">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold border-b border-gray-100 pb-2">
                    Contact
                  </h4>

                  <div className="space-y-3">
                    {profile.linkedin_url || profile.instagram_url ? (
                      <div className="flex flex-wrap gap-3">
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-600 border border-gray-200 px-3 py-2 hover:border-black hover:text-black transition-colors"
                          >
                            LinkedIn
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a
                            href={profile.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-600 border border-gray-200 px-3 py-2 hover:border-black hover:text-black transition-colors"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No social links</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold border-b border-gray-100 pb-2">Bio</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold">Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">User ID</p>
                    <p className="font-mono text-gray-700 break-all">{profile.user_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Profile ID</p>
                    <p className="font-mono text-gray-700 break-all">{profile.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Created</p>
                    <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Updated</p>
                    <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3 border border-gray-200 text-black hover:border-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 