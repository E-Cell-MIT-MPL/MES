"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 2.0, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. CLICK INTERCEPTION
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            
            // A. Get exact distance
            const distance = Math.abs(targetElement.getBoundingClientRect().top);

            // B. Threshold: 3000px
            // - If gap is 2000px (Speakers -> Events): It falls UNDER 3000 -> FAST.
            // - If gap is 6000px (Hero -> Events): It is OVER 3000 -> SLOW.
            const isLongJump = distance > 7000;

            lenis.scrollTo(targetId, { 
              // Rule: 5s for Tunnel/Hero jumps, 1.5s for normal section jumps
              duration: isLongJump ? 10 : 4, 
              
              // Rule: 
              // Long Jump = Linear ((t) => t). CONSTANT speed. No slowing down at the end.
              // Short Jump = Expo Ease-Out. Snaps quickly, slows gently.
              easing: isLongJump ? (t) => t : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return <>{children}</>;
}