'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

              useEffect(() => {
                if (!authLoading && !user) {
                  router.push('/auth');
                }
              }, [user, authLoading, router]);

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
                  }

                  // Clean and validate the data before sending
                  const cleanedData = {
                    ...formData,
                    full_name: formData.full_name?.trim(),
                    username: formData.username?.trim() || undefined,
                    major: formData.major?.trim(),
                    board_position: formData.board_position?.trim(),
                    linkedin_url: formData.linkedin_url?.trim(),
                    bio: formData.bio?.trim(),
                    // Convert graduation_year to number if it's a string, or undefined if null
                    graduation_year: formData.graduation_year ? Number(formData.graduation_year) : undefined,
                  };

                  console.log('Submitting profile update:', cleanedData);
                  await updateProfile(cleanedData);
                  setIsEditing(false);
                  setSuccess('Profile updated successfully!');
                  // Clear success message after 3 seconds
                  setTimeout(() => setSuccess(''), 3000);
                } catch (error: any) {
                  console.error('Profile update error:', error);
                  if (error.message.includes('duplicate key') || error.message.includes('username')) {
                    setUsernameError('This username is already taken');
                  } else {
                    setError(error.message);
                  }
                } finally {
                  setLoading(false);
                }
              };

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!completedCrop || !imgRef.current || !selectedFile) return;

    try {
      setUploadingPhoto(true);
      setError('');
      setSuccess('');

      // Get cropped image as file
      const croppedFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        selectedFile.name
      );

      // Upload cropped image to Supabase Storage
      const fileExt = croppedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      setSuccess('Profile photo updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowCropModal(false);
      setCrop(undefined);
      setCompletedCrop(undefined);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      setError(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const uploadProfilePhoto = async () => {
    if (!selectedFile || !user) return;

    setUploadingPhoto(true);
    setError('');
    setSuccess('');

    try {
      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      setSuccess('Profile photo updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      setError(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeProfilePhoto = async () => {
    if (!profile?.avatar_url) return;

    setUploadingPhoto(true);
    setError('');
    setSuccess('');

    try {
      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: undefined });
      
      setSuccess('Profile photo removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Photo removal error:', error);
      setError(error.message || 'Failed to remove photo');
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
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Profile Section */}
      <section className="min-h-screen bg-white py-8">
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
                          {uploadingPhoto ? 'Uploading...' : 'Crop & Save'}
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
                      onClick={() => {
                        if (confirm('Are you sure you want to logout?')) {
                          signOut();
                        }
                      }}
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Enter username (optional)"
                              />
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
                            <select
                              value={formData.user_type || 'undergrad'}
                              onChange={(e) => handleInputChange('user_type', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            >
                              <option value="undergrad">Undergraduate Student</option>
                              <option value="grad">Graduate Student</option>
                              <option value="alumni">Alumni</option>
                              <option value="board_member">Board Member</option>
                            </select>
                          ) : (
                            <p className="text-gray-900 py-3 capitalize">{profile?.user_type?.replace('_', ' ')}</p>
                          )}
                        </div>

                        {formData.user_type === 'board_member' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Board Position
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.board_position || ''}
                                onChange={(e) => handleInputChange('board_position', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="e.g., President, Vice President"
                              />
                            ) : (
                              <p className="text-gray-900 py-3">{profile?.board_position || 'Not specified'}</p>
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
                {uploadingPhoto ? 'Uploading...' : 'Crop & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 