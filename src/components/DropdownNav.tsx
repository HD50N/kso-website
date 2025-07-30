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

  // Close dropdown when clicking outside
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

  // Check if any dropdown item is active
  const isDropdownActive = items.some(item => pathname === item.href);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`font-body-bold px-2 xl:px-3 py-2 rounded-xl text-xs xl:text-sm transition-all duration-300 relative group hover-scale whitespace-nowrap flex items-center space-x-1 ${
          isActive || isDropdownActive
            ? 'text-black bg-gray-50'
            : 'text-gray-700 hover:text-black hover:bg-gray-50'
        }`}
      >
        <span>{label}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full ${
          isActive || isDropdownActive ? 'w-full' : ''
        }`}></span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? 'text-black bg-gray-50'
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 