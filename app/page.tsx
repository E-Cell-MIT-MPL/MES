"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useState, Suspense, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { motion, useInView, useAnimation, Variants } from "framer-motion";
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
  const model1 = useGLTF("/models/BusinessmanFinal.glb");
  const model2 = useGLTF("/models/onlyGreeting.glb"); 
  const actions1 = useAnimations(model1.animations, group).actions;
  const actions2 = useAnimations(model2.animations, group).actions;
  const [showSecondModel, setShowSecondModel] = useState(false);
  const [startRain, setStartRain] = useState(false);

  useEffect(() => {
    const idleAction = actions1["idle"];
    idleAction?.reset().fadeIn(0.5).play();

    const timer = setTimeout(() => {
      setShowSecondModel(true);
      const greetAction = actions2[""] || Object.values(actions2).find(a => a!.getClip().name.toLowerCase().includes("greet"));
      if (greetAction) greetAction.reset().fadeIn(0.1).play();
      setStartRain(true);
    }, 1500); 

    return () => clearTimeout(timer);
  }, [actions1, actions2]);

  return (
    <group ref={group}>
      {!showSecondModel && (
        <primitive object={model1.scene} position={[0, -7.5, 0]} scale={500} />
      )}
      {showSecondModel && (
        <primitive object={model2.scene} position={[0, -1.0, 0]} scale={500} />
      )}
      {startRain && <DollarRain />}
    </group>
  );
}
useGLTF.preload("/models/BusinessmanFinal.glb");

// =========================================
// DATA FOR EVENTS (REAL DATA)
// =========================================
const REAL_EVENTS = [
  {
    date: "7 Feb",
    title: "Conceptio Ideathon",
    desc: "A high-energy ideation sprint where teams brainstorm, validate, and pitch innovative solutions.",
    link: "https://unstop.com/competitions/conceptio-manipal-entrepreneurship-summit-2026-manipal-institute-of-technology-manipal-1607202",
    color: "border-purple-500 hover:shadow-purple-500/20"
  },
  {
    date: "10 Feb",
    title: "Money Quest",
    desc: "A finance-focused challenge testing strategy, risk-taking, and decision-making skills.",
    link: "https://unstop.com/competitions/money-quest-manipal-entrepreneurship-summit-2026-manipal-institute-of-technology-manipal-1620675?lb=manUB5ka&utm_medium=Share&utm_source=shiveshq9014&utm_campaign=Competitions",
    color: "border-green-500 hover:shadow-green-500/20"
  },
  {
    date: "10 Feb",
    title: "Exclusive Workshop",
    desc: "A hands-on, expert-led workshop offering deep insights and practical takeaways.",
    link: "/events/exclusive-workshop",
    color: "border-cyan-500 hover:shadow-cyan-500/20"
  },
  {
    date: "11 Feb",
    title: "Innovation Policy",
    desc: "A consortium-style discussion on innovation frameworks, governance, and policy impact.",
    link: "https://www.ecellmit.in/ipc",
    color: "border-orange-500 hover:shadow-orange-500/20"
  },
  {
    date: "11 Feb",
    title: "Postmortem",
    desc: "An analytical postmortem session uncovering blind spots, failures, and lessons from real cases.",
    link: "https://unstop.com/competitions/postmortem-manipal-entrepreneurship-summit-2026-manipal-institute-of-technology-manipal-1622583",
    color: "border-red-500 hover:shadow-red-500/20"
  },
  {
    date: "12 Feb",
    title: "Inauguration",
    desc: "The official inauguration marking the beginning of the event series.",
    link: "/events/inauguration-ceremony",
    color: "border-blue-500 hover:shadow-blue-500/20"
  },
  {
    date: "13 Feb",
    title: "Pitch Tank",
    desc: "Startup-style pitch sessions where teams present ideas to a judging panel.",
    link: "https://unstop.com/competitions/pitchtank-manipal-entrepreneurship-summit-2026-manipal-institute-of-technology-manipal-1610364",
    color: "border-pink-500 hover:shadow-pink-500/20"
  },
  {
    date: "14 Feb",
    title: "Innovation Mela",
    desc: "A vibrant exhibition of innovative ideas, prototypes, and creative projects.",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSccbx4GNrM3zdvwWszk5issp7FQfK9cbudltI80pMIDXPiFLw/viewform",
    color: "border-yellow-500 hover:shadow-yellow-500/20"
  },
  {
    date: "14 Feb",
    title: "Case Maze",
    desc: "A competitive case-solving challenge designed to test analytical thinking.",
    link: "https://unstop.com/competitions/case-maze-manipal-entrepreneurship-summit-2026-manipal-institute-of-technology-manipal-1616137",
    color: "border-teal-500 hover:shadow-teal-500/20"
  },
];

