'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DropdownNavProps {
  label: string;
  items: { name: string; href: string }[];
  isActive?: boolean;
}

export default function DropdownNav({ label, items, isActive = false }: DropdownNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDropdownActive = items.some(item => pathname === item.href);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative group flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors ${
          isActive || isDropdownActive ? 'text-black' : 'text-gray-400 hover:text-black'
        }`}
      >
        <span>{label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
        <span className={`absolute -bottom-[17px] left-0 h-px bg-black transition-all duration-200 ${
          isActive || isDropdownActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-44 bg-white border border-gray-100 shadow-sm z-[60]">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors border-b border-gray-50 last:border-0 ${
                pathname === item.href
                  ? 'text-black bg-gray-50'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
