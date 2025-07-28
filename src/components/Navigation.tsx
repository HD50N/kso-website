'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Executive Board', href: '/board' },
    { name: 'Network', href: '/alumni' },
    { name: 'Culture Show', href: '/culture-show' },
    ...(profile?.is_admin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          {/* Left side - Logo */}
          <div className="flex items-center w-32 z-10">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="font-display text-2xl font-bold text-black group-hover:scale-110 transition-transform">UChicago KSO</span>
            </Link>
          </div>
          
          {/* Center - Navigation Links - Absolutely Centered */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-4 xl:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-body-bold px-2 xl:px-3 py-2 rounded-xl text-xs xl:text-sm transition-all duration-300 relative group hover-scale whitespace-nowrap ${
                    pathname === item.href
                      ? 'text-black bg-gray-50'
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full ${
                    pathname === item.href ? 'w-full' : ''
                  }`}></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Auth buttons and mobile menu */}
          <div className="flex items-center w-32 justify-end z-10">
            {/* Auth buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <Link 
                  href="/profile"
                  className="font-body-bold px-4 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-all duration-300"
                >
                  Profile
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  className="font-body-bold px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-300"
                >
                  Login
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-3 pt-3 pb-4 space-y-1 bg-white border-t shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-body-bold block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'text-black bg-gray-50'
                    : 'text-gray-700 hover:text-black hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {user ? (
                <Link 
                  href="/profile"
                  className="font-body-bold block w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  className="font-body-bold block w-full text-left px-3 py-2.5 rounded-lg text-sm bg-black text-white hover:bg-gray-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 