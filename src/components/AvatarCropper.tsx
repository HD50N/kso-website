'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Rotation, cropToAvatarFile, rotateImageFile } from '@/lib/avatar';

interface AvatarCropperProps {
  /** The image being edited — a freshly picked file, or the stored photo. */
  file: File;
  /** Called with the finished square JPEG. */
  onSave: (cropped: File) => void | Promise<void>;
  onCancel: () => void;
  /** True while the caller is uploading; disables the controls. */
  busy?: boolean;
  saveLabel?: string;
  busyLabel?: string;
  /** Shown above the image, e.g. whose photo this is. */
  note?: React.ReactNode;
}

/**
 * Crop-and-straighten surface shared by the member's own profile page and the
 * admin panel.
 *
 * It owns the fiddly parts — cumulative rotation, re-centring the selection
 * whenever the image changes, revoking object URLs — so neither caller has to
 * reimplement them and drift from the other.
 */
export default function AvatarCropper({
  file,
  onSave,
  onCancel,
  busy = false,
  saveLabel = 'Save photo',
  busyLabel = 'Saving…',
  note,
}: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState('');

  // Rotate the ORIGINAL by the cumulative angle, never the previous result, so
  // four clicks cost one re-encode rather than four.
  useEffect(() => {
    let cancelled = false;
    let created: string | null = null;

    (async () => {
      setRotating(true);
      try {
        const rotated = await rotateImageFile(file, rotation);
        if (cancelled) return;
        created = URL.createObjectURL(rotated);
        // Drop the previous selection: it was measured against the old
        // orientation, and onImageLoad will centre a fresh one.
        setCrop(undefined);
        setCompletedCrop(undefined);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return created;
        });
      } catch (err) {
        console.error('Rotate failed:', err);
        if (!cancelled) setError('Could not rotate that image.');
      } finally {
        if (!cancelled) setRotating(false);
      }
    })();

    return () => {
      cancelled = true;
      // If this effect lost the race, the URL it made is owned by nobody else.
      if (created) URL.revokeObjectURL(created);
    };
  }, [file, rotation]);

  // Final cleanup on unmount.
  useEffect(
    () => () => {
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    },
    [],
  );

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  }, []);

  const turn = (delta: number) =>
    setRotation((prev) => (((prev + delta) % 360 + 360) % 360) as Rotation);

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    setError('');
    try {
      await onSave(await cropToAvatarFile(imgRef.current, completedCrop));
    } catch (err: any) {
      console.error('Crop failed:', err);
      setError(err?.message || 'Could not process that image.');
    }
  };

  const disabled = busy || rotating;
  const controlClass =
    'text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-2 border transition-colors disabled:opacity-40';

  return (
    <div>
      {note && <p className="text-xs text-gray-500 mb-2">{note}</p>}

      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => turn(-90)}
          disabled={disabled}
          title="Rotate left"
          aria-label="Rotate left"
          className={`${controlClass} border-gray-200 text-gray-600 hover:border-black hover:text-black`}
        >
          ↺ Left
        </button>
        <button
          type="button"
          onClick={() => turn(90)}
          disabled={disabled}
          title="Rotate right"
          aria-label="Rotate right"
          className={`${controlClass} border-gray-200 text-gray-600 hover:border-black hover:text-black`}
        >
          ↻ Right
        </button>
        {rotation !== 0 && (
          <span className="text-[10px] tracking-[0.14em] uppercase text-gray-400">
            {rotation}°
          </span>
        )}
      </div>

      <div className="max-h-72 overflow-auto border border-gray-100 bg-gray-50 flex justify-center">
        {previewUrl && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            minWidth={48}
            minHeight={48}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Profile photo being cropped"
              onLoad={onImageLoad}
              className="max-w-full max-h-[50vh] object-contain"
            />
          </ReactCrop>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || !completedCrop}
          className={`${controlClass} border-black bg-black text-white hover:bg-gray-800`}
        >
          {busy ? busyLabel : rotating ? 'Rotating…' : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={`${controlClass} border-gray-200 text-gray-500 hover:border-black hover:text-black`}
        >
          Cancel
        </button>
      </div>

      {error && <p className="text-[#CD2E3A] text-xs mt-3">{error}</p>}
    </div>
  );
}
