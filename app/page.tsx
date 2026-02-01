"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useState, Suspense, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { motion, useInView, useAnimation, Variants, useTransform, useScroll, useSpring } from "framer-motion";
import { SkeletonUtils } from "three-stdlib";
import Prism from "../components/Prism";
import Image from "next/image";
import Tunnel from "../components/Tunnel";
import DollarRain from "@/components/DollarRain";
import Navbar from "@/components/Navbar";
import CardSwap, { Card, CardSwapHandle } from "../components/CardsSwap";
import { Check, ArrowUpRight, Linkedin, Twitter } from "lucide-react"; 
// =========================================
// SCROLL DEBUGGER
// =========================================
function ScrollDebugger() {
  const [info, setInfo] = useState({ px: 0, vh: 0 });
  useEffect(() => {
    const update = () => {
      const px = window.scrollY;
      const h = window.innerHeight;
      const vh = (px / h).toFixed(2); 
      setInfo({ px: Math.round(px), vh: Number(vh) });
    };
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[50001] bg-red-600 text-white font-mono text-xs p-3 rounded pointer-events-none">
      <div>SCROLL Y: {info.px}px</div>
      <div>VH: {info.vh}</div>
    </div>
  );
}

// =========================================
// IDLE MAN (Simplified Falling Man)
// =========================================
function FallingMan() {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  
  const gltf = useGLTF("/models/BusinessmanFinal-copy.glb");
  const scene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf.scene]);
  const animations = gltf.animations;
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  const BASE_SCALE = 450; 

  const actions = useMemo(() => {
    const actionMap: Record<string, THREE.AnimationAction> = {};
    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      actionMap[clip.name.toLowerCase()] = action;
    });
    return actionMap;
  }, [mixer, animations]);

  useLayoutEffect(() => {
    mixerRef.current = mixer;
    actionsRef.current = actions;
    const idle = actions["idle"] || Object.values(actions)[0];
    idle?.reset().play();

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;
      }
    });
  }, [scene, mixer, actions]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    const appearStart = 300;     
    const fullyExpanded = 1500;  
    const disappearStart = vh * 5.5; 

    if (scrollY < appearStart || scrollY > disappearStart) {
        group.current.visible = false;
        return;
    }

    group.current.visible = true;

    if (scrollY < fullyExpanded) {
        const expandProgress = (scrollY - appearStart) / (fullyExpanded - appearStart);
        const p = Math.max(0, Math.min(1, expandProgress));
        const currentScale = THREE.MathUtils.lerp(0, BASE_SCALE, p);
        group.current.scale.set(currentScale, currentScale, currentScale);
        const currentX = THREE.MathUtils.lerp(-3.5, 0, p);
        group.current.position.set(currentX, -1.0, 0);
    } else {
        group.current.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE);
        group.current.position.set(0, -1.0, 0);
    }

    group.current.rotation.set(0, 0, 0);
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  return <primitive object={scene} ref={group} />;
}

useGLTF.preload("/models/BusinessmanFinal-copy.glb");

// =========================================
// REUSABLE BLUR REVEAL COMPONENT
// =========================================
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

