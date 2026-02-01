'use client';

import GlassPill from './GlassPill';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isDarkBackground, setIsDarkBackground] = useState(true);

  useEffect(() => {
    const checkBackground = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      const isHero = scrollY < (windowHeight * 0.9);
      const isPastWhiteSection = scrollY > (windowHeight * 5.8);
      const shouldBeLightText = isHero || isPastWhiteSection;
      
      setIsDarkBackground(shouldBeLightText);
    };

    window.addEventListener('scroll', checkBackground, { passive: true });
    checkBackground();
    
    return () => window.removeEventListener('scroll', checkBackground);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[50000] pointer-events-none">
      {/* Added 'relative' and 'min-h' to ensure the bar maintains a consistent height regardless of logo size */}
      <div className="relative flex items-center px-8 py-6 pointer-events-auto min-h-[88px]">
        
        {/* --- LEFT: LOGO (ABSOLUTE POSITIONING) --- */}
        {/* FIX: 
            1. 'absolute' takes it out of flow (won't push navbar height).
            2. 'left-8' keeps it aligned to the side.
            3. 'top-1/2 -translate-y-1/2' keeps it perfectly vertically centered.
            4. 'w-40 h-20' makes it BIG without affecting layout. Change h-20 to h-24/h-32 if you want it HUGE.
        */}
        <a 
  href="#hero" // 👈 Targets the hero section
  className="absolute left-8 top-1/2 -translate-y-1/2 w-40 h-20 cursor-pointer transition-opacity hover:opacity-80 z-50" 
>
  <Image 
    src="/images/MES 2026 logo 4.png" 
    alt="MES 2026" 
    fill
    className="object-contain object-left"
    priority
  />
</a>

        {/* --- CENTER: PILLS (Already Absolute) --- */}
        <div className="absolute left-1/2 -translate-x-1/2 z-40">
          <GlassPill darkBackground={isDarkBackground}>
            <div className="flex items-center gap-8 px-4">
              <a 
                href="#speakers" 
                className="text-sm font-medium hover:opacity-70 transition-all duration-300"
                style={{ color: isDarkBackground ? 'white' : 'black' }}
              >
                SPEAKERS
              </a>

              <a 
                href="#events" 
                className="text-sm font-medium hover:opacity-70 transition-all duration-300"
                style={{ color: isDarkBackground ? 'white' : 'black' }}
              >
                EVENTS
              </a>

              <a 
                href="#timeline" 
                className="text-sm font-medium hover:opacity-70 transition-all duration-300"
                style={{ color: isDarkBackground ? 'white' : 'black' }}
              >
                TIMELINE
              </a>

              <a 
                href="#passes" 
                className="text-sm font-medium hover:opacity-70 transition-all duration-300"
                style={{ color: isDarkBackground ? 'white' : 'black' }}
              >
                PASSES
              </a>
            </div>
          </GlassPill>
        </div>

        {/* --- RIGHT: BUTTON (Pushed Right manually) --- */}
        {/* Added 'ml-auto' to force it to the right since 'justify-between' doesn't apply to absolute items */}
        <div className="flex items-center ml-auto z-50">
          <Link 
            href="/signup"
            className="px-6 py-2.5 rounded-full font-medium text-sm transition-all hover:scale-105 duration-300 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: isDarkBackground 
                ? '1px solid rgba(255, 255, 255, 0.2)' 
                : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            GET TICKETS
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;