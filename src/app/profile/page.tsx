'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
import AuthPrompt from '@/components/AuthPrompt';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [usernameError, setUsernameError] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

              // No authentication redirect - show login prompt if not authenticated

              useEffect(() => {
                if (profile) {
                  setFormData({
                    full_name: profile.full_name,
                    username: profile.username,
                    graduation_year: profile.graduation_year,
                    major: profile.major,
                    user_type: profile.user_type,
                    board_position: profile.board_position,
                    linkedin_url: profile.linkedin_url,
                    instagram_url: profile.instagram_url,
                    bio: profile.bio,
                  });
                }
              }, [profile]);

              // Cleanup preview URL on unmount
              useEffect(() => {
                return () => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }
                };
              }, [previewUrl]);

              // Monitor online/offline status
              useEffect(() => {
                const handleOnline = () => setIsOnline(true);
                const handleOffline = () => setIsOnline(false);

                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOffline);

                // Check initial status
                setIsOnline(navigator.onLine);

                return () => {
                  window.removeEventListener('online', handleOnline);
                  window.removeEventListener('offline', handleOffline);
                };
              }, []);

              // Function to validate username availability
              const validateUsername = async (username: string): Promise<boolean> => {
                if (!username || username === profile?.username) return true; // Same username or empty is valid
                
                setIsCheckingUsername(true);
                setUsernameError('');
                
                try {
                  const { data, error } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', username)
                    .single();

                  if (error && error.code === 'PGRST116') {
                    // No rows returned - username is available
                    return true;
                  } else if (data) {
                    // Username exists
                    setUsernameError('This username is already taken');
                    return false;
                  }
                  
                  return true;
                } catch (error) {
                  console.error('Username validation error:', error);
                  return true; // Allow submission if validation fails
                } finally {
                  setIsCheckingUsername(false);
                }
              };

              const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                setSuccess('');
                setUsernameError('');

                try {
                  // Validate username
                  if (formData.username) {
                    const username = formData.username.trim();
                    if (username.length < 3) {
                      setUsernameError('Username must be at least 3 characters long');
                      setLoading(false);
                      return;
                    }
                    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                      setUsernameError('Username can only contain letters, numbers, and underscores');
                      setLoading(false);
                      return;
                    }
                    
                    // Check if username is available
                    const isUsernameAvailable = await validateUsername(username);
                    if (!isUsernameAvailable) {
                      setLoading(false);
                      return;
                    }
                  }

                  // Clean and validate the data before sending
                  const cleanedData = {
                    ...formData,
                    full_name: formData.full_name?.trim(),
                    username: formData.username?.trim() || undefined,
                    major: formData.major?.trim(),
                    board_position: formData.board_position?.trim(),
                    linkedin_url: formData.linkedin_url?.trim(),
                    instagram_url: formData.instagram_url?.trim(),
                    bio: formData.bio?.trim(),
                    // Convert graduation_year to number if it's a string, or undefined if null
                    graduation_year: formData.graduation_year ? Number(formData.graduation_year) : undefined,
                    // Ensure user_type is not board_member (only admins can assign this)
                    user_type: formData.user_type === 'board_member' ? profile?.user_type || 'undergrad' : formData.user_type,
                  };

                  console.log('Submitting profile update:', cleanedData);
                  
                  // Add a timeout for the entire operation
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Operation timed out')), 15000); // 15 seconds
                  });
                  
                  await Promise.race([
                    (async () => {
                      // Update profile with form data (photo upload is handled separately)
                      await updateProfile(cleanedData);
                    })(),
                    timeoutPromise
                  ]);
                  
                  setIsEditing(false);
                  setSuccess('Profile updated successfully!');
                  // Clear success message after 3 seconds
                  setTimeout(() => setSuccess(''), 3000);
                } catch (error: any) {
                  console.error('Profile update error:', error);
                  
                  // Handle specific error types
                  if (error.message?.includes('duplicate key') || error.message?.includes('username')) {
                    setUsernameError('This username is already taken');
                  } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
                    setError('Request timed out. This might be due to a slow connection. Please try again.');
                  } else if (error.message?.includes('network') || error.message?.includes('connection')) {
                    setError('Network error. Please check your connection and try again.');
                  } else if (error.message?.includes('offline')) {
                    setError('You appear to be offline. Please check your internet connection and try again.');
                  } else if (error.message?.includes('auth') || error.message?.includes('session')) {
                    setError('Authentication error. Please refresh the page and try again.');
                  } else {
                    setError(error.message || 'An unexpected error occurred. Please try again.');
                  }
                } finally {
                  setLoading(false);
                }
              };

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear username error when user starts typing
    if (field === 'username') {
      setUsernameError('');
    }
  };

  const handleUsernameBlur = async () => {
    if (formData.username && formData.username !== profile?.username) {
      await validateUsername(formData.username);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Open crop modal
      setShowCropModal(true);
    }
  };

  const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const aspect = 1; // Square aspect ratio for profile photos

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string,
  ): Promise<File> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

          return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          const file = new File([blob], fileName, { type: 'image/jpeg' })
          resolve(file)
        }, 'image/jpeg', 0.95)
      })
  }

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile || !user) return;

    try {
      setUploadingPhoto(true);
      setError('');

      // Get cropped image as file
      const croppedImageFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        selectedFile.name
      );

      // Upload cropped image to Supabase Storage immediately
      console.log('Uploading cropped photo...');
      
      const fileExt = croppedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageFile);

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log('Photo uploaded successfully:', publicUrl);
      
      // Update profile immediately with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      // Clear photo-related state
      setCroppedFile(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setPendingPhotoUrl(null);
      
      // Close modal
      setShowCropModal(false);
      setCrop(undefined);
      setCompletedCrop(undefined);
      
      // Show success message
      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error: any) {
      console.error('Photo upload error:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };



  const removeProfilePhoto = async () => {
    if (!profile?.avatar_url || !user) return;

    try {
      setUploadingPhoto(true);
      setError('');

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: undefined });
      
      // Clear photo-related state
      setCroppedFile(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setPendingPhotoUrl(null);
      
      setSuccess('Profile photo removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error: any) {
      console.error('Error removing profile photo:', error);
      setError('Failed to remove profile photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPrompt
        title="Your Profile"
        description="Manage your KSO profile, connect with other members, and stay updated on events."
        features={[
          "Update your personal information",
          "Add your graduation year and major",
          "Connect your social media profiles", 
          "Upload a profile photo",
          "Set a custom username"
        ]}
        ctaText="Sign In to Access Profile"
        ctaHref="/auth"
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
            <span className="text-sm font-medium">You're offline. Some features may not work.</span>
          </div>
        </div>
      )}
      
      {/* Profile Section */}
      <section className="min-h-screen bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Profile Info & Stats */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 sticky top-8">
                  {/* Profile Header */}
                  <div className="text-center mb-4">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-600">
                            {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      
                      {/* Photo Upload Button */}
                      <label className="absolute bottom-0 right-0 w-6 h-6 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Photo Upload Actions */}
                    {showCropModal && (
                      <div className="mb-3 space-y-2">
                        <button
                          onClick={handleCropComplete}
                          disabled={uploadingPhoto}
                          className="w-full px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {uploadingPhoto ? 'Cropping...' : 'Crop Photo'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            setShowCropModal(false);
                            setCrop(undefined);
                            setCompletedCrop(undefined);
                          }}
                          className="w-full px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {profile?.avatar_url && !selectedFile && (
                      <button
                        onClick={removeProfilePhoto}
                        disabled={uploadingPhoto}
                        className="w-full px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 mb-3"
                      >
                        {uploadingPhoto ? 'Removing...' : 'Remove Photo'}
                      </button>
                    )}

                    <h2 className="text-lg font-bold text-black mb-1">{profile?.full_name || 'User'}</h2>
                    {profile?.username && (
                      <p className="text-gray-500 text-xs mb-1">@{profile.username}</p>
                    )}
                    <p className="text-gray-600 text-xs capitalize">
                      {profile?.user_type?.replace('_', ' ') || 'Member'}
                    </p>
                    {profile?.board_position && (
                      <p className="text-black font-medium text-xs mt-1">{profile.board_position}</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Member Since</span>
                      <span className="text-xs font-medium text-black">
                        {profile?.created_at ? new Date(profile.created_at).getFullYear() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-xs text-gray-600">Graduation Year</span>
                      <span className="text-xs font-medium text-black">
                        {profile?.graduation_year || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-gray-600">Major</span>
                      <span className="text-xs font-medium text-black">
                        {profile?.major || 'Not set'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                      {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Logout
                    </button>
                    {profile?.is_admin && (
                      <button
                        onClick={() => router.push('/admin')}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Admin Panel
                      </button>
                    )}
                  </div>
                </div>
              
            </div>

            {/* Right Side - Profile Form */}
            <div className="lg:col-span-2">
              
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="mb-6">
                    <div className="mb-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Korean Students Organization</span>
                    </div>
                    <h1 className="text-2xl font-bold text-black mb-1">
                      {isEditing ? 'Edit Your Profile' : 'Profile Information'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {isEditing 
                        ? 'Update your information to help other KSO members connect with you'
                        : 'Your profile information is visible to other KSO members'
                      }
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">한국학생회</span> • Member Profile
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                      <p className="text-red-600 text-xs">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
                      <p className="text-green-600 text-xs">{success}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-base font-semibold text-black mb-3">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.full_name || ''}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 py-3">{profile?.full_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          {isEditing ? (
                            <div>
                              <input
                                type="text"
                                value={formData.username || ''}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                onBlur={handleUsernameBlur}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Enter username (optional)"
                              />
                              {isCheckingUsername && (
                                <p className="text-blue-600 text-xs mt-1">Checking username availability...</p>
                              )}
                              {usernameError && (
                                <p className="text-red-600 text-xs mt-1">{usernameError}</p>
                              )}
                              <p className="text-gray-500 text-xs mt-1">
                                Username can contain letters, numbers, and underscores. Must be at least 3 characters.
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-900 py-3">
                              {profile?.username ? `@${profile.username}` : 'Not set'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <p className="text-gray-900 py-3 text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                      <h3 className="text-base font-semibold text-black mb-3">Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Graduation Year
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={formData.graduation_year || ''}
                              onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value) || null)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="e.g., 2025"
                            />
                          ) : (
                            <p className="text-gray-900 py-3">{profile?.graduation_year || 'Not specified'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Major
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.major || ''}
                              onChange={(e) => handleInputChange('major', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="e.g., Computer Science"
                            />
                          ) : (
                            <p className="text-gray-900 py-3">{profile?.major || 'Not specified'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Type
                          </label>
                          {isEditing ? (
                            <div>
                              <select
                                value={formData.user_type || 'undergrad'}
                                onChange={(e) => handleInputChange('user_type', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              >
                                <option value="undergrad">Undergraduate Student</option>
                                <option value="grad">Graduate Student</option>
                                <option value="alumni">Alumni</option>
                                {/* Board member option removed - only admins can assign this */}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                Board member status can only be assigned by administrators
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-900 py-3 capitalize">{profile?.user_type?.replace('_', ' ')}</p>
                              {profile?.user_type === 'board_member' && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Board member status is managed by administrators
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {(formData.user_type === 'board_member' || profile?.user_type === 'board_member') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Board Position
                            </label>
                            {isEditing ? (
                              <div>
                                <input
                                  type="text"
                                  value={formData.board_position || ''}
                                  onChange={(e) => handleInputChange('board_position', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                  placeholder="e.g., President, Vice President"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Board position is only editable for existing board members
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-gray-900 py-3">{profile?.board_position || 'Not specified'}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Board position is managed by administrators
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h3 className="text-base font-semibold text-black mb-3">Professional Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            LinkedIn URL
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={formData.linkedin_url || ''}
                              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          ) : (
                            <p className="text-gray-900 py-3">
                              {profile?.linkedin_url ? (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {profile.linkedin_url}
                                </a>
                              ) : (
                                'Not specified'
                              )}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram URL
                          </label>
                          {isEditing ? (
                            <input
                              type="url"
                              value={formData.instagram_url || ''}
                              onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              placeholder="https://instagram.com/yourusername"
                            />
                          ) : (
                            <p className="text-gray-900 py-3">
                              {profile?.instagram_url ? (
                                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                                  {profile.instagram_url}
                                </a>
                              ) : (
                                'Not specified'
                              )}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          {isEditing ? (
                                                      <textarea
                            value={formData.bio || ''}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Tell us about yourself..."
                          />
                          ) : (
                            <p className="text-gray-900 py-3">{profile?.bio || 'No bio provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crop Modal */}
      {showCropModal && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Crop Profile Photo</h3>
              <p className="text-sm text-gray-600">Drag to position, resize to crop your photo</p>
            </div>
            
            <div className="p-4 overflow-auto max-h-[60vh]">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  circularCrop
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={previewUrl}
                    onLoad={onImageLoad}
                    className="max-w-full max-h-[50vh] object-contain"
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setShowCropModal(false);
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={uploadingPhoto || !completedCrop}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? 'Cropping...' : 'Crop Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 