'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import DropdownNav from './DropdownNav';
import UserDropdown from './UserDropdown';

interface NavigationProps {
  onOpenCart?: () => void;
}

export default function Navigation({ onOpenCart }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { cartItemCount } = useCart();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Board', href: '/board' },
    { name: 'Network', href: '/alumni' },
    { name: 'Internships', href: '/internships' },
    { name: 'Applications', href: '/applications' },
  ];

  const bigEventsItems = [
    { name: 'Culture Show', href: '/culture-show' },
    { name: 'Formal', href: '/formal' },
  ];

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
        {/* Taegeuk colour stripe */}
        <div className="flex">
          <div className="flex-1 h-[3px] bg-[#CD2E3A]" />
          <div className="flex-1 h-[3px] bg-[#0047A0]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">

            {/* Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0 z-10 font-[family-name:var(--font-poppins)]"
            >
              <div className="w-6 h-6 flex-shrink-0 grid grid-cols-2 place-items-center" aria-hidden="true">
                <span className="text-[11px] leading-none text-black">☰</span>
                <span className="text-[11px] leading-none text-black">☵</span>
                <span className="text-[11px] leading-none text-black">☲</span>
                <span className="text-[11px] leading-none text-black">☷</span>
              </div>
              <div className="flex items-center">
                <span className="text-black font-semibold text-[15px] tracking-[-0.02em]">KSO</span>
                <span className="w-px h-4 bg-[#CD2E3A] mx-2.5 flex-shrink-0" aria-hidden />
                <span className="text-gray-500 text-[11px] font-medium tracking-[0.12em] uppercase">UChicago</span>
              </div>
            </Link>

            {/* Desktop center nav */}
            <div className="hidden lg:flex items-center gap-7 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors group ${
                    pathname === item.href ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-[17px] left-0 h-px bg-black transition-all duration-200 ${
                    pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
              <DropdownNav label="Events" items={bigEventsItems} />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 z-10">
              {/* Cart */}
              <div className="hidden lg:block">
                {onOpenCart ? (
                  <button
                    onClick={onOpenCart}
                    title="Shopping Cart"
                    className="relative p-1 text-gray-500 hover:text-black transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#CD2E3A] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link href="/shop" title="Shop" className="relative p-1 text-gray-500 hover:text-black transition-colors block">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#CD2E3A] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {/* Auth */}
              <div className="hidden lg:block">
                {user ? (
                  <UserDropdown user={user} profile={profile} />
                ) : (
                  <Link href="/auth">
                    <span className="inline-block bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-5 py-2.5 hover:bg-gray-800 transition-colors cursor-pointer">
                      Login
                    </span>
                  </Link>
                )}
              </div>

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-1.5 text-black"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Site-wide announcement — matches Home editorial UI */}
      <div className="bg-[#0a0a0a] h-9 flex items-center justify-between px-6 lg:px-8 border-b border-white/5">
        <span className="text-white text-[10px] tracking-[0.18em] uppercase font-medium truncate pr-4">
          Have a great summer <span className="text-white/40 ml-2 normal-case tracking-normal">· 좋은 여름 보내세요</span>
        </span>
        <a
          href="https://www.instagram.com/uchicagokso?utm_source=ig_web_button_share_sheet&igsh=MWEzNTJibndqMGJ0eA=="
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <span className="text-[#CD2E3A] text-[10px] tracking-[0.18em] uppercase font-semibold hover:text-white transition-colors cursor-pointer">
            Follow us →
          </span>
        </a>
      </div>

      {/* Mobile full-screen overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 flex-shrink-0">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 font-[family-name:var(--font-poppins)]"
            >
              <div className="w-6 h-6 flex-shrink-0 grid grid-cols-2 place-items-center" aria-hidden="true">
                <span className="text-[11px] leading-none text-black">☰</span>
                <span className="text-[11px] leading-none text-black">☵</span>
                <span className="text-[11px] leading-none text-black">☲</span>
                <span className="text-[11px] leading-none text-black">☷</span>
              </div>
              <span className="text-black font-semibold text-[15px] tracking-[-0.02em]">KSO</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 text-black"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-6 py-2">
            {navItems.map((item, i) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between py-5 border-b border-gray-100 text-xl font-bold tracking-tight transition-colors ${
                  pathname === item.href ? 'text-black' : 'text-gray-300 hover:text-black'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-xs text-gray-200 font-mono tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}

            <div className="pt-6">
              <div className="text-[9px] tracking-[0.28em] uppercase text-gray-400 font-semibold mb-2">Events</div>
              {bigEventsItems.map((item, i) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between py-5 border-b border-gray-100 text-xl font-bold tracking-tight transition-colors ${
                    pathname === item.href ? 'text-black' : 'text-gray-300 hover:text-black'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-200 font-mono tabular-nums">
                    {String(navItems.length + i + 1).padStart(2, '0')}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="px-6 py-6 border-t border-gray-100 space-y-2 flex-shrink-0">
            {onOpenCart ? (
              <button
                onClick={() => { onOpenCart(); setIsMenuOpen(false); }}
                className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-[#CD2E3A] text-white text-[9px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            ) : (
              <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                <span>Shop</span>
                {cartItemCount > 0 && (
                  <span className="bg-[#CD2E3A] text-white text-[9px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                  Profile
                </Link>
                {profile?.is_admin && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors">
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                <span className="block w-full text-center bg-black text-white text-[10px] font-semibold tracking-[0.18em] uppercase py-4 hover:bg-gray-800 transition-colors cursor-pointer mt-2">
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
