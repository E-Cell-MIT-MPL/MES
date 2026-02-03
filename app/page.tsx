"use client";

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useScroll, useSpring, useTransform, motion, useInView, useAnimation, Variants } from "framer-motion";
import { HeroBusinessman } from '../components/BussinessModel'; 
import { useRouter } from "next/navigation";
import Prism from "../components/Prism";
import Image from "next/image";
import Tunnel from "../components/Tunnel";
import Navbar from "@/components/Navbar";
import CardSwap, { Card, CardSwapHandle } from '../components/CardsSwap'; 

import { Check, ArrowUpRight,MapPin, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter } from "lucide-react"; 
import { homedir } from "os";
  

// ... [BlurReveal Component - Keep as is] ...
function BlurReveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 }); 
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const variants: Variants = {
    hidden: { opacity: 0, filter: "blur(20px)", y: 50 },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)", 
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ... [REAL_EVENTS Data - Keep as is] ...
const REAL_EVENTS = [
  { 
    date: "12 Feb", 
    title: "Inauguration", 
    desc: "The official inauguration marking the beginning of the event series.", 
    link: "#", 
    image: "/images/inauguration.jpg"
  },
  {
    date: "14 Feb",
    title: "Innovation Mela",
    desc: "A vibrant exhibition of innovative ideas, prototypes, and creative projects.",
    link: "#",
    image: "/images/innovationmela.jpg"
  },
  {
    date: "13 Feb",
    title: "Pitch Tank",
    desc: "Startup-style pitch sessions where teams present ideas to a judging panel.",
    link: "#", 
    image: "/images/pitchtank.jpg"
  },
  { 
    date: "7 Feb", 
    title: "Conceptio Ideathon", 
    desc: "A high-energy ideation sprint where teams brainstorm, validate, and pitch innovative solutions.", 
    link: "https://unstop.com/competitions/conceptio-manipal-entrepreneurship-summit-2026-manipal-institute-of-technology-manipal-1607202", 
    image: "/images/conceptio.jpg"
  },
  { 
    date: "10 Feb", 
    title: "Money Quest", 
    desc: "A finance-focused challenge testing strategy, risk-taking, and decision-making skills.", 
    link: "https://unstop.com/", 
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop"
  },
  { 
    date: "11 Feb", 
    title: "Blind Spot", 
    desc: "Blindspot is a hands-on investment decision-making competition in (MES) 2026 on Unstop, with a ₹25,000 prize pool and rounds running from January 26, 2026..", 
    link: "#", 
    image: "/images/blindspot.jpg"
  },
  { 
    date: "11 Feb", 
    title: "Innovation Policy Consertum", 
    desc: "A consortium-style discussion on innovation frameworks, governance, and policy impact.", 
    link: "#", 
    image: "/images/ipc.jpg"
  },
  { 
    date: "11 Feb", 
    title: "Postmortem", 
    desc: "An analytical postmortem session uncovering blind spots, failures, and lessons from real cases.", 
    link: "#", 
    image: "/images/postmortum.png"
  },
  {
    date: "14 Feb",
    title: "Case Maze",
    desc: "A competitive case-solving challenge designed to test analytical thinking.",
    link: "#",
    image: "/images/casemaze.jpg"
  }
];

// ... [EventsPage Component - Keep as is] ...
function EventsPage() {
  return (
    <section className="py-20 md:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <BlurReveal>
            <div className="text-center mb-12 md:mb-16">
                <p className="text-purple-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-4">The Agenda // 03</p>
                <h2 className="text-5xl md:text-8xl font-serif-display italic font-bold text-white">Event Schedule</h2>
            </div>
        </BlurReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {REAL_EVENTS.map((event, idx) => (
            <BlurReveal key={idx} delay={idx * 0.1} className="h-full">
              <div onClick={() => window.open(event.link, "_blank")} className="group relative h-[450px] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0">
                    <Image src={event.image} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
                <div className="relative h-full flex flex-col p-8 md:p-10 z-10 justify-between">
                    <div className="flex justify-between items-start">
                        <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            <span className="text-xs font-bold text-white uppercase tracking-[0.15em]">{event.date}</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all duration-300">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-3xl md:text-4xl font-serif-display italic font-bold text-white mb-3 leading-[0.9]">{event.title}</h3>
                        <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-2 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{event.desc}</p>
                        <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flagship Event</span>
                            <span className="text-sm font-bold text-white underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-all">Register</span>
                        </div>
                    </div>
                </div>
              </div>
            </BlurReveal>
          ))}
        </div>
      </div>
    </section>
  );
}


