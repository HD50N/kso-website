import type { NextConfig } from 'next';

const supabaseImagePatterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    supabaseImagePatterns.push({
      protocol: 'https',
      hostname,
      pathname: '/storage/v1/object/public/**',
    });
  } catch {
    /* invalid URL at build time */
  }
}

const nextConfig: NextConfig = {
  images: {
    /** Default in Next 16 is [75]; gallery `Image` uses 78 / 85. */
    qualities: [75, 78, 85],
    ...(supabaseImagePatterns.length > 0 ? { remotePatterns: supabaseImagePatterns } : {}),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
