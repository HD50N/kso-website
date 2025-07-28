'use client';

import { useEffect, useState } from 'react';

export default function AnimatedFan() {
  const [rotation, setRotation] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 500);
    
    // Rotation animation
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(rotationInterval);
    };
  }, []);

  // ASCII art fan
  const fanLines = [
    "                                                     ",
    "                                                     ",
    "          :@@@@@@@@@                                  ",
    "          :;@@@@@@@@@@@@@@@                           ",
    "          ;:@@@@@@@@@@@@@@@@@@@@                      ",
    "           :@@@@@@@@@@@   ;@@@@@@@@                   ",
    "           ';@@@@@@@@ ::::' @@@@@@@@@@                ",
    "            :@@@@@@@@@;';;; @@@@@@@@@@              ",
    "            :;@@@@@@@@@@@@@@     @@@@@@@@@            ",
    "            ;'@@@@@@::';@@;''''''';@@@@@@@@           ",
    "             - @@@@'::: @;:::'''''';@@    @@@         ",
    "             ';@@@@;;;'@@;::::::::';@@':':@@@@        ",
    "              :@@@@@@@@@@ ':::::::; @ ::' @@@@@       ",
    "              :;;@@@@@@@@@@ ;'''; @@@   ; @@@@@       ",
    "              ;';;; ;@@@@@@@@@   ;;@@@@@@@@@@@@@      ",
    "               :;;;;;;;@@@@@@ ::;:: @@@@@@@@@@@@      ", 
    "               :'';;;; ;;@@@@@;;;;; @@@@@@@@@@@@@     ",
    "       ;;;;;;; ;-:'';;;;@@@@@@@@@@@@@@@@@@@@@@@@@     ",
    "          ;;'':--:'''''''';;@@@@@@@@@@@@@@@@@@@@@     ",
    "            ;;'':'       ;;;''''''';;;;;@@@@@@@@@     ",
    "             ;;;;:                    ;;;''''''';;    ",
    "                ;:;                                   ",
    "                 ;;                                   ",
    "                                                    ",
    "                                                    "
  ];

  if (!isVisible) return null;

  return (
    <div className="font-mono text-xs leading-none overflow-visible select-none h-96">
      <div className="animate-fade-in flex items-center justify-center h-full" style={{ transform: 'translateX(-5rem)' }}>
        {/* Mobile version (hidden on lg screens and up) */}
        <div className="block lg:hidden">
          {fanLines.map((line, index) => (
            <div
              key={`mobile-${index}`}
              className="whitespace-pre"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.05s linear'
              }}
            >
              {line}
            </div>
          ))}
        </div>
        
        {/* Desktop version (hidden on screens smaller than lg) */}
        <div className="hidden lg:block">
          {fanLines.map((line, index) => (
            <div
              key={`desktop-${index}`}
              className="whitespace-pre"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.05s linear'
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 