import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AuthDebugger from "@/components/AuthDebugger";
import ThemeScript from "@/components/ThemeScript";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeScript />
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-white dark-mode:bg-gray-900 transition-colors duration-300">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
