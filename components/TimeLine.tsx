'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 1. COLORS & DATA DEFINITIONS (Ensures no "not found" errors)
const COLORS = {
  bg: "#1B1F23",        
  cardBg: "#3D1E42",    
  lineMain: "#EA5297",  
  lineDark: "#D60B68",  
  textLight: "#FFD9DA", 
  textWhite: "#ffffff",
};

const EVENT_GROUPS = [
  {
    name: "Conceptiō",
    rounds: [
      { date: "11 Dec - 07 Jan", title: "Ideation Round", desc: "Pitch Deck submission (8-10 slides). Focus on Innovation & Impact." },
      { date: "11 Jan - 27 Jan", title: "PoC Workshop", desc: "Exclusive workshop to build a working prototype/mock-up." },
      { date: "07 Feb", title: "Final Pitching", desc: "7-minute pitch to judges on Market Viability & Real-world Impact." }
    ]
  },
  {
    name: "Pitch Tank",
    rounds: [
      { date: "16 Dec - 05 Jan", title: "Startup Submission", desc: "Submit detailed applications showcasing business models." },
      { date: "08 Jan - 20 Jan", title: "Video & Deck", desc: "Submit 3-min pitch video and 8-10 slide deck." },
      { date: "13 Feb - 14 Feb", title: "Offline Pitching", desc: "Pitch to VCs and Industry Leaders in person." }
    ]
  },
  {
    name: "Blindspot",
    rounds: [
      { date: "26 Jan - 31 Jan", title: "Screening Desk", desc: "Identify key risks from a startup snapshot." },
      { date: "02 Feb - 07 Feb", title: "Financials", desc: "Deep dive into financial performance." },
      { date: "11 Feb", title: "The Verdict", desc: "Diagnose root causes and design actions." }
    ]
  },
  {
    name: "Case Maze",
    rounds: [
      { date: "27 Jan - 30 Jan", title: "Elimination Quiz", desc: "Online MCQs on Finance and Logic." },
      { date: "01 Feb - 08 Feb", title: "Case Submission", desc: "Submit solution for a functional challenge." },
      { date: "14 Feb", title: "Final Pitch", desc: "Present strategy to expert panel." }
    ]
  },
  {
    name: "Money Quest",
    rounds: [
      { date: "06 Feb - 07 Feb", title: "Quiz Round", desc: "Online finance quiz. Top 20 qualify." },
      { date: "09 Feb", title: "The Auction", desc: "Treasure hunt + Strategic Auction." }
    ]
  },
  {
    name: "PostMortem",
    rounds: [
      { date: "05 Feb - 08 Feb", title: "Qualification Quiz", desc: "Online murder mystery reasoning test." },
      { date: "11 Feb", title: "The Deduction", desc: "Solve the CEO's murder using deduction." }
    ]
  },
  {
    name: " Innovation Policy Consortium (IPC)",
    rounds: [
      { date: "11 Feb", title: "Policy Compilation Event", desc: "Policy recommendation document compilation at the Innovation Policy Consortium 2026 "},
      { date: "12 Feb", title: " Final Presentation at MES 2026", desc: "Presentation of 'Bharat Yuva Innovation Policy Recommendation 2026' to the government of Karnataka" }
    ]
  }
  
];

export default function MESTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Determine screen size on mount and resize
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const ctx = gsap.context(() => {
      if (isDesktop) {
        // Line animation (Vertical - Desktop Only)
        gsap.fromTo(lineRef.current, 
          { height: "0%" },
          { 
            height: "100%", 
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center", 
              end: "bottom center", 
              scrub: 1, 
            }
          }
        );

        // Entrance animation for cards
        gsap.utils.toArray('.timeline-group').forEach((group: any) => {
          const card = group.querySelector('.timeline-card');
          if (card) {
            gsap.fromTo(card, 
              { opacity: 0, y: 50 },
              { 
                opacity: 1, 
                y: 0, 
                scrollTrigger: {
                  trigger: group,
                  start: "top 85%",
                  toggleActions: "play none none reverse"
                }
              }
            );
          }
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, [isDesktop]);

  return (
    <div className="w-full min-h-screen selection:bg-pink-500/30 overflow-x-hidden" style={{ backgroundColor: COLORS.bg }}>
      
      <div ref={containerRef} className="relative max-w-7xl mx-auto py-12 md:py-32 px-4">
        
        {/* DESKTOP UI ELEMENTS */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full z-0 opacity-10 bg-[#FFD9DA]" />
        <div ref={lineRef} className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[2px] z-0"
             style={{ background: `linear-gradient(to bottom, ${COLORS.lineMain}, ${COLORS.lineDark})` }} />

        {/* MOBILE: flex-row + overflow-x-auto (Horizontal Scroll)
            DESKTOP: md:flex-col (Vertical Scroll)
        */}
        <div className="flex flex-row md:flex-col gap-6 md:gap-32 overflow-x-auto md:overflow-visible no-scrollbar snap-x snap-mandatory relative z-10 pb-10">
          
          {EVENT_GROUPS.map((event: any, i: number) => (
            <div 
              key={i} 
              className={`timeline-group flex-shrink-0 w-[85vw] md:w-full snap-center flex items-start relative ${
                i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              {/* Vertical Dot (Desktop Only) */}
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-5 h-5 rounded-full border-[3px] z-20 shadow-[0_0_15px_rgba(234,82,151,0.5)]"
                   style={{ backgroundColor: COLORS.bg, borderColor: COLORS.lineMain }} />

              {/* The Card */}
              <div className={`timeline-card w-full md:w-[45%] ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                
                <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-lg ${
                  i % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                }`}
                style={{ backgroundColor: COLORS.lineMain, color: "#1B1F23" }}>
                  {event.name}
                </div>

                <div className="rounded-3xl p-6 md:p-8 border border-white/5 bg-[#252a30]/80 backdrop-blur-xl shadow-2xl h-full"
                     style={{ borderLeft: `4px solid ${COLORS.lineMain}` }}>
                  
                  <div className="flex flex-col gap-6">
                    {event.rounds.map((round: any, r: number) => (
                      <div key={r} className="flex flex-col gap-2 border-b border-white/5 last:border-0 pb-4 last:pb-0 group/round">
                        <span className="font-mono text-[10px] opacity-50 uppercase" style={{ color: COLORS.textLight }}>
                          {round.date}
                        </span>
                        <h4 className="text-lg md:text-xl font-bold text-white group-hover/round:text-[#EA5297] transition-colors">
                          {round.title}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                          {round.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Layout Spacer (Desktop Only) */}
              <div className="hidden md:block w-[45%]" />
            </div>
          ))}
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="md:hidden text-center mt-4 text-[9px] uppercase tracking-[0.3em] text-white/20 animate-pulse font-bold">
          Swipe to explore events →
        </div>

      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}