// import CardSwap, { Card } from '@/components/CardSwap'; 
export function ExpandingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const lastIndexRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalDistance = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.max(0, Math.min(1, scrolled / totalDistance)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const timeline = progress * 2.5;
  const expansionCap = Math.min(1, timeline);
  const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const easedBox = ease(expansionCap);
  const isLocked = expansionCap >= 0.99;

  // --- CARD SWAP TRIGGER LOGIC ---
  let activeCardIndex = 0;
  if (progress > 0.15) activeCardIndex = 1;
  if (progress > 0.45) activeCardIndex = 2;

  useEffect(() => {
    // UPDATED: Removed "!isMobile" check. 
    // Now it auto-swaps on BOTH mobile and desktop based on scroll.
    if (activeCardIndex !== lastIndexRef.current) {
      cardSwapRef.current?.triggerSwap();
      lastIndexRef.current = activeCardIndex;
    }
  }, [activeCardIndex]); // Removed isMobile dependency as it's no longer used in logic

  return (
    <section ref={containerRef} className="relative h-[350vh] bg-white z-20 font-sans">
      <div className="sticky top-0 h-[100dvh] w-full flex items-center overflow-hidden">
        <div
          className="absolute overflow-hidden z-20 border border-white/5 shadow-2xl transition-colors duration-1000 ease-in-out"
          style={{
            backgroundColor: '#FFD9DA', // THE PINK BACKGROUND
            width: isLocked ? '100%' : (isMobile ? `${85 + easedBox * 15}%` : `${45 + easedBox * 55}%`),
            height: isLocked ? '100dvh' : `${50 + easedBox * 50}vh`,
            top: '50%',
            left: isLocked ? '0' : (isMobile ? `${7.5 * (1 - easedBox)}%` : `${10 * (1 - easedBox)}%`),
            transform: 'translateY(-50%)',
            borderRadius: isLocked ? '0px' : `${40 * (1 - easedBox)}px`
          }}
        >
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* ==========================================
              VISION TEXT (TOP LEFT)
          ========================================== */}
          <div
            className="absolute top-16 md:top-20 left-8 md:left-24 z-30 pointer-events-none"
            style={{
              // If timeline is < 0.8, keep it visible. Once we lock (1.0), fade it out.
              opacity: Math.max(0, 1 - (timeline - 0.7) * 5), 
              transform: `translateY(${(timeline < 0.1) ? '20px' : '0px'})`,
              transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <p className="text-rose-600 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">The Mission // 01</p>
            <h2 className="font-serif-display italic text-black text-5xl md:text-8xl leading-none">The Vision.</h2>
          </div>

          {/* ==========================================
              LEAP TEXT (BOTTOM LEFT)
          ========================================== */}
          <div className="absolute bottom-16 md:bottom-20 left-8 md:left-20 z-30 pointer-events-none">
            <h2
              className="font-serif-display italic font-bold text-fuchsia-900 text-6xl md:text-9xl leading-none tracking-tighter"
              style={{
                // Appears as we scroll further down
                opacity: Math.max(0, (timeline - 0.5) * 4),
                transform: `translateY(${(timeline > 0.5) ? '0' : '40px'})`,
                transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
            TAKE THE LEAP.
            </h2>
          </div>

          {/* ==========================================
              CARDS CONTAINER (RIGHT)
          ========================================== */}
          <div
            className="absolute top-[50%] md:top-[55%] right-0 md:right-16 -translate-y-1/2 z-40 pointer-events-auto w-full md:w-auto flex justify-center"
            style={{
              opacity: Math.max(0, (timeline - 0.4) * 5),
              scale: isMobile ? 0.85 : 1,
              transition: 'opacity 0.5s ease-out'
            }}
          >
            <CardSwap 
                ref={cardSwapRef} 
                width={isMobile ? 320 : 400} 
                height={isMobile ? 380 : 420}
                easing={isMobile ? 'linear' : 'elastic'}
            >
             <Card customClass="bg-[#111] border border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
  <div className="relative w-full h-full p-8 flex flex-col justify-between">
    {/* Background Image / Decorative Image */}
    <div className="absolute inset-0 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
      <img 
        src="/images/capital.jpg" 
        alt="Capital" 
        className="w-full h-full object-cover"
      />
    </div>
    
    {/* Content Overlay */}
    <div className="relative z-10 w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">01</div>
    <div className="relative z-10">
      <h3 className="text-white text-4xl font-serif-display italic mb-2">Capital</h3>
      <p className="text-gray-400 text-xs leading-relaxed font-light">Connecting student-led ventures with serious VC backing.</p>
    </div>
  </div>
</Card>

<Card customClass="bg-[#111] border border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
  <div className="relative w-full h-full p-8 flex flex-col justify-between">
    <div className="absolute inset-0 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
      <img 
        src="/images/community.jpg" 
        alt="Community" 
        className="w-full h-full object-cover"
      />
    </div>
    
    <div className="relative z-10 w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">02</div>
    <div className="relative z-10">
      <h3 className="text-white text-4xl font-serif-display italic mb-2">Community</h3>
      <p className="text-gray-400 text-xs leading-relaxed font-light">A massive network of 30,000+ students and alumni.</p>
    </div>
  </div>
</Card>

<Card customClass="bg-[#111] border border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
  <div className="relative w-full h-full p-8 flex flex-col justify-between">
    <div className="absolute inset-0 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
      <img 
        src="/images/career.jpg" 
        alt="Career" 
        className="w-full h-full object-cover"
      />
    </div>
    
    <div className="relative z-10 w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">03</div>
    <div className="relative z-10">
      <h3 className="text-white text-4xl font-serif-display italic mb-2">Career</h3>
      <p className="text-gray-400 text-xs leading-relaxed font-light">Bridging the gap between engineering and entrepreneurship.</p>
    </div>
  </div>
</Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
// ... [Timeline Data & Component - Keep as is] ...
const TIMELINE_DATA = [
  { title: "Conceptiō", tag: "FLAGSHIP", color: "bg-pink-500", items: [{ date: "11 Dec - 07 Jan", label: "Ideation Round", desc: "Pitch Deck submission." }, { date: "11 Jan - 27 Jan", label: "PoC Workshop", desc: "Build a working prototype." }, { date: "07 Feb", label: "Final Pitching", desc: "7-minute pitch to judges." }] },
  { title: "Pitch Tank", tag: "FLAGSHIP", color: "bg-purple-500", items: [{ date: "16 Dec - 05 Jan", label: "Startup Submission", desc: "Showcase business models." }, { date: "08 Jan - 20 Jan", label: "Video & Deck", desc: "3-min pitch video." }, { date: "13 Feb - 14 Feb", label: "Offline Pitching", desc: "Pitch to VCs in person." }] },
  { title: "Blindspot", tag: "CASE STUDY", color: "bg-blue-500", items: [{ date: "26 Jan - 31 Jan", label: "Screening Desk", desc: "Identify key risks." }, { date: "02 Feb - 07 Feb", label: "Financials", desc: "Deep dive into financial risk." }, { date: "11 Feb", label: "The Verdict", desc: "Diagnose root causes." }] },
  { title: "Case Maze", tag: "STRATEGY", color: "bg-teal-500", items: [{ date: "27 Jan - 30 Jan", label: "Elimination Quiz", desc: "MCQs on Finance & Logic." }, { date: "01 Feb - 08 Feb", label: "Case Submission", desc: "Functional area challenge." }, { date: "14 Feb", label: "Final Pitch", desc: "Present strategy to panel." }] },
  { title: "Money Quest", tag: "FUN", color: "bg-amber-500", items: [{ date: "06 Feb - 07 Feb", label: "Quiz Round", desc: "Online finance quiz." }, { date: "09 Feb", label: "The Auction", desc: "Treasure hunt + Strategic Auction." }] },
  { title: "PostMortem", tag: "MYSTERY", color: "bg-red-500", items: [{ date: "05 Feb - 08 Feb", label: "Qualification Quiz", desc: "Murder mystery test." }, { date: "11 Feb", label: "The Deduction", desc: "Solve the CEO's murder." }] }
];

export function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const xTranslate = useTransform(smoothProgress, [0, 1], ["0%", "-85%"]);

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#050505]">
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 w-full z-10">
          <h2 className="text-5xl md:text-7xl font-serif-display italic font-bold text-white mb-2 tracking-tighter">Timeline</h2>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 bg-purple-500" />
            <p className="text-purple-400 font-mono text-[10px] tracking-[0.2em] uppercase">Phase Sequence 2026 // 04</p>
          </div>
        </div>
        <motion.div style={{ x: xTranslate }} className="flex gap-6 px-6 md:px-24 will-change-transform">
          {TIMELINE_DATA.map((phase, idx) => ( <TimelineCard key={idx} phase={phase} /> ))}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
        <div className="absolute bottom-12 left-12 right-12 h-[1px] bg-white/10 overflow-hidden rounded-full">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ scaleX: smoothProgress, transformOrigin: "left" }} />
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ phase }: { phase: any }) {
  return (
    <div className="relative w-[300px] md:w-[380px] shrink-0 group">
      <div className="bg-[#0A0A0A] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 hover:border-purple-500/30 transition-all duration-500 h-full group-hover:bg-[#0f0f0f] shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className={`text-[9px] font-black ${phase.color.replace('bg-', 'text-')} uppercase tracking-[0.2em] mb-1 block`}>{phase.tag}</span>
            <h3 className="text-2xl font-bold text-white tracking-tight">{phase.title}</h3>
          </div>
          <div className={`w-2 h-2 rounded-full ${phase.color} shadow-[0_0_15px_rgba(255,255,255,0.3)]`} />
        </div>
        <div className="space-y-8 relative">
          <div className="absolute top-2 left-[3px] w-[1px] h-[calc(100%-10px)] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
          {phase.items.map((item: any, i: number) => (
            <div key={i} className="relative pl-6 group/item">
              <div className={`absolute top-2 left-0 w-1.5 h-1.5 rounded-full bg-[#151515] border border-white/10 group-hover/item:border-purple-500 transition-colors`} />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-1 font-mono">{item.date}</span>
                <h4 className="text-base font-bold text-white/80 group-hover/item:text-white transition-colors">{item.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1 font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================
// SPONSOR FOOTER (VERTICAL FIX)
// =========================================
// =========================================
// SPONSOR FOOTER (FIXED ALIGNMENT & TEXT)
// =========================================
// =========================================
// SPONSOR FOOTER (TEXT BELOW LOGOS)
// =========================================
// =========================================
// SPONSOR FOOTER (NO TEXT OVERLAP FIX)
// =========================================
export function SponsorFooter() {
  return (
<div className="absolute bottom-0 w-full z-40 pb-12 pt-48 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pointer-events-auto">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 items-start md:items-center justify-items-center text-center">
    
    {/* --- 1. INNOVATION PARTNER --- */}
    <div className="col-span-1 flex flex-col items-center gap-2">
      <p className="text-gray-400 text-[10px] uppercase tracking-[0.1em] opacity-80">Innovation Partner</p>
      <div className="flex flex-col items-center">
        <div className="relative w-14 h-14 md:w-16 md:h-16">
          <Image src="/images/MIT Manipal Alumni Association Logo Transparent.png" alt="MITMAA" fill className="object-contain" />
        </div>
        <span className="font-serif-display text-white text-xs md:text-lg font-bold tracking-wider mt-1">MITMAA</span>
      </div>
    </div>

    {/* --- 2. TITLE SPONSOR (Prominent on all screens) --- */}
    <div className="col-span-2 md:col-span-1 order-first md:order-none w-full flex flex-col items-center gap-3">
      <p className="text-purple-400 text-[10px] uppercase tracking-[0.2em] font-bold">Title Sponsor</p>
      <div className="relative w-48 h-14 md:w-56 md:h-16">
        <Image src="/images/Simnovus-logo-dark-background.png" alt="SiMNOVUS" fill className="object-contain"/>
      </div>
    </div>

    {/* --- 3. MES PARTNER (MTL) --- */}
    <div className="col-span-1 flex flex-col items-center gap-2">
      <p className="text-gray-400 text-[10px] uppercase tracking-[0.1em] opacity-80">MES Partner</p>
      <div className="flex flex-col items-center">
        <div className="relative w-14 h-14 md:w-20 md:h-20">
          <Image src="/images/Manipal-Technologies-Limited.png" alt="MTL" fill className="object-contain" />
        </div>
        <span className="text-gray-300 text-[8px] md:text-[10px] font-bold uppercase tracking-tight leading-tight max-w-[100px]">
          Manipal Technologies Limited
        </span>
      </div>
    </div>

    {/* --- 4. EVENTS SPONSORS (Ananth & KNND) --- */}
    <div className="col-span-2 md:col-span-1 flex flex-col items-center gap-2">
      <p className="text-gray-400 text-[10px] uppercase tracking-[0.1em] opacity-80">Events Sponsors</p>
      <div className="flex flex-row justify-center items-center gap-6">
        {/* Ananth Logo */}
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-12 md:w-20 md:h-14">
            <Image src="/images/ananth.png" alt="Ananth" fill className="object-contain" />
          </div>
        </div>

        <div className="w-[1px] h-8 bg-white/20"></div>

        {/* KNND Block */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-8 h-8 md:w-10 md:h-10 bg-white/90 rounded-full p-1">
            <Image src="/images/KNND-Associates-Logo.png" alt="KNND" fill className="object-contain" />
          </div>
          <span className="text-gray-300 text-[8px] md:text-[10px] font-bold uppercase">KNND</span>
        </div>
      </div>
    </div>

  </div>
</div>
  )
}
// ... [SpeakersSection & TicketCard - Keep as is] ...
// (I will assume you have the code for REAL_SPEAKERS and TicketCard from previous messages. 
//  They work fine, just need to be imported or present in the file.)
// ... [REAL_SPEAKERS Array] ...
const REAL_SPEAKERS = [
   {
    name: "Shantanu Deshpande",
    role: "Founder & CEO",
    company: "Bombay Shaving Company",
    image: "/images/shantanu.jpeg",
    color: "bg-gray-800",
    gradient: "from-gray-700 to-gray-900",
    linkedin: "https://in.linkedin.com/in/shantanudeshpandebsc",
  },
  {
    name: "Sahiba Bali",
    role: "Actor & Content Creator",
    company: "Bollywood / Digital",
    image: "/images/sahiba.jpeg",
    color: "bg-pink-500",
    gradient: "from-pink-400 to-rose-600",
    linkedin: "https://in.linkedin.com/in/sahibabali",
  },
    {
    name: "Gaurav Taneja",
    role: "YouTuber & Entrepreneur",
    company: "Flying Beast",
    image: "/images/gaurav.jpeg",
    color: "bg-orange-500",
    gradient: "from-orange-400 to-red-500",
    linkedin: "https://in.linkedin.com/in/gaurav-taneja-75a80a13",
  },
  {
    name: "Parul Gulati",
    role: "Founder",
    company: "Nish Hair",
    image: "/images/parul.jpeg",
    color: "bg-purple-500",
    gradient: "from-violet-400 to-purple-600",
    linkedin: "https://in.linkedin.com/in/parul-gulati-44709681",
  },

 
  {
    name: "Ankur Warikoo",
    role: "Entrepreneur & Author",
    company: "Warikoo",
    image: "/images/ankur.jpeg",
    color: "bg-indigo-500",
    gradient: "from-indigo-400 to-purple-600",
    linkedin: "https://in.linkedin.com/in/warikoo",
  },
];

export function SpeakersSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <BlurReveal>
   <div className="mb-16 md:mb-24 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
  <div>
    <p className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-3">
      The Network // 02
    </p>

    <h2 className="text-4xl sm:text-5xl md:text-9xl font-serif-display italic font-bold text-white leading-[0.95] md:leading-[0.85]">
      The<br />Speakers.
    </h2>
  </div>

  <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md font-light leading-relaxed text-left">
    Visionaries, disruptors, and titans of industry. These are the voices shaping the future.
  </p>
</div>

      </BlurReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {REAL_SPEAKERS.map((speaker, idx) => (
          <BlurReveal key={idx} delay={idx * 0.1}>
            <div className="group relative h-[500px] md:h-[600px] w-full rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-700">
              <div className="absolute inset-0 z-0">
                  <Image src={speaker.image} alt={speaker.name} fill className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 opacity-[0.2] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
              </div>
              <div className={`absolute -bottom-10 -right-10 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 ${speaker.color}`} />
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                   <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10"><span className="text-xs font-bold text-white uppercase tracking-widest">{speaker.company}</span></div>
                   <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"><Linkedin size={20} /></div>
                </div>
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-3 border-l-2 border-white/20 pl-3">{speaker.role}</p>
                   <h3 className="text-5xl md:text-6xl font-serif-display italic font-bold text-white leading-[0.85] mb-6">{speaker.name.split(' ').map((n, i) => (<span key={i} className="block">{n}</span>))}</h3>
                   <div className={`h-[2px] w-12 group-hover:w-full transition-all duration-700 bg-gradient-to-r ${speaker.gradient}`} />
                </div>
              </div>
            </div>
          </BlurReveal>
        ))}
      </div>
    </div>
  );
}

export function TicketCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const router = useRouter(); // 👈 INITIALIZED ROUTER

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  // Placeholder for your buy function
  const handleBuyTicket = () => {
    router.push("/signup");
  };
  
return (
  <motion.div
    ref={cardRef}
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    style={{
      transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
    }}
    className="relative w-full max-w-5xl mx-auto transition-transform duration-300 ease-out will-change-transform"
  >
    {/* Glow */}
    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-blue-600/40 rounded-[2.5rem] blur-3xl opacity-50" />

    {/* ========================================== */}
    {/* DESKTOP VIEW (ONLY DESKTOP) */}
    {/* ========================================== */}
    <div className="hidden md:block relative w-full overflow-hidden rounded-3xl">
      <img
        src="/images/MES WEB PASS.jpg"
        alt="MES 2026 Pass"
        className="w-full h-auto object-contain"
      />

      {/* BUY Button */}
      <button
        onClick={homedir}
        className="
          absolute 
          right-[5%] 
          bottom-[2%]
          px-10 py-3
          bg-yellow-400
          text-black
          font-bold
          text-lg
          rounded-xl
          shadow-[0_0_25px_rgba(234,179,8,0.6)]
          hover:scale-105
          hover:bg-yellow-300
          transition-all
          active:scale-95
        "
      >
        SOON!
      </button>
    </div>

    {/* ========================================== */}
    {/* MOBILE VIEW (ONLY MOBILE) */}
    {/* ========================================== */}
    <div className="block md:hidden relative w-full h-[520px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <img
        src="/images/mobilewebpass.jpg"
        alt="MES 2026 Mobile Pass"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <button
        onClick={homedir}
        className="
          absolute 
          right-[7%] 
          bottom-[6%]
          px-12 py-4
          bg-yellow-400
          text-black
          font-bold
          text-base
          rounded-lg
          shadow-[0_0_20px_rgba(234,179,8,0.6)]
          active:scale-95
          transition-all
        "
      >
        SOON
      </button>
    </div>
  </motion.div>
);
}

export function PassesSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center relative">
      <BlurReveal>
        <div className="text-center mb-12 md:mb-16">
           <h2 className="text-sm md:text-base font-sans tracking-[0.3em] text-purple-400 uppercase mb-4 animate-pulse">The Golden Ticket</h2>
          <h1 className="text-5xl md:text-8xl font-serif-display italic text-white mb-6">Get Your Pass</h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light">One pass. Infinite possibilities.</p>
        </div>
      </BlurReveal>
      <BlurReveal delay={0.2} className="w-full px-4"><TicketCard /></BlurReveal>
    </div>
  );
}

// =========================================
// MAIN PAGE
// =========================================
export default function Home() {
  return (
    <div className="bg-[#050505] text-white w-full min-h-screen font-sans">
      <Navbar />

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
          <Canvas gl={{ antialias: true, alpha: true }}>
              <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={50} />
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              <directionalLight position={[-5, 3, -5]} intensity={1} />
              <spotLight position={[0, 10, 10]} intensity={2} angle={0.6} penumbra={1} />
          </Canvas>
      </div>
      
      {/* HERO SECTION - MOBILE OPTIMIZED */}
      <section id="hero" className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden z-[100]">
        <div className="absolute inset-0 z-0 pointer-events-none"><Prism scale={4} colorFrequency={2.5} noise={0} /></div>
          
        {/* 3D Model Background */}
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
            <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }} className="w-full h-full">    
                <ambientLight intensity={1} />
                <HeroBusinessman />
            </Canvas>
        </div>

        {/* Hero Text: Fixed Placement & Scaling */}
        <div className="relative z-20 w-full max-w-[1600px] mx-auto px-5 h-full flex flex-row items-start md:items-center justify-between pointer-events-none pt-74 md:pt-0">
            
            {/* Left Text: "MES" */}
            {/* Left Text: "MES" */}
<h1 className="font-serif-display font-bold text-4xl md:text-9xl lg:text-[13rem] leading-none text-white mix-blend-difference tracking-tighter drop-shadow-[0_0_20px_rgba(236,72,153,0.6),0_0_60px_rgba(169,85,247,0.4)] order-1">
    MES
</h1>

{/* Right Text: "2026" */}
<h1 className="font-serif-display font-bold text-4xl md:text-9xl lg:text-[13rem] leading-none text-white mix-blend-difference tracking-tighter drop-shadow-[0_0_20px_rgba(236,72,153,0.6),0_0_60px_rgba(168,85,247,0.5)] order-2">
    2026
</h1>
        </div>        <SponsorFooter/>
      </section>

      <section id="passes" className="relative z-30 min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-t border-white/5">
        <PassesSection />
      </section>
      <section id="speakers" className="relative z-30 min-h-[100dvh] w-full flex items-center justify-center bg-[#050505] border-t border-white/10">
        <SpeakersSection />
      </section>
      <ExpandingSection />

      <section className="relative z-50 w-full">
        <Tunnel />
      </section>

      <section id="events" className="relative z-30 w-full min-h-[100dvh] bg-[#050505] border-t border-white/5 overflow-hidden">
        <EventsPage />
      </section>

      <section id="timeline" className="relative z-30 min-h-[100dvh] w-full bg-[#050505] border-t border-white/5 flex flex-col justify-center">
        <TimelineSection />
      </section>



      {/* =========================================
          PROFESSIONAL FOOTER
      ========================================= */}
      <footer className="relative z-30 border-t border-white/10 bg-[#050505] pt-20 pb-10">
         <div className="max-w-7xl mx-auto px-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

               {/* BRAND COLUMN (Span 4) */}
               <div className="md:col-span-4 flex flex-col gap-6">
                  <div>
                     <h3 className="font-serif-display italic font-bold text-3xl text-white mb-2">MES 2026</h3>
                     <p className="text-gray-400 text-sm leading-relaxed">
                        Empowering Innovation • Building the Future
                     </p>
                  </div>
                  
                  {/* Social Links */}
            {/* Social Links */}
<div className="flex gap-4">
  {[
    { icon: Instagram, href: "https://www.instagram.com/ecell.mit" },
    { icon: Linkedin, href: "https://in.linkedin.com/company/ecellmit" },
    { icon: Youtube, href: "https://www.youtube.com/channel/UCjxa0qInEzuaJR0adwh3VCQ" },
    { icon: Twitter, href: "https://x.com/ecellmit" } // Using Twitter icon for X
  ].map((social, i) => (
    <a key={i} href={social.href} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black hover:border-white transition-all duration-300">
      <social.icon size={18} />
    </a>
  ))}
</div>
               </div>

               {/* CONTACT COLUMN (Span 5) */}
               <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Chairperson */}
                  <div>
                     <h4 className="text-purple-400 font-mono text-xs tracking-widest uppercase mb-4">Chairperson</h4>
                     <p className="font-bold text-white text-sm mb-1">Bhavesh Changulani</p>
                     <a href="tel:+916386098299" className="text-gray-500 text-xs hover:text-white transition-colors font-mono tracking-wide">+91 63860 98299</a>
                  </div>

                  {/* PR Team */}
                  <div>
                     <h4 className="text-purple-400 font-mono text-xs tracking-widest uppercase mb-4">Tech</h4>
                     <div className="flex flex-col gap-4">
                        <div>
                           <p className="font-bold text-white text-sm mb-1">Sanchit Sood</p>
                           <a href="tel:+919872093930" className="text-gray-500 text-xs hover:text-white transition-colors font-mono tracking-wide">+91 98720 93930</a>
                        </div>
                        <div>
                           <p className="font-bold text-white text-sm mb-1">Ahmed</p>
                           <a href="tel:+918849148474" className="text-gray-500 text-xs hover:text-white transition-colors font-mono tracking-wide">+91 88491 48474</a>
                        </div>
                     </div>
                  </div>
               </div>

               {/* LOCATION COLUMN (Span 3) */}
               <div className="md:col-span-3">
                  <h4 className="text-purple-400 font-mono text-xs tracking-widest uppercase mb-4">Location</h4>
                  <div className="flex gap-3 items-start">
                     <MapPin className="text-gray-600 mt-1 flex-shrink-0" size={16} />
                     <address className="not-italic text-gray-400 text-sm leading-relaxed">
                        E-Cell MIT Manipal<br/>
                        Innovation Centre<br/>
                        MIT Rd, Eshwar Nagar<br/>
                        Manipal, Karnataka 576104
                     </address>
                  </div>
                  <div className="mt-6 pl-7">
                     <a 
                        href="https://goo.gl/maps/YourMapLink" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest hover:text-purple-400 transition-colors border-b border-white/20 pb-0.5 hover:border-purple-400"
                     >
                        View on Google Maps <ArrowUpRight size={12} />
                     </a>
                  </div>
               </div>

            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-600 text-xs">© 2026 E-Cell MIT Manipal. All rights reserved.</p>
               <div className="flex gap-6">
                  <a href="#" className="text-gray-600 text-xs hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="text-gray-600 text-xs hover:text-white transition-colors">Terms of Service</a>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}