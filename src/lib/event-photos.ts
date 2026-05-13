/** Image extensions we accept for event galleries (public folder + Supabase Storage). */
export const EVENT_IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

export type EventPhoto = { src: string; alt: string };

export const EVENT_PHOTOS_BUCKET = process.env.EVENT_PHOTOS_BUCKET ?? 'event-photos';

export const EVENT_PHOTOS_PREFIX_FORMAL =
  process.env.EVENT_PHOTOS_PREFIX_FORMAL ?? 'formal';

export const EVENT_PHOTOS_PREFIX_CULTURE_SHOW =
  process.env.EVENT_PHOTOS_PREFIX_CULTURE_SHOW ?? 'culture-show';
