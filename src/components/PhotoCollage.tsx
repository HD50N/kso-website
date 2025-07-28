'use client';

import { useEffect, useState, useRef } from 'react';

export default function PhotoCollage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress through the section
      const sectionHeight = rect.height;
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      
      // Animation starts when section is 50% visible and ends when it's 50% past viewport
      const animationStart = windowHeight * 0.5;
      const animationEnd = -sectionHeight * 0.5;
      const animationRange = animationStart - animationEnd;
      
      let progress = 0;
      
      if (sectionTop <= animationStart && sectionBottom >= animationEnd) {
        progress = (animationStart - sectionTop) / animationRange;
        progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
      } else if (sectionTop > animationStart) {
        progress = 0; // Before animation
      } else if (sectionBottom < animationEnd) {
        progress = 1; // After animation
      }
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const photos = [
    { id: 1, src: '/placeholder-1.jpg', alt: 'KSO Event 1', delay: 0, trigger: 0.05 },
    { id: 2, src: '/placeholder-2.jpg', alt: 'KSO Event 2', delay: 0, trigger: 0.1 },
    { id: 3, src: '/placeholder-3.jpg', alt: 'KSO Event 3', delay: 0, trigger: 0.15 },
    { id: 4, src: '/placeholder-4.jpg', alt: 'KSO Event 4', delay: 0, trigger: 0.2 },
    { id: 5, src: '/placeholder-5.jpg', alt: 'KSO Event 5', delay: 0, trigger: 0.25 },
    { id: 6, src: '/placeholder-6.jpg', alt: 'KSO Event 6', delay: 0, trigger: 0.3 },
  ];

  const getPhotoAnimation = (photoIndex: number) => {
    const photo = photos[photoIndex];
    const progress = scrollProgress;
    
    // Photo appears when scroll progress reaches trigger point
    const isVisible = progress >= photo.trigger;
    
    // Calculate animation progress for this specific photo
    const photoProgress = isVisible ? Math.min(1, (progress - photo.trigger) / 0.3) : 0;
    
    // Exit animation starts at 80% scroll progress
    const exitProgress = progress >= 0.8 ? (progress - 0.8) / 0.2 : 0;
    
    return {
      opacity: isVisible ? Math.min(1, photoProgress * 2) * (1 - exitProgress) : 0,
      transform: isVisible 
        ? `translateX(${photoProgress * 0}px) translateY(${photoProgress * 0}px) rotate(${photo.trigger === 0.05 ? -8 : photo.trigger === 0.1 ? 12 : photo.trigger === 0.15 ? 6 : photo.trigger === 0.2 ? -10 : photo.trigger === 0.25 ? -5 : 8}deg)`
        : `translateX(${photo.trigger === 0.05 || photo.trigger === 0.15 || photo.trigger === 0.25 ? -384 : 384}px) translateY(${photo.trigger === 0.05 ? -48 : photo.trigger === 0.1 ? -48 : photo.trigger === 0.15 ? 48 : photo.trigger === 0.2 ? 48 : 0}px) rotate(${photo.trigger === 0.05 ? -8 : photo.trigger === 0.1 ? 12 : photo.trigger === 0.15 ? 6 : photo.trigger === 0.2 ? -10 : photo.trigger === 0.25 ? -5 : 8}deg)`
    };
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Photo collage positioned around the mission statement */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-6xl">
          {/* Top left - Polaroid style */}
          <div 
            className="absolute -top-80 -left-40 w-40 h-48 sm:w-48 sm:h-56 md:w-56 md:h-64 lg:w-64 lg:h-72 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(0).opacity,
              transform: getPhotoAnimation(0).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 bg-gradient-to-br from-blue-300 to-purple-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Photo 1</span>
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">KSO Event</span>
            </div>
          </div>

          {/* Top right - Polaroid style */}
          <div 
            className="absolute -top-72 -right-40 w-36 h-44 sm:w-44 sm:h-52 md:w-52 md:h-60 lg:w-60 lg:h-68 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(1).opacity,
              transform: getPhotoAnimation(1).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 bg-gradient-to-br from-green-300 to-blue-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Photo 2</span>
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Culture Show</span>
            </div>
          </div>

          {/* Bottom left - Polaroid style */}
          <div 
            className="absolute -bottom-72 -left-40 w-36 h-44 sm:w-44 sm:h-52 md:w-52 md:h-60 lg:w-60 lg:h-68 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(2).opacity,
              transform: getPhotoAnimation(2).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Photo 3</span>
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Community</span>
            </div>
          </div>

          {/* Bottom right - Polaroid style */}
          <div 
            className="absolute -bottom-80 -right-40 w-40 h-48 sm:w-48 sm:h-56 md:w-56 md:h-64 lg:w-64 lg:h-72 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(3).opacity,
              transform: getPhotoAnimation(3).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 bg-gradient-to-br from-pink-300 to-red-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Photo 4</span>
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Friendship</span>
            </div>
          </div>

          {/* Center left - Polaroid style */}
          <div 
            className="absolute top-1/2 -left-48 transform -translate-y-1/2 w-32 h-40 sm:w-40 sm:h-48 md:w-48 md:h-56 lg:w-56 lg:h-64 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(4).opacity,
              transform: getPhotoAnimation(4).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Photo 5</span>
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Memories</span>
            </div>
          </div>

          {/* Center right - Polaroid style */}
          <div 
            className="absolute top-1/2 -right-48 transform -translate-y-1/2 w-32 h-40 sm:w-40 sm:h-48 md:w-48 md:h-56 lg:w-56 lg:h-64 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(5).opacity,
              transform: getPhotoAnimation(5).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 bg-gradient-to-br from-teal-300 to-cyan-400 rounded-t-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Photo 6</span>
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Together</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 