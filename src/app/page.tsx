import { readdirSync } from 'fs';
import path from 'path';
import HomePage from '@/components/HomePage';

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function getHomepagePhotos(): { src: string; alt: string }[] {
  const dir = path.join(process.cwd(), 'public', 'formal');
  try {
    const files = readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort()
      .slice(0, 8); // use first 8 formal photos for homepage
    return files.map((name) => ({ src: `/formal/${name}`, alt: 'KSO Formal' }));
  } catch {
    return [];
  }
}

export default function Page() {
  const homepagePhotos = getHomepagePhotos();
  return <HomePage homepagePhotos={homepagePhotos} />;
}
