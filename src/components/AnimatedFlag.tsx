'use client';

import { useEffect, useState } from 'react';

export default function AnimatedFlag() {
  const [windOffset, setWindOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // South Korean flag ASCII art - Desktop version (larger)
  const flagLinesDesktop = [
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@- +#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@%: =* :%#@@@@@@@@@@@@@@@@@@@@@@@@#%: *= :%@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@%: ++ :#: *@@@@@@@@@@@@@@@@@@@@@@* :#: ++.*@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@%. *= :#. *@@@@@@@@@@@@@@@@@@@@@@@@* .#: =%:.%@@@@@@@@@@@@",
    "@@@@@@@@@@@@#..#- -#..#@@@@@@@%*+==--==+*%@@@@@@@#:*%- -#..#@@@@@@@@@@@",
    "@@@@@@@@@@@@:.#- =* .#@@@@@@#=------------=#@@@@@@@: *= -#.:@@@@@@@@@@@",
    "@@@@@@@@@@@@@@+ +* .%@@@@@%+----------------+%@@@@@%. *+ +@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@%::%@@@@@%=------------------=%@@@@@%::%@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@=--------------------=@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@*----------------------#@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@+:-----------::::::::--+@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@+::---------::::::::::-+@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@*::::----:::::::::::::-#@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@-::::::::::::::::::::-@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@%::%@@@@@%-::::::::::::::::::-%@@@@@%::%@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@+ +* .%@@@@@%=::::::::::::::::=%@@@@@%. *+ +@@@@@@@@@@@@@",
    "@@@@@@@@@@@@:.#- =* .#@@@@@@#-::::::::::::-#@@@@@@@: *= -#.:@@@@@@@@@@@",
    "@@@@@@@@@@@@#..#- *#..#@@@@@@@%*=--::--=*%@@@@@@@#:*%* -#..#@@@@@@@@@@@",
    "@@@@@@@@@@@@@%. *%--#. *@@@@@@@@@@@@@@@@@@@@@@@@* .#--%%:.%@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@%: ++ :#: *@@@@@@@@@@@@@@@@@@@@@@* :#: ++.*@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@%: =* :%#@@@@@@@@@@@@@@@@@@@@@@@@#%: *= :%@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@- +#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#+ -@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
  ];

  // South Korean flag ASCII art - Mobile version (smaller)
  const flagLinesMobile = [
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@*.##@@@@@@@@@@@@@@@@@@@@##.*@@@@@@@@@@@",
    "@@@@@@@@@@@+.*.-+*@@@@@@@@@@@@@@@@*+-.*.+@@@@@@@@@@",
    "@@@@@@@@@@=.*.==.#@@@@@@@@@@@@@@@@#.==.*+=@@@@@@@@@",
    "@@@@@@@@@-.*.=-.%@@@@%*+=--=+*%@@@@%=*=.*.-@@@@@@@@",
    "@@@@@@@@@** +::%@@@%+----------+%@@@%::+ **@@@@@@@@",
    "@@@@@@@@@@@%+-@@@@%=------------=%@@@@-+%@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@=--------------=@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@#---------:::::--#@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@#::------:::::::-#@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@-::::::::::::::-@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@%+-@@@@#::::::::::::::#@@@@-+%@@@@@@@@@@",
    "@@@@@@@@@** +::%@@@%=::::::::::=%@@@%::+ **@@@@@@@@",
    "@@@@@@@@@-.*.*-.%@@@@%+=-::-=+%@@@@%=**.*.-@@@@@@@@",
    "@@@@@@@@@@=.#-==.#@@@@@@@@@@@@@@@@#.==-%+=@@@@@@@@@",
    "@@@@@@@@@@@+.*.-+*@@@@@@@@@@@@@@@@*+-.*.+@@@@@@@@@@",
    "@@@@@@@@@@@@*.##@@@@@@@@@@@@@@@@@@@@##.*@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
  ];

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 500);
    
    // Wind animation
    const windInterval = setInterval(() => {
      setWindOffset(prev => (prev + 1) % 4);
    }, 200);

    return () => {
      clearTimeout(timer);
      clearInterval(windInterval);
    };
  }, []);

  const applyWindEffect = (line: string, lineIndex: number) => {
    // Create a more realistic flag wave effect with skew
    const time = Date.now() * 0.002;
    const baseWave = Math.sin(time + lineIndex * 0.3) * 2;
    const secondaryWave = Math.sin(time * 1.5 + lineIndex * 0.1) * 1;
    const tertiaryWave = Math.sin(time * 0.7 + lineIndex * 0.05) * 0.5;
    
    const totalShift = Math.floor(baseWave + secondaryWave + tertiaryWave);
    
    // Add skew effect - compress/expand characters based on position
    const skewIntensity = Math.sin(time + lineIndex * 0.2) * 0.3;
    const skewOffset = Math.floor(skewIntensity * line.length * 0.1);
    
    let skewedLine = line;
    if (skewOffset !== 0) {
      // Simulate skew by adjusting character spacing
      const chars = line.split('');
      if (skewOffset > 0) {
        // Compress from right
        skewedLine = chars.slice(0, -skewOffset).join('') + ' '.repeat(skewOffset);
      } else {
        // Expand from left
        skewedLine = chars.join('') + ' '.repeat(-skewOffset);
      }
    }
    
    if (totalShift === 0) return skewedLine;
    
    if (totalShift > 0) {
      return ' '.repeat(totalShift) + skewedLine.slice(0, -totalShift);
    } else {
      return skewedLine.slice(-totalShift) + ' '.repeat(-totalShift);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="font-mono text-xs leading-none overflow-visible select-none h-96">
      <div className="animate-fade-in flex items-center justify-center h-full">
        {/* Mobile version (hidden on lg screens and up) */}
        <div className="block lg:hidden">
          {flagLinesMobile.map((line, index) => (
            <div
              key={`mobile-${index}`}
              className={`whitespace-pre ${
                index % 4 === 0 ? 'animate-wind' : 
                index % 4 === 1 ? 'animate-wind-delayed' : 
                index % 4 === 2 ? 'animate-wind-delayed-2' :
                'animate-wind-delayed-3'
              }`}
              style={{
                opacity: 0.9 + Math.sin((Date.now() * 0.002) + index * 0.1) * 0.1,
                transform: `translateX(${Math.sin((Date.now() * 0.001) + index * 0.15) * 2}px)`
              }}
            >
              {applyWindEffect(line, index)}
            </div>
          ))}
        </div>
        
        {/* Desktop version (hidden on screens smaller than lg) */}
        <div className="hidden lg:block">
          {flagLinesDesktop.map((line, index) => (
            <div
              key={`desktop-${index}`}
              className={`whitespace-pre ${
                index % 4 === 0 ? 'animate-wind' : 
                index % 4 === 1 ? 'animate-wind-delayed' : 
                index % 4 === 2 ? 'animate-wind-delayed-2' :
                'animate-wind-delayed-3'
              }`}
              style={{
                opacity: 0.9 + Math.sin((Date.now() * 0.002) + index * 0.1) * 0.1,
                transform: `translateX(${Math.sin((Date.now() * 0.001) + index * 0.15) * 2}px)`
              }}
            >
              {applyWindEffect(line, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 