'use client';

import GlassPill from './GlassPill';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// 👇 1. Import 'Variants' type here
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Menu, X, ArrowLeft, ArrowUpRight } from 'lucide-react';

const Navbar = () => {
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkBackground = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // --- COLOR LOGIC ---
      const whiteSectionStart = windowHeight * 5.0; 
      const whiteSectionEnd = whiteSectionStart + (windowHeight * 3.5); 
      const isInWhiteSection = scrollY > (whiteSectionStart - windowHeight * 0.1) && scrollY < whiteSectionEnd;

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

  // 👇 2. Add ': Variants' type annotation
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  // 👇 3. Add ': Variants' type annotation
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
        y: 0, 
        opacity: 1, 
        transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
  };

  return (
    <>
    <nav className="fixed top-0 left-0 w-full z-[50000] pointer-events-none">
      <div className="relative flex items-center px-6 md:px-8 py-4 md:py-6 pointer-events-auto min-h-[80px] md:min-h-[88px]">
        
          {/* --- LEFT: LOGO --- */}
<div className="relative h-20 w-40 md:h-28 md:w-56 flex items-center">
  <Image 
    src="/images/MES 2026 logo 4.png" 
    alt="MES 2026" 
    fill
    className="object-contain object-left"
    priority
    sizes="(max-width: 768px) 160px, 224px"
  />
</div>

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
        <div className="hidden md:flex items-center ml-auto z-50">
          <Link 
            href="/student"
            className="group relative px-6 py-2 rounded-full font-bold text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(219,39,119,0.4)] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #831843 0%, #db2777 100%)', 
              border: isDarkBackground 
                ? '1px solid rgba(255, 255, 255, 0.15)' 
                : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10 tracking-widest flex items-center gap-2">
             BUY NOW
            </span>
          </Link>
        </div>

        {/* --- RIGHT: MOBILE CONTROLS --- */}
        <div className="md:hidden ml-auto z-[50003] flex items-center gap-3">
            {!isMobileMenuOpen && (
                <Link 
                    href="/signup"
                    className="group relative px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest text-white shadow-lg transition-all duration-300 active:scale-95 overflow-hidden whitespace-nowrap"
                    style={{
                        background: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)'
                    }}
                >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="relative z-10">
                     BUY NOW
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[50001] bg-[#050505] flex flex-col md:hidden overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                 {/* Noise Texture */}
                 <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
                 {/* Gradients */}
                 <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 flex flex-col h-full px-8 pt-32 pb-12">
                
                {/* Back/Close Label */}
                <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-28 left-8 flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-widest hover:text-white transition-colors"
                >
                    <ArrowLeft size={12} /> Close Menu
                </button>

                {/* Navigation Links */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="flex flex-col gap-6 mt-8"
                >
                    {['SPEAKERS', 'EVENTS', 'TIMELINE', 'PASSES'].map((item, index) => (
                        <motion.a 
                            key={item}
                            variants={itemVariants}
                            href={`#${item.toLowerCase()}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group relative flex items-center justify-between py-2 border-b border-white/5"
                        >
                            <span className="text-5xl font-serif-display italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500 group-hover:to-white transition-all tracking-wide">
                                {item}
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-white/20 group-hover:text-purple-400 transition-colors">
                                    0{index + 1}
                                </span>
                                <ArrowUpRight className="text-white/20 group-hover:text-purple-400 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300" size={20} />
                            </div>
                        </motion.a>
                    ))}
                </motion.div>

                {/* Footer / CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-auto"
                >
                    <Link 
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full relative group block"
                    >
                         <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
                         <div className="relative w-full py-5 bg-[#0a0a0a] rounded-xl flex items-center justify-center gap-3 border border-white/10 group-hover:bg-black/80 transition-all">
                            <span className="text-white font-bold uppercase tracking-widest text-sm">Log In / Sign Up</span>
                            <ArrowUpRight size={16} className="text-purple-400" />
                         </div>
                    </Link>
                    
                    <div className="mt-8 flex justify-between items-end">
                         <div>
                            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Manipal</p>
                            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Entrepreneurship Summit</p>
                         </div>
                         <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">2026</p>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;