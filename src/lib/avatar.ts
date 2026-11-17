import { supabase } from '@/lib/supabase';

/**
 * Shared profile-photo pipeline.
 *
 * Both the member's own profile page and the admin panel run the same steps —
 * validate, decode (converting HEIC where the browser cannot), crop to a square
 * at real resolution, upload, point the profile row at it. Keeping it in one
 * place means a fix lands everywhere rather than in whichever copy was noticed.
 */

/**
 * Largest source image someone may pick. Only the cropped derivative is ever
 * uploaded, so this gates what the browser has to decode, not what we store —
 * phone photos routinely run past 5MB.
 */
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

/** Longest edge of the stored avatar, in real pixels. */
export const MAX_AVATAR_PX = 1024;

export const AVATAR_BUCKET = 'avatars';

/** Chrome omits .heic from an `image/*` picker, so name the extensions too. */
export const AVATAR_ACCEPT = 'image/*,.heic,.heif';

/** iOS shoots HEIC by default; the name is often the only reliable signal. */
const HEIC_NAME = /\.(heic|heif)$/i;
const HEIC_MIME = /image\/hei[cf]/i;

export const looksLikeHeic = (file: File) => HEIC_NAME.test(file.name) || HEIC_MIME.test(file.type);

/**
 * Whether this browser can decode the file into an <img> — which is what the
 * canvas crop needs. Safari handles HEIC natively; Chrome and Firefox do not.
 */
export const canDecodeInBrowser = (file: File) =>
  new Promise<boolean>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img.naturalWidth > 0); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
    img.src = url;
  });

/** Returns a message to show the user, or null when the file is acceptable. */
export function validateSourceImage(file: File): string | null {
  // iOS can report an empty or non-image MIME type for a .heic, so check the
  // extension before turning it away.
  if (!file.type.startsWith('image/') && !looksLikeHeic(file)) {
    return 'Please select an image file';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return `Image must be smaller than ${Math.round(MAX_PHOTO_BYTES / (1024 * 1024))}MB`;
  }
  return null;
}

/**
 * Hand back a file the canvas crop can actually decode.
 *
 * Only HEIC needs help, and only on browsers that cannot read it: Safari
 * decodes it natively, so we try that first and pay for the libheif conversion
 * — a lazily loaded chunk plus a second or two of work — just on Chrome and
 * Firefox.
 */
export async function toCroppableImage(
  file: File,
  onConverting?: (converting: boolean) => void,
): Promise<File> {
  if (!looksLikeHeic(file)) return file;
  if (await canDecodeInBrowser(file)) return file;

  onConverting?.(true);
  try {
    const { heicTo } = await import('heic-to');
    const converted = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.92 });
    return new File([converted], `${file.name.replace(HEIC_NAME, '')}.jpg`, {
      type: 'image/jpeg',
    });
  } finally {
    onConverting?.(false);
  }
}

/** Pixel rectangle in the *displayed* image's coordinate space. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Render the selected crop to a square-ish JPEG at the source's resolution. */
export function cropToAvatarFile(
  image: HTMLImageElement,
  crop: CropRect,
  fileName = 'avatar.jpg',
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // `crop` is measured in on-screen pixels. Convert to the image's real pixels,
  // otherwise the canvas is sized to however big the preview happened to render
  // and the stored avatar comes out soft on high-density screens.
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  // Cap the long edge so a full-resolution phone photo does not become a
  // multi-megabyte avatar.
  const fit = Math.min(1, MAX_AVATAR_PX / Math.max(sourceWidth, sourceHeight));
  canvas.width = Math.max(1, Math.round(sourceWidth * fit));
  canvas.height = Math.max(1, Math.round(sourceHeight * fit));

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas is empty')); return; }
      resolve(new File([blob], fileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  });
}

/**
 * Store the cropped avatar for `authUserId` and return its public URL.
 *
 * Objects are foldered by auth user id, which is what the storage policies key
 * on: members may write their own folder, admins may write anyone's.
 */
export async function uploadAvatar(authUserId: string, croppedFile: File): Promise<string> {
  // The crop always re-encodes to JPEG, so the stored name must say .jpg rather
  // than inherit the source extension (a .png or .HEIC holding JPEG bytes
  // confuses anything that trusts the extension).
  const filePath = `${authUserId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, croppedFile, {
    contentType: 'image/jpeg',
  });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Point a profile row at a new avatar (or clear it).
 *
 * Used when acting on *another* member's profile; a member changing their own
 * photo goes through `updateProfile` so the auth context stays in step.
 */
export async function setProfileAvatar(authUserId: string, publicUrl: string | null) {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('user_id', authUserId);
  if (error) throw new Error(`Could not update profile photo: ${error.message}`);
}

/** Quarter turns clockwise. Enough for "my phone saved it sideways". */
export type Rotation = 0 | 90 | 180 | 270;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image'));
    img.src = src;
  });

/**
 * Re-encode `file` rotated clockwise by `degrees`.
 *
 * Rotation is baked into a new file rather than applied as a CSS transform on
 * the crop preview. react-image-crop reports the selection in the *displayed*
 * element's coordinates, so a visually rotated image would need every crop
 * coordinate transformed back — easy to get subtly wrong. Rotating the pixels
 * first keeps `cropToAvatarFile` working on plain, upright input.
 *
 * Callers should always rotate the ORIGINAL file by the cumulative angle rather
 * than rotating the previous result again, so repeated turns cost one re-encode
 * instead of one per click.
 */
export async function rotateImageFile(file: File, degrees: Rotation): Promise<File> {
  if (degrees === 0) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    // A quarter turn swaps the axes.
    const swap = degrees === 90 || degrees === 270;
    canvas.width = swap ? img.naturalHeight : img.naturalWidth;
    canvas.height = swap ? img.naturalWidth : img.naturalHeight;

    ctx.imageSmoothingQuality = 'high';
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.95),
    );
    if (!blob) throw new Error('Canvas is empty');

    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Pull an already-stored avatar back down as a File, so it can go through the
 * same crop-and-rotate editor as a freshly picked photo.
 *
 * Note this re-crops the stored derivative, which is already capped at
 * MAX_AVATAR_PX — fine for straightening or re-centring, but cropping much
 * tighter will soften the result. Uploading the original again is the way to
 * get full resolution back.
 */
export async function fetchAvatarAsFile(
  url: string,
  fileName = 'current-photo.jpg',
): Promise<File> {
  // Cache-bust. The <img> on the page already fetched this URL *without* CORS,
  // and the browser will happily hand that cached opaque response to fetch(),
  // which then fails the cross-origin check and taints the canvas.
  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}recrop=${Date.now()}`, {
    mode: 'cors',
    cache: 'reload',
  });
  if (!response.ok) {
    throw new Error(`Could not load the current photo (${response.status})`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith('image/')) {
    throw new Error('The stored photo is not a readable image');
  }
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}