// =========================================
// HERO MODEL (STATIC GREETING MAN)
// =========================================
function HeroBusinessman() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/BusinessmanFinal.glb");
  const { actions } = useAnimations(animations, group);
  
  // Set startRain to true immediately
  const [startRain] = useState(true);

  useEffect(() => {
    // Locate the greeting animation immediately
    const greetAction = actions["greet"] || 
                        Object.values(actions).find(a => a!.getClip().name.toLowerCase().includes("greet"));
    
    if (greetAction) {
      // Play immediately with no fade-in delay for maximum "snap"
      greetAction.reset().play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      {/* The model is present and animating from frame one */}
      <primitive object={scene} position={[0, -7.5, 0]} scale={500} />
      
      {/* Rain starts immediately on mount */}
      {startRain && <DollarRain />}
    </group>
  );
}
useGLTF.preload("/models/BusinessmanFinal.glb");

// =========================================
// DATA FOR EVENTS (REAL DATA)
// =========================================
// =========================================
// 3. UPDATED EVENTS SECTION (Cinematic Cards)
// =========================================

// =========================================
// 3. UPDATED EVENTS SECTION (Fixed Image Links)
// =========================================

const REAL_EVENTS = [
  { 
    date: "7 Feb", 
    title: "Conceptio Ideathon", 
    desc: "A high-energy ideation sprint where teams brainstorm, validate, and pitch innovative solutions.", 
    link: "https://unstop.com/", 
    // Image: Abstract Tech Team / Brainstorming
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop"
  },
  { 
    date: "10 Feb", 
    title: "Money Quest", 
    desc: "A finance-focused challenge testing strategy, risk-taking, and decision-making skills.", 
    link: "https://unstop.com/", 
    // FIXED IMAGE: High-contrast Dark Trading Charts
image:"https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop"  },
  { 
    date: "10 Feb", 
    title: "Exclusive Workshop", 
    desc: "A hands-on, expert-led workshop offering deep insights and practical takeaways.", 
    link: "#", 
    // Image: Collaborative Workshop
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
  },
  { 
    date: "11 Feb", 
    title: "Innovation Policy", 
    desc: "A consortium-style discussion on innovation frameworks, governance, and policy impact.", 
    link: "#", 
    // Image: Corporate Round Table
    image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=800&auto=format&fit=crop"
  },
  { 
    date: "11 Feb", 
    title: "Postmortem", 
    desc: "An analytical postmortem session uncovering blind spots, failures, and lessons from real cases.", 
    link: "#", 
    // Image: Dark Chess / Strategy
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop"
  },
  { 
    date: "12 Feb", 
    title: "Inauguration", 
    desc: "The official inauguration marking the beginning of the event series.", 
    link: "#", 
    // Image: Stage Lighting / Event
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop"
  },
  {
    date: "13 Feb",
    title: "Pitch Tank",
    desc: "Startup-style pitch sessions where teams present ideas to a judging panel.",
    link: "#", 
    // Image: Microphone / Speaker
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=800&auto=format&fit=crop"
  },
  {
    date: "14 Feb",
    title: "Innovation Mela",
    desc: "A vibrant exhibition of innovative ideas, prototypes, and creative projects.",
    link: "#",
    // Image: Futuristic Abstract / Expo
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
  },
  {
    date: "14 Feb",
    title: "Case Maze",
    desc: "A competitive case-solving challenge designed to test analytical thinking.",
    link: "#",
    // Image: Abstract Maze / Geometry
    image: "https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?q=80&w=800&auto=format&fit=crop"
  }
];

function EventsPage() {
  return (
    <section className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <BlurReveal>
            <div className="text-center mb-16">
                <p className="text-purple-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-4">The Agenda // 03</p>
                <h2 className="text-6xl md:text-8xl font-serif-display italic font-bold text-white">Event Schedule</h2>
            </div>
        </BlurReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REAL_EVENTS.map((event, idx) => (
            <BlurReveal key={idx} delay={idx * 0.1} className="h-full">
              <div 
                onClick={() => window.open(event.link, "_blank")} 
                className="group relative h-[500px] rounded-[2.5rem] bg-[#0c0c0c] border border-white/5 overflow-hidden cursor-pointer transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                
                {/* 1. Full Background Image */}
                <div className="absolute inset-0">
                    <Image 
                        src={event.image} 
                        alt={event.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    />
                </div>

                {/* 2. Cinematic Gradient Overlay (Ensures text readability) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />

                {/* 3. Content Layer */}
                <div className="relative h-full flex flex-col p-10 z-10 justify-between">
                    
                    {/* Top Row: Date Badge & Arrow */}
                    <div className="flex justify-between items-start">
                        <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                            <span className="text-xs font-bold text-white uppercase tracking-[0.15em]">{event.date}</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 group-hover:bg-white group-hover:text-black transition-all duration-300">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>

                    {/* Bottom Row: Title, Desc, Button */}
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-4xl font-serif-display italic font-bold text-white mb-3 leading-[0.9]">
                            {event.title}
                        </h3>
                        <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-2 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                            {event.desc}
                        </p>
                        
                        <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Flagship Event</span>
                            <span className="text-sm font-bold text-white underline decoration-white/30 underline-offset-4 group-hover:decoration-white transition-all">
                                Register
                            </span>
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
// =========================================
// EXPANDING SECTION
// =========================================

export  function ExpandingSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardSwapRef = useRef<CardSwapHandle>(null);
    const [progress, setProgress] = useState(0);
    const lastIndexRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const totalDistance = rect.height - window.innerHeight;
            const scrolled = -rect.top;
            setProgress(Math.max(0, Math.min(1, scrolled / totalDistance)));
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const timeline = progress * 2.5; 
    const expansionCap = Math.min(1, timeline);
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easedBox = ease(expansionCap);
    const isLocked = expansionCap >= 0.99;

    const activeCardIndex = Math.floor(progress * 12) % 3;

    useEffect(() => {
        if (activeCardIndex !== lastIndexRef.current) {
            cardSwapRef.current?.triggerSwap();
            lastIndexRef.current = activeCardIndex;
        }
    }, [activeCardIndex]);

    return (
        <section ref={containerRef} className="relative h-[500vh] bg-[#ffffff] z-20 font-sans">
            <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
                {/* THE FIX: ANIMATED BACKGROUND COLOR
                   1. Starts at Hero Black (#0a0a0a)
                   2. Expands into Soft Pink (#FFD9DA) for the "Vision" impact
                   3. Fades back to Dark (#0a0a0a) when cards appear (timeline > 0.4) 
                   so it matches the rest of the dark site.
                */}
                <div 
                    className="absolute overflow-hidden z-20 border border-white/5 shadow-2xl transition-colors duration-1000 ease-in-out"
                    style={{ 
                        backgroundColor: timeline > 0.4 ? '#FFD9DA' : '#FFD9DA', // COLOR SWITCH LOGIC
                        width: isLocked ? '100%' : `${45 + easedBox * 55}%`, 
                        height: isLocked ? '100vh' : `${50 + easedBox * 50}vh`,
                        top: '50%',
                        left: isLocked ? '0' : `${10 * (1 - easedBox)}%`,
                        transform: isLocked ? 'translate(0, -50%)' : 'translateY(-50%)',
                        borderRadius: isLocked ? '0px' : `${40 * (1 - easedBox)}px`
                    }}
                >
                    <div className="absolute inset-0 opacity-[0.1] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* TEXT: THE VISION (Visible on Pink BG) */}
                    <div 
                        className="absolute top-20 left-12 md:left-24 z-30 pointer-events-none"
                        style={{ 
                            opacity: Math.max(0, 1 - (timeline - 0.3) * 10), // Fades out as it turns black
                            transform: `translateY(${(timeline - 0.2) > 0 ? '0' : '20px'})`,
                            transition: 'all 0.5s ease-out'
                        }}
                    >
                        <p className="text-rose-600 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">The Mission // 01</p>
                        <h2 className="font-serif-display italic text-black text-5xl md:text-8xl leading-none">The Vision.</h2>
                    </div>

                    {/* TEXT: TAKE THE LEAP (Visible on Black BG) */}
                    <div className="absolute bottom-12 left-12 z-30 pointer-events-none md:bottom-20 md:left-20">
                        <h2 
                            className="font-serif-display italic font-bold text-fuchsia-900 text-7xl md:text-9xl leading-none tracking-tighter"
                            style={{
                                opacity: Math.max(0, (timeline - 0.6) * 5),
                                transform: `translateY(${(timeline - 0.6) > 0 ? '0' : '40px'})`,
                                transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                            }}
                        >
                            Take the Leap.
                        </h2>
                    </div>

                    {/* CARDS: Styled with Matching Pink Accents */}
                    <div 
                        className="absolute top-[55%] right-8 md:right-16 -translate-y-1/2 z-30 pointer-events-auto"
                        style={{
                            opacity: Math.max(0, (timeline - 0.4) * 5),
                            transition: 'opacity 0.5s ease-out'
                        }}
                    >
                        <CardSwap ref={cardSwapRef} width={400} height={420} easing="elastic">
                            {/* PILLAR 1: CAPITAL */}
                            <Card customClass="bg-[#111] border border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
                                <div className="relative w-full h-full p-8 flex flex-col justify-between">
                                    <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">01</div>
                                    <div>
                                        <h3 className="text-white text-4xl font-serif-display italic mb-2">Capital</h3>
                                        <p className="text-gray-400 text-xs leading-relaxed font-light">Connecting student-led ventures with serious VC backing.</p>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-500 blur-[80px] opacity-20" />
                                </div>
                            </Card>

                            {/* PILLAR 2: COMMUNITY */}
                            <Card customClass="bg-[#111] border border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
                                <div className="relative w-full h-full p-8 flex flex-col justify-between">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">02</div>
                                    <div>
                                        <h3 className="text-white text-4xl font-serif-display italic mb-2">Community</h3>
                                        <p className="text-gray-400 text-xs leading-relaxed font-light">A massive network of 30,000+ students and alumni.</p>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500 blur-[80px] opacity-20" />
                                </div>
                            </Card>

                            {/* PILLAR 3: CAREER */}
                            <Card customClass="bg-[#111] border border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
                                <div className="relative w-full h-full p-8 flex flex-col justify-between">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">03</div>
                                    <div>
                                        <h3 className="text-white text-4xl font-serif-display italic mb-2">Career</h3>
                                        <p className="text-gray-400 text-xs leading-relaxed font-light">Bridging the gap between engineering and entrepreneurship.</p>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500 blur-[80px] opacity-20" />
                                </div>
                            </Card>
                        </CardSwap>
                    </div>
                </div>
            </div>
        </section>
    );
}

// =========================================
// 2. UPDATED TIMELINE SECTION (HORIZONTAL SCROLL)
// =========================================
const TIMELINE_DATA = [
  {
    title: "Conceptiō",
    tag: "FLAGSHIP",
    color: "bg-pink-500",
    items: [
      { date: "11 Dec - 07 Jan", label: "Ideation Round", desc: "Pitch Deck submission (8-10 slides)." },
      { date: "11 Jan - 27 Jan", label: "PoC Workshop", desc: "Build a working prototype." },
      { date: "07 Feb", label: "Final Pitching", desc: "7-minute pitch to judges." },
    ]
  },
  {
    title: "Pitch Tank",
    tag: "FLAGSHIP",
    color: "bg-purple-500",
    items: [
      { date: "16 Dec - 05 Jan", label: "Startup Submission", desc: "Showcase business models." },
      { date: "08 Jan - 20 Jan", label: "Video & Deck", desc: "3-min pitch video." },
      { date: "13 Feb - 14 Feb", label: "Offline Pitching", desc: "Pitch to VCs in person." },
    ]
  },
  {
    title: "Blindspot",
    tag: "CASE STUDY",
    color: "bg-blue-500",
    items: [
      { date: "26 Jan - 31 Jan", label: "Screening Desk", desc: "Identify key risks." },
      { date: "02 Feb - 07 Feb", label: "Financials", desc: "Deep dive into financial risk." },
      { date: "11 Feb", label: "The Verdict", desc: "Diagnose root causes." },
    ]
  },
  {
    title: "Case Maze",
    tag: "STRATEGY",
    color: "bg-teal-500",
    items: [
      { date: "27 Jan - 30 Jan", label: "Elimination Quiz", desc: "MCQs on Finance & Logic." },
      { date: "01 Feb - 08 Feb", label: "Case Submission", desc: "Functional area challenge." },
      { date: "14 Feb", label: "Final Pitch", desc: "Present strategy to panel." },
    ]
  },
  {
    title: "Money Quest",
    tag: "FUN",
    color: "bg-amber-500",
    items: [
      { date: "06 Feb - 07 Feb", label: "Quiz Round", desc: "Online finance quiz." },
      { date: "09 Feb", label: "The Auction", desc: "Treasure hunt + Strategic Auction." },
    ]
  },
  {
    title: "PostMortem",
    tag: "MYSTERY",
    color: "bg-red-500",
    items: [
      { date: "05 Feb - 08 Feb", label: "Qualification Quiz", desc: "Murder mystery test." },
      { date: "11 Feb", label: "The Deduction", desc: "Solve the CEO's murder." },
    ]
  }
];





// Sub-component to prevent parent re-renders// --- DATA (Same as before) ---

export function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // REDUCED SCROLL DISTANCE: h-[300vh] instead of 600vh makes it faster
  // x-range adjusted to ensure the last card isn't cut off
  const xTranslate = useTransform(smoothProgress, [0, 1], ["0%", "-85%"]);

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-[#050505]">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-6 mb-8 w-full z-10">
          {/* SCALED DOWN TEXT: From 9xl to 7xl to fit screen better */}
          <h2 className="text-5xl md:text-7xl font-serif-display italic font-bold text-white mb-2 tracking-tighter">
            Timeline
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 bg-purple-500" />
            <p className="text-purple-400 font-mono text-[10px] tracking-[0.2em] uppercase">
              Phase Sequence 2026 // 04
            </p>
          </div>
        </div>

        {/* HORIZONTAL TRACK */}
        <motion.div 
          style={{ x: xTranslate }} 
          className="flex gap-6 px-6 md:px-24 will-change-transform"
        >
          {TIMELINE_DATA.map((phase, idx) => (
            <TimelineCard key={idx} phase={phase} />
          ))}
          {/* Spacer to prevent cutoff */}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
        
        {/* Custom Scrollbar */}
        <div className="absolute bottom-12 left-12 right-12 h-[1px] bg-white/10 overflow-hidden rounded-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
            style={{ scaleX: smoothProgress, transformOrigin: "left" }} 
          />
        </div>
      </div>
    </section>
  );
}

function TimelineCard({ phase }: { phase: any }) {
  return (
    // SCALED DOWN CARD: Width 350px (was 500px), Padding p-8 (was p-12)
    <div className="relative w-[300px] md:w-[380px] shrink-0 group">
      <div className="bg-[#0A0A0A] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 hover:border-purple-500/30 transition-all duration-500 h-full group-hover:bg-[#0f0f0f] shadow-xl">
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className={`text-[9px] font-black ${phase.color.replace('bg-', 'text-')} uppercase tracking-[0.2em] mb-1 block`}>
              {phase.tag}
            </span>
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
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-1 font-mono">
                  {item.date}
                </span>
                <h4 className="text-base font-bold text-white/80 group-hover/item:text-white transition-colors">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-1 font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SponsorFooter() {
  return (
    <div className="absolute bottom-0 w-full z-40 pb-20 pt-32 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
      
      {/* GRID LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center text-center">
        
        {/* --- COLUMN 1: INNOVATION MELA (MITMAA) --- */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-gray-400 text-[9px] uppercase tracking-[0.2em] font-sans opacity-80 h-4 flex items-end">
            Innovation Mela Sponsor
          </p>
          <div className="relative w-full flex flex-row items-center justify-center gap-4">
    {/* Logo Container */}
    <div className="relative w-20 h-20 hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden">
        <Image 
            src="/images/MIT Manipal Alumni Association Logo Transparent.png" 
            alt="MITMAA" 
            fill 
            className="object-contain p-0.5" 
        />
    </div>

    {/* Text beside the image */}
    <span className="font-serif-display text-white text-2xl font-bold tracking-wider">
        MITMAA
    </span>
</div>
          
        </div>

        {/* --- COLUMN 2: TITLE SPONSOR (SIMNOVUS) --- */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-purple-400 text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-90 h-4 flex items-end">
            Title Sponsor
          </p>
          <div className="relative w-full h-16 flex items-center justify-center">
            <div className="relative w-48 h-12 hover:scale-105 transition-transform duration-300">
               <Image 
                 src="/images/Simnovus-logo-dark-background.png" 
                 alt="SiMNOVUS" 
                 fill 
                 className="object-contain"
               />
            </div>
          </div>
        </div>

        {/* --- COLUMN 3: ASSOCIATE SPONSORS (IMAGES) --- */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-gray-400 text-[9px] uppercase tracking-[0.2em] font-sans opacity-80 h-4 flex items-end">
            In Association With
          </p>
          
          <div className="w-full h-16 flex flex-row justify-center items-center gap-6">
             
             {/* MANIPAL TECHNOLOGIES */}
             {/* Added white bg rounded-md because the logo is dark blue */}
             <div className="relative w-25 h-25  rounded-sm hover:scale-105 transition-transform duration-300 p-1">
                <Image 
                  src="/images/Manipal-Technologies-Limited.png" 
                  alt="Manipal Technologies" 
                  fill 
                  className="object-contain"
                />
             </div>

             {/* Divider */}
             <div className="w-[1px] h-6 bg-white/20"></div>

             {/* KNND ASSOCIATES */}
             {/* Added white bg rounded-md because the logo is dark blue */}
             <div className="relative w-12 h-12 bg-white/90 rounded-full hover:scale-105 transition-transform duration-300 border border-white/10">
                <Image 
                  src="/images/KNND-Associates-Logo.png" 
                  alt="KNND Associates" 
                  fill 
                  className="object-contain p-1"
                />
             </div>

          </div>
        </div>

      </div>
    </div>
  )
}

// =========================================
// 3. UPDATED SPEAKERS SECTION
// =========================================
// =========================================
// 3. UPDATED SPEAKERS SECTION (God-Tier UI)
// =========================================

const REAL_SPEAKERS = [
  { 
    name: "Sam Altman", 
    role: "CEO", 
    company: "OpenAI", 
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", 
    color: "bg-emerald-500",
    gradient: "from-emerald-400 to-green-600"
  },
  { 
    name: "Nithin Kamath", 
    role: "Founder", 
    company: "Zerodha", 
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop", 
    color: "bg-blue-500",
    gradient: "from-blue-400 to-indigo-600"
  },
  { 
    name: "Falguni Nayar", 
    role: "CEO", 
    company: "Nykaa", 
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", 
    color: "bg-pink-500",
    gradient: "from-pink-400 to-rose-600"
  },
  { 
    name: "Kunnal Shah", 
    role: "Founder", 
    company: "CRED", 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop", 
    color: "bg-white",
    gradient: "from-gray-200 to-white"
  },
  { 
    name: "Deepinder Goyal", 
    role: "CEO", 
    company: "Zomato", 
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop", 
    color: "bg-red-500",
    gradient: "from-red-500 to-red-700"
  },
  { 
    name: "Mukesh Bansal", 
    role: "Co-Founder", 
    company: "Cure.fit", 
    image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=800&auto=format&fit=crop", 
    color: "bg-purple-500",
    gradient: "from-violet-400 to-purple-600"
  }
];

export function SpeakersSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-32 relative">
      
      {/* Section Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <BlurReveal>
        <div className="mb-24 relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
             <p className="text-blue-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-4">The Network // 02</p>
             <h2 className="text-6xl md:text-9xl font-serif-display italic font-bold text-white leading-[0.85]">
               The<br/>Speakers.
             </h2>
          </div>
          <p className="text-gray-400 text-lg max-w-md font-light leading-relaxed mb-2 text-right md:text-left">
            Visionaries, disruptors, and titans of industry. These are the voices shaping the future.
          </p>
        </div>
      </BlurReveal>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {REAL_SPEAKERS.map((speaker, idx) => (
          <BlurReveal key={idx} delay={idx * 0.1}>
            <div className="group relative h-[600px] w-full rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-700">
              
              {/* 1. FULL HEIGHT IMAGE */}
              <div className="absolute inset-0 z-0">
                  <Image 
                    src={speaker.image} 
                    alt={speaker.name} 
                    fill 
                    className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" 
                  />
                  {/* Texture Overlay */}
                  <div className="absolute inset-0 opacity-[0.2] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                  {/* Cinematic Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
              </div>

              {/* 2. HOVER GLOW EFFECT (Bottom Right) */}
              <div className={`absolute -bottom-10 -right-10 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 ${speaker.color}`} />

              {/* 3. CONTENT LAYER */}
              <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
                
                {/* Top: Hidden Details reveal on hover */}
                <div className="flex justify-between items-start translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                   <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{speaker.company}</span>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors cursor-pointer">
                      <Linkedin size={20} />
                   </div>
                </div>

                {/* Bottom: Massive Typography */}
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                   <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em] mb-3 border-l-2 border-white/20 pl-3">
                      {speaker.role}
                   </p>
                   
                   <h3 className="text-6xl font-serif-display italic font-bold text-white leading-[0.85] mb-6">
                     {speaker.name.split(' ').map((n, i) => (
                       <span key={i} className="block">{n}</span>
                     ))}
                   </h3>

                   {/* Animated Line */}
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

// =========================================
// PASSES SECTION (Unchanged)
// =========================================
function TicketCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Subtle 3D Tilt
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
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
      {/* 1. Ambient Glow Behind Ticket */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-blue-600/40 rounded-[2.5rem] blur-3xl opacity-50" />

      {/* 2. TICKET CONTAINER */}
      <div className="relative flex flex-col md:flex-row h-full md:h-[480px] bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* --- LEFT SIDE (Fluid Art & Content) --- */}
        <div className="flex-1 relative overflow-hidden bg-[#050505]">
            
            {/* --- FIX: REAL FLUID ART IMAGE BACKGROUND --- */}
            {/* This ensures the design is visible and not just a dark void */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-hard-light"
              style={{ 
                // Using a high-quality abstract fluid art image from Unsplash
                backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')` 
              }} 
            />
            
            {/* Dark Overlay to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

            {/* Noise Texture (Canvas Feel) */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} 
            />

            {/* CONTENT */}
            <div className="relative z-10 flex flex-col h-full justify-between p-8 md:p-12">
                <div>
                    {/* Badge */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            <span className="text-yellow-200 text-xs font-bold tracking-widest uppercase text-shadow">
                                Access Granted
                            </span>
                        </div>
                    </div>
                    
                    {/* Gold Gradient Title */}
                    <h2 className="text-5xl md:text-6xl font-serif-display italic mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        All Access Pass
                    </h2>
                    <p className="text-purple-100/90 text-lg font-light max-w-md tracking-wide">
                        Unlock the full spectrum of MES 2026.
                    </p>
                </div>

                {/* Features List */}
                <div className="mt-8 space-y-4">
                    {[
                        "Access to all Speaker Sessions",
                        "Entry to Flagship Competitions",
                        "Exclusive Networking Lunch",
                        "MES 2026 Official Swag Kit",
                        "Certificate of Participation"
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-white/90 group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black/40 border border-yellow-500/50 flex items-center justify-center group-hover:border-yellow-400 transition-colors shadow-lg backdrop-blur-sm">
                                <Check className="w-3.5 h-3.5 text-yellow-300" />
                            </div>
                            <span className="text-sm md:text-base font-medium drop-shadow-md">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- PERFORATION LINE --- */}
        <div className="relative hidden md:flex flex-col items-center justify-center w-0 bg-transparent z-20">
            {/* The Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dashed border-white/30 h-full" />
            
            {/* The Cutouts */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#000000] rounded-full z-20" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#000000] rounded-full z-20" />
        </div>

        {/* --- RIGHT SIDE (Stub) --- */}
        <div className="w-full md:w-[380px] bg-indigo-950 relative overflow-hidden border-t md:border-t-0 border-white/10 flex flex-col z-10">
             {/* Stub Art Background (Darker) */}
             <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop')` 
              }} 
            />
             
             <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

             <div className="relative z-10 p-8 md:p-12 flex flex-col h-full justify-center items-center text-center">
                
                <div className="mb-auto">
                    <h3 className="text-white/40 font-serif-display italic text-2xl tracking-widest">MES 2026</h3>
                </div>

                <div className="py-8">
                    <p className="text-indigo-200 text-xs font-mono uppercase mb-2 tracking-[0.2em]">Admit One</p>
                    <div className="flex items-start justify-center text-white leading-none drop-shadow-2xl">
                        <span className="text-3xl mt-2 text-indigo-300 font-serif">₹</span>
                        <span className="text-8xl font-black tracking-tighter">499</span>
                    </div>
                </div>

                <div className="mt-auto w-full">
                    {/* Updated 'handleBuyTicket' Function Trigger */}
                    <button 
                        onClick={() => console.log("Replace this with handleBuyTicket()")} 
                        className="group relative w-full px-8 py-4 bg-white text-black font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        
                        <span className="relative z-10 group-hover:text-black transition-colors flex items-center justify-center gap-2">
                            Secure Your Pass
                        </span>
                    </button>
                    <p className="mt-4 text-[10px] text-indigo-300/60 uppercase tracking-widest font-medium">
                        Official Entry • Non-Transferable
                    </p>
                </div>
             </div>
        </div>

      </div>
    </motion.div>
  );
}

export function PassesSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-32 flex flex-col items-center relative">
      <BlurReveal>
        <div className="text-center mb-16">
           <h2 className="text-sm md:text-base font-sans tracking-[0.3em] text-purple-400 uppercase mb-4 animate-pulse">
            The Golden Ticket
          </h2>
          <h1 className="text-6xl md:text-8xl font-serif-display italic text-white mb-6">
            Get Your Pass
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            One pass. Infinite possibilities.
          </p>
        </div>
      </BlurReveal>

      <BlurReveal delay={0.2} className="w-full px-4">
        <TicketCard />
      </BlurReveal>
    </div>
  );
}

// =========================================
// MAIN PAGE
// =========================================
export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#050505] text-white w-full min-h-screen font-sans">
      <Navbar />

      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
          <Canvas gl={{ antialias: true, alpha: true }}>
              <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={50} />
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              <directionalLight position={[-5, 3, -5]} intensity={1} />
              <spotLight position={[0, 10, 10]} intensity={2} angle={0.6} penumbra={1} />
              <Suspense fallback={null}>
                  <FallingMan />
              </Suspense>
          </Canvas>
      </div>
      <ScrollDebugger></ScrollDebugger>
      
      {/* HERO SECTION */}
      <section id= "hero" className="relative h-screen w-full flex flex-col justify-center overflow-hidden z-[100] ">
        <div className="absolute inset-0 z-0"><Prism scale={4} colorFrequency={2.5} noise={0} /></div>
          <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 flex items-center justify-center">
              <h1 className="mr-130 font-serif-display  font-bold text-6xl md:text-8xl lg:text-[11rem] leading-none text-white mix-blend-difference flex-1 text-right pr-8 md:pr-16 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">MES</h1>
            <div className="absolute w-full h-screen overflow-visible"> 
        <Canvas 
          shadows 
          camera={{ position: [0, 0, 10], fov: 50 }}
          style={{ pointerEvents: 'none' }} 
        >    
            <ambientLight intensity={1} />
            <HeroBusinessman />
        </Canvas>
              </div>
              <h1 className="font-serif-display font-bold text-6xl md:text-8xl lg:text-[11rem] leading-none text-white mix-blend-difference flex-1 text-left pl-8 md:pl-16 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        2026
    </h1>          </div>
        <SponsorFooter/>
      </section>

      <ExpandingSection />

      <section className="relative z-50 w-full">
        <Tunnel />
      </section>

      {/* 1. SPEAKERS SECTION */}
      <section 
        id="speakers" 
        className="relative z-30 min-h-screen w-full flex items-center justify-center bg-[#050505] border-t border-white/10"
      >
        <SpeakersSection />
      </section>

      {/* 2. EVENTS SECTION */}
      <section 
        id="events" 
        className="relative z-30 w-full min-h-screen bg-[#050505] border-t border-white/5 overflow-hidden"
      >
        <EventsPage />
      </section>

      {/* 3. TIMELINE SECTION */}
      <section id="timeline" className="relative z-30 min-h-screen w-full bg-[#050505] border-t border-white/5 flex flex-col justify-center">
        <TimelineSection />
      </section>

      {/* 4. PASSES SECTION */}
      <section 
        id="passes" 
        className="relative z-30 min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-t border-white/5"
      >
        <PassesSection />
      </section>

      <footer className="relative z-30 border-t border-white/10 px-6 md:px-16 py-20 bg-[#050505]">
         <div className="text-center md:text-left">
            <h3 className="font-bold text-2xl">MES 2026</h3>
            <p className="text-gray-500 text-sm mt-2">© 2026 Manipal Entrepreneurship Summit</p>
         </div>
      </footer>
    </div>
  );
}