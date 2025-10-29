import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import { Analytics } from "@vercel/analytics/next";
import SpotifyPlayerWidget from "@/components/SpotifyPlayerWidget";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Korean Students Organization (KSO) - University of Chicago",
  description: "Representing and unifying the Korean and Korean-American student community at the University of Chicago since 1976.",
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>
          <AuthProvider>
            <CartProvider>
              <SpotifyPlayerProvider>
                <div className="min-h-screen bg-white">
                  {children}
                </div>
                <SpotifyPlayerWidget playlistId={process.env.NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST_ID || ''} />
              </SpotifyPlayerProvider>
            </CartProvider>
          </AuthProvider>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
