import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

/** Pin root to this app — a parent `/Users/.../package.json` otherwise confuses Turbopack into resolving from Desktop. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

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
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    /**
     * Event photos live in Supabase Storage. Optimizing through `/_next/image`
     * means Vercel fetches each original once, then serves cached WebP/AVIF —
     * dramatically cutting Storage egress vs `unoptimized` (browser → Supabase every time).
     */
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    formats: ['image/avif', 'image/webp'],
    /** Cap widths so lightbox/grid never request 2K–4K derivatives. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 128, 256, 384],
    qualities: [65, 70, 75, 78, 85],
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
