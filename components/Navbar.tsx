'use client';

import GlassPill from './GlassPill';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft } from 'lucide-react';

const Navbar = () => {
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkBackground = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // --- COLOR LOGIC FIX ---
      // 1. Calculate how many "screens" down the White (Expanding) section starts.
      //    Hero (1) + Speakers (1) + Events (1) = Starts at 3.0
      //    (Adjust this number 3.0 if you add/remove sections before the white one)
      const whiteSectionStart = windowHeight * 5.0; 
      
      // 2. The white section is approx 500vh tall.
      const whiteSectionEnd = whiteSectionStart + (windowHeight * 3.5); 

      // 3. Are we currently inside the White Zone?
      const isInWhiteSection = scrollY > (whiteSectionStart - windowHeight * 0.1) && scrollY < whiteSectionEnd;

      // 4. If we are in the White Zone, Text = BLACK (isDarkBackground = false).
      //    Otherwise (Hero, Speakers, Tickets), Text = WHITE (isDarkBackground = true).
      setIsDarkBackground(!isInWhiteSection);
    };

    window.addEventListener('scroll', checkBackground, { passive: true });
    checkBackground();
    return () => window.removeEventListener('scroll', checkBackground);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
    <nav className="fixed top-0 left-0 w-full z-[50000] pointer-events-none">
      <div className="relative flex items-center px-6 md:px-8 py-4 md:py-6 pointer-events-auto min-h-[80px] md:min-h-[88px]">
        
        {/* --- LEFT: LOGO --- */}
        <a 
          href="#hero" 
          className="relative z-[50002] cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0 flex items-center" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* FIX: Increased mobile height to h-16 (64px) and width to w-32 to make it big again */}
          <div className="relative h-16 w-32 md:w-40 md:h-20">
            <Image 
                src="/images/MES 2026 logo 4.png" 
                alt="MES 2026" 
                fill
                className="object-contain object-left"
                priority
                sizes="(max-width: 768px) 128px, 160px"
            />
          </div>
        </a>

        {/* --- CENTER: PILLS (DESKTOP ONLY) --- */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 z-40">
          <GlassPill darkBackground={isDarkBackground}>
            <div className="flex items-center gap-8 px-4">
              {['SPEAKERS', 'EVENTS', 'TIMELINE', 'PASSES'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-sm font-medium hover:opacity-70 transition-all duration-300"
                  style={{ color: isDarkBackground ? 'white' : 'black' }}
                >
                  {item}
                </a>
              ))}
            </div>
          </GlassPill>
        </div>

        {/* --- RIGHT: BUTTON (DESKTOP ONLY) --- */}
        {/* --- RIGHT: BUTTON (DESKTOP ONLY) --- */}
        <div className="hidden md:flex items-center ml-auto z-50">
          <Link 
            href="/signup"
            className="group relative px-6 py-2 rounded-full font-bold text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(219,39,119,0.4)] overflow-hidden"
            style={{
              // Dark Pink / Rose Gradient
              background: 'linear-gradient(135deg, #831843 0%, #db2777 100%)', 
              border: isDarkBackground 
                ? '1px solid rgba(255, 255, 255, 0.15)' 
                : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <span className="relative z-10 tracking-widest flex items-center gap-2">
              GET TICKETS
            </span>
          </Link>
        </div>

        {/* --- RIGHT: MOBILE CONTROLS --- */}
        {/* --- RIGHT: MOBILE CONTROLS --- */}
        <div className="md:hidden ml-auto z-[50003] flex items-center gap-3">
            {!isMobileMenuOpen && (
                <Link 
                    href="/signup"
                    className="group relative px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest text-white shadow-lg transition-all duration-300 active:scale-95 overflow-hidden whitespace-nowrap"
                    style={{
                        // Same Dark Pink Gradient
                        background: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        // Adjusted shadow for mobile to match the pink theme
                        boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)'
                    }}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <span className="relative z-10">
                        Get Tickets
                    </span>
                </Link>
            )}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white active:scale-95 transition-transform"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>
    </nav>

    {/* --- MOBILE FULLSCREEN OVERLAY --- */}
    <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[50001] bg-[#050505] flex flex-col items-center justify-center md:hidden"
          >
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-24 left-6 flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-widest hover:text-white"
            >
                <ArrowLeft size={14} /> Back
            </button>

            <div className="flex flex-col items-center gap-8 mb-12">
              {['SPEAKERS', 'EVENTS', 'TIMELINE', 'PASSES'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-serif-display italic font-bold text-white hover:text-purple-500 transition-colors tracking-wide"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-4 w-64">
              <Link 
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 border border-white/20 rounded-xl text-center text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-sm"
              >
                Log In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;