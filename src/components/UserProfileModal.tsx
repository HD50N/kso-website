'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchProfile}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-600">
                        {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-black">{profile.full_name}</h3>
                  {profile.username && (
                    <p className="text-gray-600">@{profile.username}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      profile.user_type === 'board_member' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.user_type?.replace('_', ' ') || 'undergrad'}
                    </span>
                    {profile.is_admin && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                    Basic Information
                  </h4>
                  
                  <div className="space-y-3">
                    {profile.graduation_year && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                        <p className="text-black">Class of {profile.graduation_year}</p>
                      </div>
                    )}
                    
                    {profile.major && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Major</label>
                        <p className="text-black">{profile.major}</p>
                      </div>
                    )}
                    
                    {profile.board_position && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Board Position</label>
                        <p className="text-black">{profile.board_position}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                    Contact & Social
                  </h4>
                  
                  <div className="space-y-3">
                    {(profile.linkedin_url || profile.instagram_url) ? (
                      <div className="flex space-x-3">
                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                        {profile.instagram_url && (
                          <a
                            href={profile.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-pink-600 hover:text-pink-800"
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Instagram
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No social media links provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                    Bio
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-gray-600 font-mono">{profile.user_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile ID</label>
                    <p className="text-gray-600 font-mono">{profile.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-gray-600">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-600">{new Date(profile.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 