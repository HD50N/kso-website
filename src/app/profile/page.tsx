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
import PhotoDownloadButton from '@/components/PhotoDownloadButton';
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

  useEffect(() => {
    return () => { if (previewUrl) { URL.revokeObjectURL(previewUrl); } };
  }, [previewUrl]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username || username === profile?.username) return true;
    setIsCheckingUsername(true);
    setUsernameError('');
    try {
      const { data, error } = await supabase.from('profiles').select('username').eq('username', username).single();
      if (error && error.code === 'PGRST116') { return true; } else if (data) { setUsernameError('This username is already taken'); return false; }
      return true;
    } catch (error) {
      console.error('Username validation error:', error);
      return true;
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
      if (formData.username) {
        const username = formData.username.trim();
        if (username.length < 3) { setUsernameError('Username must be at least 3 characters long'); setLoading(false); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) { setUsernameError('Username can only contain letters, numbers, and underscores'); setLoading(false); return; }
        const isUsernameAvailable = await validateUsername(username);
        if (!isUsernameAvailable) { setLoading(false); return; }
      }

      const cleanedData = {
        ...formData,
        full_name: formData.full_name?.trim(),
        username: formData.username?.trim() || undefined,
        major: formData.major?.trim(),
        board_position: formData.board_position?.trim(),
        linkedin_url: formData.linkedin_url?.trim(),
        instagram_url: formData.instagram_url?.trim(),
        bio: formData.bio?.trim(),
        graduation_year: formData.graduation_year ? Number(formData.graduation_year) : undefined,
        user_type: formData.user_type === 'board_member' ? profile?.user_type || 'undergrad' : formData.user_type,
      };

      const timeoutPromise = new Promise((_, reject) => { setTimeout(() => reject(new Error('Operation timed out')), 15000); });
      await Promise.race([(async () => { await updateProfile(cleanedData); })(), timeoutPromise]);

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Profile update error:', error);
      if (error.message?.includes('duplicate key') || error.message?.includes('username')) { setUsernameError('This username is already taken'); }
      else if (error.message?.includes('timeout') || error.message?.includes('timed out')) { setError('Request timed out. Please try again.'); }
      else if (error.message?.includes('network') || error.message?.includes('connection')) { setError('Network error. Please check your connection and try again.'); }
      else { setError(error.message || 'An unexpected error occurred. Please try again.'); }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'username') { setUsernameError(''); }
  };

  const handleUsernameBlur = async () => {
    if (formData.username && formData.username !== profile?.username) { await validateUsername(formData.username); }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
      if (file.size > 5 * 1024 * 1024) { setError('Image must be smaller than 5MB'); return; }
      setSelectedFile(file);
      setError('');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowCropModal(true);
    }
  };

  const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
    return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) { const { width, height } = e.currentTarget; setCrop(centerAspectCrop(width, height, aspect)); }
  };

  const aspect = 1;

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<File> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas is empty')); return; }
        resolve(new File([blob], fileName, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile || !user) return;
    try {
      setUploadingPhoto(true);
      setError('');
      const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, selectedFile.name);
      const fileExt = croppedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, croppedImageFile);
      if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ avatar_url: publicUrl });
      setCroppedFile(null); setSelectedFile(null); setPreviewUrl(null); setPendingPhotoUrl(null);
      setShowCropModal(false); setCrop(undefined); setCompletedCrop(undefined);
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
      await updateProfile({ avatar_url: undefined });
      setCroppedFile(null); setSelectedFile(null); setPreviewUrl(null); setPendingPhotoUrl(null);
      setSuccess('Profile photo removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError('Failed to remove profile photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 bg-white text-sm text-black focus:outline-none focus:border-black transition-colors";
  const labelClass = "block text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-500 mb-2";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="min-h-[50vh] flex items-center justify-center px-6">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-[calc(4rem+2.25rem)] inset-x-0 z-50 bg-[#CD2E3A] text-white px-6 py-3 text-center">
          <span className="text-xs font-semibold tracking-[0.1em] uppercase">You&apos;re offline — some features may not work</span>
        </div>
      )}

      {/* Hero */}
      <section className="border-b border-gray-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-start">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase text-gray-400 font-medium mb-10">
                KSO Network
              </p>
              <h1 className="text-[4.5rem] sm:text-[6rem] lg:text-[7.5rem] font-black text-black leading-[0.87] tracking-tighter">
                {isEditing ? (
                  <>Edit<br />Profile</>
                ) : (
                  <>My<br />Profile</>
                )}
              </h1>
            </div>
            <div className="lg:pt-20">
              <div className="w-10 h-px bg-[#CD2E3A] mb-8" />
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light italic mb-6">
                &ldquo;Keep your directory listing current so members can find you.&rdquo;
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-md">
                Update your bio, major, social links, and photo. Changes sync to the member directory.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3 transition-colors ${
                    isEditing ? 'border border-gray-200 text-gray-600 hover:border-black hover:text-black' : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3 border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-colors"
                >
                  Logout
                </button>
                {profile?.is_admin && (
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="text-[10px] font-semibold tracking-[0.18em] uppercase px-6 py-3 bg-[#CD2E3A] text-white hover:bg-[#b02633] transition-colors"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile content */}
      <section className="py-20 lg:py-24 px-6 lg:px-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Left sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-gray-100 p-6 sticky top-24">
                {/* Avatar */}
                <div className="mb-6">
                  <div className="relative w-20 h-20 mb-4 group">
                    {profile?.avatar_url ? (
                      <>
                        <img src={profile.avatar_url} alt="Profile" className="w-20 h-20 object-cover" />
                        {!selectedFile && (
                          <div className="absolute top-0 left-0 z-10 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                            <PhotoDownloadButton
                              imageUrl={profile.avatar_url}
                              fileName={`${profile.full_name?.replace(/\s+/g, '_') || 'profile'}-kso.jpg`}
                              tone="onLight"
                              size="sm"
                            />
                          </div>
                        )}
                      </>
                    ) : previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-black text-gray-300">
                          {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                        </span>
                      </div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-black flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </div>

                  {showCropModal && (
                    <div className="space-y-2 mb-4">
                      <button onClick={handleCropComplete} disabled={uploadingPhoto} className="w-full text-[10px] tracking-[0.14em] uppercase font-semibold py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {uploadingPhoto ? 'Cropping...' : 'Crop Photo'}
                      </button>
                      <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setShowCropModal(false); setCrop(undefined); setCompletedCrop(undefined); }} className="w-full text-[10px] tracking-[0.14em] uppercase font-semibold py-2 border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-colors">
                        Cancel
                      </button>
                    </div>
                  )}

                  {profile?.avatar_url && !selectedFile && (
                    <button onClick={removeProfilePhoto} disabled={uploadingPhoto} className="w-full text-[10px] tracking-[0.14em] uppercase font-semibold py-2 border border-gray-200 text-gray-400 hover:border-[#CD2E3A] hover:text-[#CD2E3A] transition-colors disabled:opacity-50 mb-4">
                      {uploadingPhoto ? 'Removing...' : 'Remove Photo'}
                    </button>
                  )}

                  <h2 className="text-base font-black text-black tracking-tight">{profile?.full_name || 'User'}</h2>
                  {profile?.username && <p className="text-xs text-gray-400 mt-0.5">@{profile.username}</p>}
                  <p className="text-xs text-gray-500 mt-1 capitalize">{profile?.user_type?.replace('_', ' ') || 'Member'}</p>
                  {profile?.board_position && <p className="text-xs text-[#CD2E3A] font-semibold mt-1">{profile.board_position}</p>}
                </div>

                {/* Stats */}
                <div className="divide-y divide-gray-100">
                  <div className="flex justify-between py-3 text-xs">
                    <span className="text-gray-400">Member Since</span>
                    <span className="font-semibold text-black">{profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}</span>
                  </div>
                  <div className="flex justify-between py-3 text-xs">
                    <span className="text-gray-400">Graduation</span>
                    <span className="font-semibold text-black">{profile?.graduation_year || '—'}</span>
                  </div>
                  <div className="flex justify-between py-3 text-xs">
                    <span className="text-gray-400">Major</span>
                    <span className="font-semibold text-black text-right max-w-[130px] leading-tight">{profile?.major || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-2">
              {/* Alerts */}
              {error && (
                <div className="border border-[#CD2E3A]/20 bg-[#CD2E3A]/5 px-4 py-3 mb-6">
                  <p className="text-[#CD2E3A] text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="border border-green-200 bg-green-50 px-4 py-3 mb-6">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Basic info */}
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-6">Basic Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      {isEditing ? (
                        <input type="text" value={formData.full_name || ''} onChange={(e) => handleInputChange('full_name', e.target.value)} required className={inputClass} />
                      ) : (
                        <p className="text-gray-900 py-3 text-sm">{profile?.full_name}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Username</label>
                      {isEditing ? (
                        <div>
                          <input type="text" value={formData.username || ''} onChange={(e) => handleInputChange('username', e.target.value)} onBlur={handleUsernameBlur} className={inputClass} placeholder="Enter username (optional)" />
                          {isCheckingUsername && <p className="text-gray-400 text-xs mt-1.5">Checking availability...</p>}
                          {usernameError && <p className="text-[#CD2E3A] text-xs mt-1.5">{usernameError}</p>}
                          <p className="text-gray-400 text-xs mt-1.5">Letters, numbers, and underscores. Min. 3 characters.</p>
                        </div>
                      ) : (
                        <p className="text-gray-900 py-3 text-sm">{profile?.username ? `@${profile.username}` : '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <p className="text-gray-500 py-3 text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Academic */}
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-6">Academic Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Graduation Year</label>
                      {isEditing ? (
                        <input type="number" value={formData.graduation_year || ''} onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value) || null)} className={inputClass} placeholder="e.g., 2026" />
                      ) : (
                        <p className="text-gray-900 py-3 text-sm">{profile?.graduation_year || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Major</label>
                      {isEditing ? (
                        <input type="text" value={formData.major || ''} onChange={(e) => handleInputChange('major', e.target.value)} className={inputClass} placeholder="e.g., Computer Science" />
                      ) : (
                        <p className="text-gray-900 py-3 text-sm">{profile?.major || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Member Type</label>
                      {isEditing ? (
                        <div>
                          <select value={formData.user_type || 'undergrad'} onChange={(e) => handleInputChange('user_type', e.target.value)} className={inputClass}>
                            <option value="undergrad">Undergraduate Student</option>
                            <option value="grad">Graduate Student</option>
                            <option value="alumni">Alumni</option>
                          </select>
                          <p className="text-gray-400 text-xs mt-1.5">Board member status can only be assigned by administrators.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-900 py-3 text-sm capitalize">{profile?.user_type?.replace('_', ' ')}</p>
                          {profile?.user_type === 'board_member' && <p className="text-xs text-gray-400">Board member status managed by admins.</p>}
                        </div>
                      )}
                    </div>
                    {(formData.user_type === 'board_member' || profile?.user_type === 'board_member') && (
                      <div>
                        <label className={labelClass}>Board Position</label>
                        {isEditing ? (
                          <div>
                            <input type="text" value={formData.board_position || ''} onChange={(e) => handleInputChange('board_position', e.target.value)} className={inputClass} placeholder="e.g., President, Vice President" />
                            <p className="text-gray-400 text-xs mt-1.5">Only editable for existing board members.</p>
                          </div>
                        ) : (
                          <p className="text-gray-900 py-3 text-sm">{profile?.board_position || '—'}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional */}
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-gray-400 font-medium mb-6">Professional Information</p>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>LinkedIn URL</label>
                      {isEditing ? (
                        <input type="url" value={formData.linkedin_url || ''} onChange={(e) => handleInputChange('linkedin_url', e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/yourprofile" />
                      ) : (
                        <p className="py-3 text-sm">
                          {profile?.linkedin_url ? (
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2 hover:no-underline">{profile.linkedin_url}</a>
                          ) : <span className="text-gray-500">—</span>}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Instagram URL</label>
                      {isEditing ? (
                        <input type="url" value={formData.instagram_url || ''} onChange={(e) => handleInputChange('instagram_url', e.target.value)} className={inputClass} placeholder="https://instagram.com/yourusername" />
                      ) : (
                        <p className="py-3 text-sm">
                          {profile?.instagram_url ? (
                            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2 hover:no-underline">{profile.instagram_url}</a>
                          ) : <span className="text-gray-500">—</span>}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Bio</label>
                      {isEditing ? (
                        <textarea value={formData.bio || ''} onChange={(e) => handleInputChange('bio', e.target.value)} rows={4} className={inputClass} placeholder="Tell us about yourself..." />
                      ) : (
                        <p className="text-gray-900 py-3 text-sm leading-relaxed">{profile?.bio || '—'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 border border-gray-200 text-sm text-gray-600 hover:border-black hover:text-black transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-black text-white text-[10px] font-semibold tracking-[0.14em] uppercase hover:bg-gray-800 transition-colors disabled:opacity-50">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Crop modal */}
      {showCropModal && previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-black tracking-tight">Crop Profile Photo</h3>
                <p className="text-xs text-gray-400 mt-0.5">Drag to position, resize to crop</p>
              </div>
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setShowCropModal(false); setCrop(undefined); setCompletedCrop(undefined); }} className="p-1.5 text-gray-400 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh]">
              <div className="flex justify-center">
                <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect} circularCrop minWidth={100} minHeight={100}>
                  <img ref={imgRef} alt="Crop me" src={previewUrl} onLoad={onImageLoad} className="max-w-full max-h-[50vh] object-contain" />
                </ReactCrop>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setShowCropModal(false); setCrop(undefined); setCompletedCrop(undefined); }} className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 hover:border-black hover:text-black transition-colors">
                Cancel
              </button>
              <button onClick={handleCropComplete} disabled={uploadingPhoto || !completedCrop} className="px-5 py-2.5 bg-black text-white text-[10px] font-semibold tracking-[0.14em] uppercase hover:bg-gray-800 transition-colors disabled:opacity-50">
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
