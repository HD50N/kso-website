'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export default function ScrollAnimation({ 
  children, 
  className = '', 
  threshold = 0.6, 
  rootMargin = '0px 0px 100px 0px' 
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable scroll animations on mobile devices
    const isMobile = window.innerWidth < 768; // md breakpoint
    
    if (isMobile) {
      // On mobile, immediately show the content without scroll animation
      const currentRef = ref.current;
      if (currentRef) {
        currentRef.classList.add('visible');
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={`scroll-trigger ${className}`}>
      {children}
    </div>
  );
} 