'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    // This script runs before hydration to prevent flash of unstyled content
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        try {
          const savedTheme = localStorage.getItem('theme');
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark-mode');
          }
        } catch (e) {
          // Ignore errors in case localStorage is not available
        }
      })();
    `;
    script.setAttribute('data-theme-script', 'true');
    
    // Remove any existing theme script
    const existingScript = document.querySelector('[data-theme-script="true"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
} 