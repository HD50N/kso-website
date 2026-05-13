import { readdirSync } from 'fs';
import path from 'path';
import HomePage from '@/components/HomePage';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function getHomepagePhotos(): { src: string; alt: string }[] {
  // Formal photos (JPG/JPEG only — HEIC files aren't served)
  let formalPhotos: { src: string; alt: string }[] = [];
  try {
    const files = readdirSync(path.join(process.cwd(), 'public', 'formal'))
      .filter((f) => IMAGE_EXT.test(f))
      .sort();
    // Pick 5 evenly spaced across the collection
    const step = Math.max(1, Math.floor(files.length / 5));
    formalPhotos = Array.from({ length: 5 }, (_, i) => files[i * step])
      .filter(Boolean)
      .map((name) => ({ src: `/formal/${name}`, alt: 'KSO Winter Formal' }));
  } catch {}

  // Culture show photos — prefer professional DSC shots
  let csPhotos: { src: string; alt: string }[] = [];
  try {
    const files = readdirSync(path.join(process.cwd(), 'public', 'culture-show'))
      .filter((f) => IMAGE_EXT.test(f) && f.startsWith('DSC'))
      .sort();
    // Pick 5 evenly spaced
    const step = Math.max(1, Math.floor(files.length / 5));
    csPhotos = Array.from({ length: 5 }, (_, i) => files[i * step])
      .filter(Boolean)
      .map((name) => ({ src: `/culture-show/${name}`, alt: 'KSO Culture Show' }));
  } catch {}

  // Culture show photo leads (gets the large featured slot), then alternate
  const mixed: { src: string; alt: string }[] = [];
  const len = Math.max(formalPhotos.length, csPhotos.length);
  for (let i = 0; i < len; i++) {
    if (i < csPhotos.length) mixed.push(csPhotos[i]);
    if (i < formalPhotos.length) mixed.push(formalPhotos[i]);
  }
  return mixed.slice(0, 10);
}

export default function Page() {
  const homepagePhotos = getHomepagePhotos();
  return <HomePage homepagePhotos={homepagePhotos} />;
}
