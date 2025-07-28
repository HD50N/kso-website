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
    { id: 1, src: '/mission_1.jpg', alt: 'KSO Mission 1', delay: 0, trigger: 0.05 },
    { id: 2, src: '/mission_2.jpg', alt: 'KSO Mission 2', delay: 0, trigger: 0.1 },
    { id: 3, src: '/mission_3.jpg', alt: 'KSO Mission 3', delay: 0, trigger: 0.15 },
    { id: 4, src: '/mission_4.jpg', alt: 'KSO Mission 4', delay: 0, trigger: 0.2 },
    { id: 5, src: '/mission_5.jpg', alt: 'KSO Mission 5', delay: 0, trigger: 0.25 },
    { id: 6, src: '/mission_6.jpg', alt: 'KSO Mission 6', delay: 0, trigger: 0.3 },
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
            className="absolute -top-20 -left-8 sm:-top-40 sm:-left-20 md:-top-60 md:-left-32 lg:-top-80 lg:-left-40 w-24 h-32 sm:w-32 sm:h-40 md:w-40 md:h-48 lg:w-48 lg:h-56 xl:w-64 xl:h-72 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(0).opacity,
              transform: getPhotoAnimation(0).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 rounded-t-lg overflow-hidden">
              <img 
                src={photos[0].src} 
                alt={photos[0].alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Board</span>
            </div>
          </div>

          {/* Top right - Polaroid style */}
          <div 
            className="absolute -top-16 -right-6 sm:-top-32 sm:-right-16 md:-top-48 md:-right-24 lg:-top-72 lg:-right-40 w-20 h-28 sm:w-28 sm:h-36 md:w-36 md:h-44 lg:w-44 lg:h-52 xl:w-60 xl:h-68 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(1).opacity,
              transform: getPhotoAnimation(1).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 rounded-t-lg overflow-hidden">
              <img 
                src={photos[1].src} 
                alt={photos[1].alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Love</span>
            </div>
          </div>

          {/* Bottom left - Polaroid style */}
          <div 
            className="absolute -bottom-16 -left-6 sm:-bottom-32 sm:-left-16 md:-bottom-48 md:-left-24 lg:-bottom-72 lg:-left-40 w-20 h-28 sm:w-28 sm:h-36 md:w-36 md:h-44 lg:w-44 lg:h-52 xl:w-60 xl:h-68 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(2).opacity,
              transform: getPhotoAnimation(2).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 rounded-t-lg overflow-hidden">
              <img 
                src={photos[2].src} 
                alt={photos[2].alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">&lt;3</span>
            </div>
          </div>

          {/* Bottom right - Polaroid style */}
          <div 
            className="absolute -bottom-20 -right-8 sm:-bottom-40 sm:-right-20 md:-bottom-60 md:-right-32 lg:-bottom-80 lg:-right-40 w-24 h-32 sm:w-32 sm:h-40 md:w-40 md:h-48 lg:w-48 lg:h-56 xl:w-64 xl:h-72 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(3).opacity,
              transform: getPhotoAnimation(3).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 rounded-t-lg overflow-hidden">
              <img 
                src={photos[3].src} 
                alt={photos[3].alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Culture Show</span>
            </div>
          </div>

          {/* Center left - Polaroid style */}
          <div 
            className="absolute top-1/2 -left-12 sm:-left-24 md:-left-32 lg:-left-48 transform -translate-y-1/2 w-16 h-24 sm:w-24 sm:h-32 md:w-32 md:h-40 lg:w-40 lg:h-48 xl:w-56 xl:h-64 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(4).opacity,
              transform: getPhotoAnimation(4).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 rounded-t-lg overflow-hidden">
              <img 
                src={photos[4].src} 
                alt={photos[4].alt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/5 bg-white rounded-b-lg flex items-center justify-center">
              <span className="text-gray-600 text-xs font-light">Community</span>
            </div>
          </div>

          {/* Center right - Polaroid style */}
          <div 
            className="absolute top-1/2 -right-12 sm:-right-24 md:-right-32 lg:-right-48 transform -translate-y-1/2 w-16 h-24 sm:w-24 sm:h-32 md:w-32 md:h-40 lg:w-40 lg:h-48 xl:w-56 xl:h-64 bg-white rounded-lg shadow-xl"
            style={{
              opacity: getPhotoAnimation(5).opacity,
              transform: getPhotoAnimation(5).transform,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            <div className="w-full h-4/5 rounded-t-lg overflow-hidden">
              <img 
                src={photos[5].src} 
                alt={photos[5].alt} 
                className="w-full h-full object-cover"
              />
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