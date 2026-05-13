'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface UserDropdownProps {
  user: any;
  profile: any;
}

export default function UserDropdown({ user, profile }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account';

  const itemClass =
    'block w-full text-left px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors border-b border-gray-50 last:border-0 text-gray-400 hover:text-black hover:bg-gray-50';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors text-gray-400 hover:text-black max-w-[140px] sm:max-w-[180px]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="truncate">{displayName}</span>
        <svg
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
        <span
          className={`absolute -bottom-[17px] left-0 h-px bg-black transition-all duration-200 ${
            isOpen ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-52 bg-white border border-gray-100 shadow-sm z-[60]">
          <Link href="/profile" onClick={() => setIsOpen(false)} className={itemClass}>
            Profile
          </Link>

          {profile?.is_admin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className={itemClass}>
              Admin Panel
            </Link>
          )}

          <button type="button" onClick={handleSignOut} className={itemClass}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
