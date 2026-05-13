import HomePage from '@/components/HomePage';
import { getHomepageEventPhotos } from '@/lib/event-photos-storage.server';

/** Refresh homepage photo strip periodically so Supabase uploads show up without redeploying. */
export const revalidate = 300;

export default async function Page() {
  const homepagePhotos = await getHomepageEventPhotos();
  return <HomePage homepagePhotos={homepagePhotos} />;
}
