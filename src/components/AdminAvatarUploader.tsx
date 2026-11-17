'use client';

import { useState } from 'react';
import AvatarCropper from '@/components/AvatarCropper';
import {
  AVATAR_ACCEPT,
  fetchAvatarAsFile,
  setProfileAvatar,
  toCroppableImage,
  uploadAvatar,
  validateSourceImage,
} from '@/lib/avatar';

interface AdminAvatarUploaderProps {
  /** Auth user id of the member whose photo is being changed. */
  targetUserId: string;
  /** Shown in the confirmation copy so an admin cannot mix up whose photo this is. */
  targetName: string;
  /** The member's current photo, if any — needed to re-crop it in place. */
  currentAvatarUrl?: string | null;
  /** Called with the new public URL, or null when the photo was removed. */
  onChanged: (avatarUrl: string | null) => void;
}

/**
 * Lets an admin adjust, replace or remove another member's profile photo.
 *
 * Runs the same pipeline as the member's own profile page (shared in
 * `@/lib/avatar` and `AvatarCropper`), the only difference being that it writes
 * the target's profile row directly instead of going through the auth context.
 *
 * This is gated in the UI, but the real enforcement is the storage and table
 * policies — see `sql_queries/avatars-admin-policies.sql`.
 */
export default function AdminAvatarUploader({
  targetUserId,
  targetName,
  currentAvatarUrl,
  onChanged,
}: AdminAvatarUploaderProps) {
  const [editing, setEditing] = useState<File | null>(null);
  /** True when `editing` is the stored photo rather than a newly picked file. */
  const [adjusting, setAdjusting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const hasExistingPhoto = !!currentAvatarUrl;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;

    const invalid = validateSourceImage(file);
    if (invalid) { setError(invalid); return; }

    setError('');
    setSuccess('');
    // Clear the input so re-picking the same file still fires onChange.
    input.value = '';

    try {
      const croppable = await toCroppableImage(file, setConverting);
      setAdjusting(false);
      setEditing(croppable);
    } catch (err) {
      console.error('Image decode failed:', err);
      setError('We could not read that image. Please try a JPEG or PNG.');
    }
  };

  const handleAdjustCurrent = async () => {
    if (!currentAvatarUrl) return;
    setError('');
    setSuccess('');
    setLoadingCurrent(true);
    try {
      setAdjusting(true);
      setEditing(await fetchAvatarAsFile(currentAvatarUrl));
    } catch (err: any) {
      console.error('Could not load the current photo:', err);
      setAdjusting(false);
      setError(
        err?.message ||
          'Could not load the current photo for editing. Try replacing it instead.',
      );
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handleSave = async (cropped: File) => {
    setBusy(true);
    setError('');
    try {
      const publicUrl = await uploadAvatar(targetUserId, cropped);
      await setProfileAvatar(targetUserId, publicUrl);
      setEditing(null);
      setAdjusting(false);
      setSuccess(`Photo updated for ${targetName}.`);
      onChanged(publicUrl);
    } catch (err: any) {
      console.error('Admin photo upload failed:', err);
      setError(err?.message || 'Could not update the photo. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError('');
    try {
      await setProfileAvatar(targetUserId, null);
      setConfirmingRemove(false);
      setSuccess(`Photo removed for ${targetName}.`);
      onChanged(null);
    } catch (err: any) {
      console.error('Admin photo removal failed:', err);
      setError(err?.message || 'Could not remove the photo. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const buttonBase =
    'text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-2 border transition-colors disabled:opacity-40';

  return (
    <div className="border border-gray-200 p-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold mb-3">
        Admin · Profile Photo
      </p>

      {!editing && (
        <div className="flex flex-wrap gap-2">
          {hasExistingPhoto && (
            <button
              type="button"
              onClick={handleAdjustCurrent}
              disabled={busy || loadingCurrent}
              className={`${buttonBase} border-gray-200 text-gray-600 hover:border-black hover:text-black`}
            >
              {loadingCurrent ? 'Loading…' : 'Adjust photo'}
            </button>
          )}

          <label className={`${buttonBase} border-gray-200 hover:border-black cursor-pointer`}>
            {hasExistingPhoto ? 'Replace photo' : 'Upload photo'}
            <input type="file" accept={AVATAR_ACCEPT} onChange={handleFileSelect} className="hidden" />
          </label>

          {hasExistingPhoto && !confirmingRemove && (
            <button
              type="button"
              onClick={() => { setConfirmingRemove(true); setSuccess(''); }}
              disabled={busy}
              className={`${buttonBase} border-gray-200 text-gray-500 hover:border-[#CD2E3A] hover:text-[#CD2E3A]`}
            >
              Remove photo
            </button>
          )}

          {confirmingRemove && (
            <>
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className={`${buttonBase} border-[#CD2E3A] bg-[#CD2E3A] text-white hover:bg-[#b02730]`}
              >
                {busy ? 'Removing…' : 'Confirm remove'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                disabled={busy}
                className={`${buttonBase} border-gray-200 text-gray-500 hover:border-black hover:text-black`}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {converting && (
        <p className="text-[10px] tracking-[0.14em] uppercase font-semibold text-gray-400 mt-3">
          Converting photo…
        </p>
      )}

      {editing && (
        <div className="mt-3">
          <AvatarCropper
            file={editing}
            busy={busy}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setAdjusting(false); setError(''); }}
            saveLabel={adjusting ? 'Save changes' : 'Save photo'}
            note={
              adjusting ? (
                <>
                  Straighten or re-crop the stored photo for{' '}
                  <span className="font-semibold text-black">{targetName}</span>. Cropping much
                  tighter will soften it — upload the original again for full resolution.
                </>
              ) : (
                <>
                  Crop the new photo for{' '}
                  <span className="font-semibold text-black">{targetName}</span>.
                </>
              )
            }
          />
        </div>
      )}

      {error && <p className="text-[#CD2E3A] text-xs mt-3">{error}</p>}
      {success && <p className="text-gray-500 text-xs mt-3">{success}</p>}
    </div>
  );
}