// =========================================
// 1. UPDATED EVENTS SECTION (BENTO STYLE)
// =========================================
function EventsPage() {
  return (
    <section className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <BlurReveal>
            <h2 className="text-6xl md:text-8xl font-serif-display italic font-bold text-white mb-16 text-center">
            Event Schedule
            </h2>
        </BlurReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REAL_EVENTS.map((event, idx) => (
            <BlurReveal key={idx} delay={idx * 0.1} className="h-full">
                <div
                onClick={() => window.open(event.link, "_blank")}
                className={`group relative p-8 rounded-2xl bg-white/5 border-t-4 ${event.color} border-x border-b border-white/5 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl cursor-pointer h-full flex flex-col`}
                >
                <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-white/10 rounded text-xs font-mono text-white backdrop-blur-sm">
                    {event.date}
                    </span>
                    <ArrowUpRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                    {event.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
                    {event.desc}
                </p>

                <div className="text-sm font-bold text-gray-500 group-hover:text-white uppercase tracking-wider flex items-center gap-2 mt-auto">
                    <span>Register Now</span>
                    <div className="h-px w-8 bg-gray-500 group-hover:bg-white transition-all" />
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
function ExpandingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const [progress, setProgress] = useState(0);
  const lastTriggerRef = useRef(0); 

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

  useEffect(() => {
    if (timeline > 1.3 && lastTriggerRef.current < 1) {
        cardSwapRef.current?.triggerSwap();
        lastTriggerRef.current = 1;
    } else if (timeline > 1.8 && lastTriggerRef.current < 2) {
        cardSwapRef.current?.triggerSwap();
        lastTriggerRef.current = 2;
    } else if (timeline < 1.0) {
        lastTriggerRef.current = 0; 
    }
  }, [timeline]);

  return (
      <section ref={containerRef} className="relative h-[500vh] bg-white font-sans z-20">          
          <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
              <div 
                  className="absolute bg-[#e0e0e0] overflow-hidden z-20 border border-black/10"
                  style={{ 
                      width: isLocked ? '100%' : `${45 + easedBox * 55}%`, 
                      height: isLocked ? '100vh' : `${50 + easedBox * 50}vh`,
                      top: '50%',
                      left: isLocked ? '0' : `${10 * (1 - easedBox)}%`,
                      transform: isLocked ? 'translate(0, -50%)' : 'translateY(-50%)',
                      borderRadius: isLocked ? '0px' : `${40 * (1 - easedBox)}px`,
                      willChange: 'width, height, left, transform'
                  }}
              >
                 <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 400 Q 250 450, 500 300 T 1000 50' stroke='%23000' stroke-width='2' fill='none' opacity='0.1'/%3E%3C/svg%3E")`, backgroundSize: '100% 100%', opacity: 0.6 + easedBox * 0.4 }} />
                 
                 <div className="absolute bottom-32 left-12 z-30 pointer-events-none">
                    <h2 
                        className="font-serif-display text-black text-6xl leading-none"
                        style={{
                            opacity: Math.max(0, (timeline - 0.5) * 5),
                            transform: `translateY(${timeline > 0.5 ? '0' : '20px'})`,
                            transition: 'opacity 0.5s, transform 0.5s'
                        }}
                    >
                        Take the Leap.
                    </h2>
                    <div 
                        className="overflow-hidden" 
                        style={{ 
                            maxHeight: timeline > 0.6 ? '200px' : '0px', 
                            opacity: Math.max(0, (timeline - 0.6) * 5),
                            marginTop: timeline > 0.6 ? '1rem' : '0', 
                            transition: 'all 0.5s' 
                        }}
                    >
                        <p className="text-gray-700 max-w-md text-lg">
                            Your journey from zero to one starts here.
                        </p>
                    </div>
                 </div>

                 <div 
                    className="absolute top-1/2 right-12 md:right-32 -translate-y-1/2 z-30 pointer-events-none"
                    style={{
                          opacity: Math.max(0, (timeline - 0.8) * 5),
                          transition: 'opacity 0.5s'
                    }}
                 >
                    <div className="pointer-events-auto"> 
                        <CardSwap 
                            ref={cardSwapRef}
                            width="500px" 
                            height="420px" 
                            easing="elastic"
                        >
                            <Card customClass="bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                                <div className="relative w-full h-full">
                                    <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Ashneer"/>
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-white text-3xl font-serif-display italic">Ashneer</h3>
                                        <h3 className="text-white text-3xl font-bold -mt-2">Grover</h3>
                                        <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">BharatPe</p>
                                    </div>
                                </div>
                            </Card>
                            <Card customClass="bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                                <div className="relative w-full h-full">
                                    <img src="https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Aman"/>
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-white text-3xl font-serif-display italic">Aman</h3>
                                        <h3 className="text-white text-3xl font-bold -mt-2">Gupta</h3>
                                        <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">boAt</p>
                                    </div>
                                </div>
                            </Card>
                            <Card customClass="bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
                                <div className="relative w-full h-full">
                                    <img src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Ritesh"/>
                                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <h3 className="text-white text-3xl font-serif-display italic">Ritesh</h3>
                                        <h3 className="text-white text-3xl font-bold -mt-2">Agarwal</h3>
                                        <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">OYO</p>
                                    </div>
                                </div>
                            </Card>
                        </CardSwap>
                    </div>
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

export function TimelineSection() {
  return (
    <section id="timeline" className="py-32 bg-black overflow-hidden">
      <BlurReveal>
        <div className="max-w-7xl mx-auto px-6 mb-16">
            <h2 className="text-6xl md:text-8xl font-serif-display italic font-bold text-white mb-2">
            Timeline
            </h2>
            <p className="text-gray-500 text-sm tracking-[0.2em] uppercase">
            Swipe to explore the journey
            </p>
        </div>
      </BlurReveal>

      {/* Horizontal Scroll Container */}
      <div className="relative w-full overflow-x-auto pb-12 hide-scrollbar cursor-grab active:cursor-grabbing pl-6 md:pl-[max(24px,calc((100vw-1280px)/2))]">
        <div className="flex gap-8 w-max">
          {TIMELINE_DATA.map((phase, idx) => (
            <div key={idx} className="relative w-[350px] md:w-[400px] shrink-0 pt-16">
              
              {/* Top Connector Dot */}
              <div className={`absolute top-0 left-8 w-4 h-4 rounded-full ${phase.color} shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10`} />
              <div className={`absolute top-2 left-10 w-full h-[2px] bg-white/10`} /> {/* Line connecting to next */}

              {/* Card */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors duration-300 h-full">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-bold text-white">{phase.title}</h3>
                  <span className="px-2 py-1 border border-white/20 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    {phase.tag}
                  </span>
                </div>

                {/* Timeline Items inside Card */}
                <div className="space-y-8 relative">
                  {/* Vertical Line inside card */}
                  <div className="absolute top-2 left-[5px] w-[2px] h-[calc(100%-10px)] bg-white/10" />

                  {phase.items.map((item, i) => (
                    <div key={i} className="relative pl-6">
                      {/* Dot */}
                      <div className={`absolute top-2 left-0 w-2.5 h-2.5 rounded-full ${phase.color} shadow-sm`} />
                      
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase tracking-widest mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500`}>
                          {item.date}
                        </span>
                        <h4 className="text-lg font-bold text-white mb-1">
                          {item.label}
                        </h4>
                        <p className="text-sm text-gray-500 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
          <div className="relative w-full flex flex-col items-center gap-2">
            {/* White Glow Container for Visibility */}
            <div className="relative w-16 h-16  hover:scale-105 transition-transform duration-300 flex items-center justify-center overflow-hidden">
               <Image 
                 src="/images/MIT Manipal Alumni Association Logo Transparent.png" 
                 alt="MITMAA" 
                 fill 
                 className="object-contain p-0.5" 
               />
               
            </div>
            <p className="text-purple-400 text-[9px] uppercase tracking-[0.2em] font-sans font-bold opacity-90 h-4 flex items-end">
            Title Sponsor
          </p>

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
const REAL_SPEAKERS = [
  {
    name: "Sam Altman",
    role: "CEO, OpenAI",
    company: "OpenAI",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop", 
    color: "from-emerald-400 to-green-600",
    glow: "rgba(16, 185, 129, 0.5)"
  },
  {
    name: "Nithin Kamath",
    role: "Founder & CEO",
    company: "Zerodha",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    color: "from-blue-400 to-indigo-600",
    glow: "rgba(59, 130, 246, 0.5)"
  },
  {
    name: "Falguni Nayar",
    role: "Founder & CEO",
    company: "Nykaa",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    color: "from-pink-400 to-rose-600",
    glow: "rgba(236, 72, 153, 0.5)"
  },
  {
    name: "Kunnal Shah",
    role: "Founder",
    company: "CRED",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
    color: "from-gray-200 to-white",
    glow: "rgba(255, 255, 255, 0.4)"
  },
  {
    name: "Deepinder Goyal",
    role: "Founder & CEO",
    company: "Zomato",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop",
    color: "from-red-500 to-red-700",
    glow: "rgba(239, 68, 68, 0.5)"
  },
  {
    name: "Mukesh Bansal",
    role: "Co-Founder",
    company: "Cure.fit",
    image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=800&auto=format&fit=crop",
    color: "from-violet-400 to-purple-600",
    glow: "rgba(139, 92, 246, 0.5)"
  }
];

export function SpeakersSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-32">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <BlurReveal>
        <div className="text-center mb-24 relative z-10">
          <h2 className="text-6xl md:text-8xl font-serif-display italic font-bold text-white mb-6">
            Speakers
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Industry titans, disruptors, and innovators shaping the future of finance and tech.
          </p>
        </div>
      </BlurReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {REAL_SPEAKERS.map((speaker, idx) => (
          <BlurReveal key={idx} delay={idx * 0.1}>
            <div className="group relative h-[500px] w-full rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/10">
              {/* Image with Grayscale Transition */}
              <div className="absolute inset-0">
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
              </div>

              {/* Content Card */}
              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {/* Company Tag */}
                <span className={`inline-block px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest text-white rounded-full bg-gradient-to-r ${speaker.color}`}>
                  {speaker.company}
                </span>

                <h3 className="text-3xl font-sans font-bold text-white mb-1">
                  {speaker.name}
                </h3>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-6">
                  {speaker.role}
                </p>

                {/* Social Icons (Reveal on Hover) */}
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors">
                    <Linkedin size={18} />
                  </button>
                  <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors">
                    <Twitter size={18} />
                  </button>
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
      <section className="relative h-screen w-full flex flex-col justify-center overflow-hidden z-[100] ">
        <div className="absolute inset-0 z-0"><Prism scale={4} colorFrequency={2.5} noise={0} /></div>
          <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 flex items-center justify-center">
              <h1 className="font-serif-display italic text-6xl md:text-8xl lg:text-[10rem] leading-none text-white mix-blend-difference flex-1 text-right pr-12 md:pr-24">MES</h1>
            <div className="relative w-full h-screen overflow-visible"> 
        <Canvas 
          shadows 
          camera={{ position: [0, 0, 10], fov: 50 }}
          style={{ pointerEvents: 'none' }} 
        >    
            <ambientLight intensity={1} />
            <HeroBusinessman />
        </Canvas>
              </div>
              <h1 className="font-serif-display text-6xl md:text-8xl lg:text-[10rem] leading-none text-white mix-blend-difference flex-1 text-left pl-12 md:pl-24">2026</h1>
          </div>
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