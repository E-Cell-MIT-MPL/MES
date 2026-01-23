"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Float, Environment, useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useState, Suspense, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import Prism from "../components/Prism"
import Silk from "../components/Silk"
// --- IMPORTS ---
import Tunnel from "../components/Tunnel";
import { Scene } from "../components/Scene";

// =========================================
// FALLING MAN - LIVES INSIDE EXPANDING CANVAS
// =========================================
function FallingMan({ scrollProgress }: { scrollProgress: number }) {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const [currentPhase, setCurrentPhase] = useState("idle");

  // Clone the model so it doesn't conflict with hero
  const gltf = useGLTF("/models/BusinessmanFinal.glb");
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const animations = gltf.animations;

  useLayoutEffect(() => {
    // Create our own mixer manually
    if (!mixerRef.current) {
      mixerRef.current = new THREE.AnimationMixer(scene);
      
      // Create actions manually
      animations.forEach((clip) => {
        const action = mixerRef.current!.clipAction(clip);
        actionsRef.current[clip.name] = action;
      });
      
      // ONE LOG TO SEE WHAT WE HAVE
      console.log('Available animation names:', Object.keys(actionsRef.current));
    }

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (name.includes("sphere") || name.includes("circle") || name.includes("shape")) {
          mesh.visible = false;
          return;
        }

        mesh.visible = true;
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        if (mesh.material) {
          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          mat.transparent = false;
          mat.opacity = 1;
          mat.side = THREE.DoubleSide;
          mat.depthWrite = true;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, animations]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // scrollProgress: 0 to 1 across the entire expanding section (100vh to 600vh)
    // We need finer control based on actual scroll position

    // Phase boundaries in viewport heights
    const jumpStart = 4.5; // 450vh
    const jumpEnd = 5.5;   // 550vh

    const currentVh = scrollY / vh;

    // ========== PHASE 1: IDLE (0vh - 450vh) ==========
    if (currentVh < jumpStart) {
      if (currentPhase !== "idle") {
        setCurrentPhase("idle");
        Object.values(actionsRef.current).forEach(a => a.stop());
        const idleAction = actionsRef.current["idle"];
        if (idleAction) {
          idleAction.reset().play();
        }
      }

      // Center and properly sized
      group.current.position.set(0, -2, 0);
      group.current.rotation.set(0, 0, 0);
      group.current.scale.set(1.5, 1.5, 1.5);

      if (mixerRef.current) mixerRef.current.update(delta);
      return;
    }

    // ========== PHASE 2: JUMP & FLIP (450vh - 550vh) ==========
    if (currentVh < jumpEnd) {
      const progress = (currentVh - jumpStart) / (jumpEnd - jumpStart);

      if (currentPhase !== "jumping") {
        setCurrentPhase("jumping");
        Object.values(actionsRef.current).forEach(a => a.stop());
        const flipAction = actionsRef.current["180flip"];
        if (flipAction) {
          flipAction.reset();
          flipAction.setLoop(THREE.LoopOnce, 1);
          flipAction.clampWhenFinished = true;
          flipAction.paused = true;
          flipAction.play();
        }
      }

      // Manual animation control
      const flipAction = actionsRef.current["180flip"];
      if (flipAction) {
        const duration = flipAction.getClip().duration;
        flipAction.time = progress * duration;
      }

      // Jump trajectory
      const jumpHeight = Math.sin(progress * Math.PI) * 3;
      const jumpDepth = progress * -8;

      group.current.position.set(0, -2 + jumpHeight, jumpDepth);

      // Rotation: tilt forward gradually
      const tiltX = progress * (Math.PI * 0.35);
      const spinY = progress * Math.PI;
      group.current.rotation.set(tiltX, spinY, 0);
      group.current.scale.set(1.5, 1.5, 1.5);

      return;
    }

    // ========== PHASE 3: DIVING (550vh+) ==========
    if (currentPhase !== "diving") {
      setCurrentPhase("diving");
      Object.values(actionsRef.current).forEach(a => a.stop());
      const diveAction = actionsRef.current["runtodive"];
      if (diveAction) {
        diveAction.reset();
        diveAction.setLoop(THREE.LoopRepeat, Infinity);
        diveAction.play();
      }
    }

    // Keep diving
    group.current.position.z -= 0.15;
    group.current.position.y -= 0.08;
    group.current.rotation.set(Math.PI * 0.35, Math.PI, 0);
    group.current.scale.set(1.5, 1.5, 1.5);

    if (mixerRef.current) mixerRef.current.update(delta);
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

// =========================================
// HERO MODEL (The "Greeting" Guy)
// =========================================
function HeroBusinessman() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/BusinessmanFinal.glb");
  const { actions } = useAnimations(animations, group);

  useLayoutEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (name.includes("sphere") || name.includes("circle") || name.includes("shape")) {
          mesh.visible = false;
          return;
        }

        mesh.visible = true;
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        if (mesh.material) {
           const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
           mat.transparent = false;
           mat.opacity = 1;
           mat.side = THREE.DoubleSide;
           mat.depthWrite = true;
           mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    const action = actions["greeting"];
    if (action) {
      action.reset().fadeIn(0.5).play();
    } else {
      actions[animations[0]?.name]?.reset().fadeIn(0.5).play();
    }
  }, [actions, animations]);

  return (
    <group ref={group}>
      <primitive 
        object={scene} 
        position={[0, -5.9, 0]}
        rotation={[0, 0, 0]}
        scale={450}
      />
    </group>
  );
}

useGLTF.preload("/models/BusinessmanFinal.glb");

// =========================================
// CANDLESTICK (Floating Bars)
// =========================================
interface CandlestickProps {
  position: [number, number, number];
  color: string;
  height: number;
}

function Candlestick({ position, color, height }: CandlestickProps) {
  const ref = useRef<THREE.Group>(null);
  const [initialPos] = useState(() => new THREE.Vector3(...position));

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    const { x, y } = state.pointer;

    const floatY = Math.sin(time + position[0] * 2) * 0.1;
    const parallaxX = x * 0.5;
    const parallaxY = -y * 0.5;

    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, initialPos.y + floatY + parallaxY, 0.1);
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, initialPos.x + parallaxX, 0.1);
    
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y * 0.2, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x * 0.2, 0.1);
  });

  return (
    <group position={position} ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, height + 0.5, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.2, height, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// =========================================
// EXPANDING SECTION (WITH FALLING MAN INSIDE)
// =========================================
function ExpandingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
      const handleScroll = () => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const totalDistance = rect.height - viewportHeight;
          const scrolled = -rect.top;
          let rawProgress = scrolled / totalDistance;
          rawProgress = Math.max(0, Math.min(1, rawProgress));
          setProgress(rawProgress);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const expansionProgress = Math.min(1, progress * 2);
  const internalProgress = Math.max(0, (progress - 0.5) * 2);
  const isLocked = expansionProgress >= 0.99;
  
  const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const easedP = ease(expansionProgress);
  const easedIp = ease(internalProgress);

  const tabStyles = {
      width: isLocked ? '100%' : `${45 + easedP * 55}%`, 
      height: isLocked ? '100vh' : `${50 + easedP * 50}vh`,
      top: '50%',
      left: isLocked ? '0' : `${10 * (1 - easedP)}%`,
      transform: isLocked ? 'translate(0, -50%)' : 'translateY(-50%)',
      borderRadius: isLocked ? '0px' : `${40 * (1 - easedP)}px`,
  };
  
  const contentOpacity = isLocked ? 0.9 + easedIp * 0.1 : 0.9;
  const graphSVG = `data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 500' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 400 Q 250 450, 500 300 T 1000 50' stroke='%23000' stroke-width='2' fill='none' vector-effect='non-scaling-stroke' opacity='0.1'/%3E%3Cpath d='M0 450 Q 250 500, 500 350 T 1000 100' stroke='%23000' stroke-width='1' fill='none' vector-effect='non-scaling-stroke' opacity='0.05'/%3E%3C/svg%3E`;

  return (
      <section ref={containerRef} className="relative h-[500vh] bg-white font-sans z-20">          
          <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
              <div 
                  className="absolute bg-[#e0e0e0] overflow-hidden z-20 border border-black/10"
                  style={{ 
                      ...tabStyles,
                      willChange: 'width, height, left, transform',
                      boxShadow: `0 ${20 + easedP * 30}px ${60 + easedP * 40}px rgba(0,0,0,${0.1 + easedP * 0.15})`
                  }}
              >
                    <div 
                      className="absolute inset-0 pointer-events-none" 
                      style={{ 
                          backgroundImage: `url("${graphSVG}")`, 
                          backgroundSize: '100% 100%',
                          opacity: 0.6 + easedP * 0.4
                      }}
                  />
                  <div className="absolute inset-0" style={{ opacity: contentOpacity }}>
                      {/* CANVAS WITH FALLING MAN INSIDE */}
                      <Canvas gl={{ antialias: true, alpha: true }}>
                          <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={50} />
                          <ambientLight intensity={1.2} />
                          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                          <directionalLight position={[-5, 3, -5]} intensity={0.8} />
                          <spotLight position={[0, 10, 10]} intensity={2} angle={0.6} penumbra={1} />
                          
                          <Suspense fallback={null}>
                              <FallingMan scrollProgress={easedIp} />
                              <Scene scrollProgress={easedIp} />
                          </Suspense>
                      </Canvas>
                  </div>
                  
                  <div className="absolute bottom-12 left-12 z-30 pointer-events-none">
                      <h2 className="font-serif-display text-black text-6xl leading-none">
                          Take the Leap.
                      </h2>
                      <div 
                          className="overflow-hidden"
                          style={{ 
                              maxHeight: easedIp > 0.15 ? '200px' : '0px',
                              opacity: Math.max(0, (easedIp - 0.15) * 2),
                              marginTop: easedIp > 0.15 ? '1rem' : '0',
                              transition: 'all 0.5s'
                          }}
                      >
                          <p className="text-gray-700 max-w-md text-lg">
                              Your journey from zero to one starts here.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </section>
  );
}

// --- SPONSOR COMPONENT ---
function SponsorFooter() {
  return (
    <div className="absolute bottom-0 w-full z-40 pb-24 pt-32 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-end text-center">
        <div className="flex flex-col items-center md:items-center gap-3">
          <p className="text-gray-200 text-[10px] uppercase tracking-[0.2em] font-sans opacity-70">Presents</p>
          <div className="flex items-center gap-6 transition-all duration-500 cursor-pointer">
            <div className="flex items-center gap-2">
               <div className="w-4 h-4 border-[1.5px] border-white transform rotate-45"></div>
               <span className="text-white font-serif text-base tracking-widest">WESTBRIDGE</span>
            </div>
            <span className="text-white font-sans font-bold text-lg tracking-tighter">stripe</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-gray-200 text-[10px] uppercase tracking-[0.2em] font-sans opacity-70">Co-Presents</p>
          <div className="flex items-center gap-6 transition-all duration-500 cursor-pointer">
             <div className="flex items-center gap-2">
               <div className="w-5 h-5 rounded-full bg-[#280071] border border-white/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0.5 w-1.5 h-3 bg-white rounded-full"></div>
               </div>
               <span className="text-white font-sans font-bold text-lg">SBI</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 mix-blend-screen"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mix-blend-screen"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mix-blend-screen"></div>
                </div>
                <span className="text-gray-200 font-sans font-medium text-sm">AdMob</span>
             </div>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-center gap-3">
          <p className="text-gray-200 text-[10px] uppercase tracking-[0.2em] font-sans opacity-70">In Association With</p>
          <div className="flex items-center gap-6 transition-all duration-500 cursor-pointer">
             <span className="text-red-500 font-bold italic text-lg font-serif">Campa</span>
             <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-600">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.13-1.25.89.89 0 0 1 .23-.28l2.69-3.1L8 14.39l4-11.24 4 11.24 3.86-4.63 2.69 3.1a.84.84 0 0 1-.13 1.25.89.89 0 0 1 .23.28z" />
                </svg>
                <span className="text-white font-sans font-bold text-base">GitLab</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =========================================
// MAIN PAGE COMPONENT
// =========================================
export default function Home() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScroll(Math.min(window.scrollY / window.innerHeight, 1));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    
    <div className="bg-[#050505] text-white w-full min-h-screen font-sans selection:bg-green-400 selection:text-black">
      
      {/* Global Styles */}
      <style jsx global>{`
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: clip; 
            background-color: #050505;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-text {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>

      {/* ================= HERO SECTION ================= */}
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen w-full flex flex-col justify-center overflow-hidden">
        
        {/* --- BACKGROUND LAYER --- */}
        {/* We use absolute positioning here to take it out of the flex flow */}
        <div className="absolute inset-0 z-0"> 
            <Prism 
               scale={4} 
               colorFrequency={1.5}
               noise={0}
            />
     </div>

        {/* --- NAV BAR (z-50 stays on top) --- */}
        <nav className="absolute top-0 w-full flex items-center justify-between p-8 z-50 text-gray-400 text-sm font-sans tracking-wide">
          <div>
            <span className="text-white font-bold">MES 2026</span><br />
            Manipal Entrepreneurship Summit
          </div>
          <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
            <span>Investment</span>
            <span>Incubation</span>
            <span>Innovation</span>
          </div>
          <div>
            <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
              Login
            </button>
          </div>
        </nav>

        {/* --- HERO CONTENT (z-10 ensures it sits above the prism) --- */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 flex items-center justify-center">
            
            {/* Left Text */}
            <h1 className="font-serif-display italic text-6xl md:text-8xl lg:text-[10rem] leading-none text-white mix-blend-difference flex-1 text-right pr-12 md:pr-24">
              MES
            </h1>
            
            {/* --- CANVAS 1: HERO MODEL (Static Greeting Man) --- */}
            <div className="w-[200px] h-[200px] md:w-[450px] md:h-[450px] relative shrink-0 z-20">
                <Canvas gl={{ antialias: true, alpha: true }}>
                    <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} near={0.1} />
                    
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 15, 10]} intensity={3} color="white" />
                    <spotLight position={[-5, 5, -10]} intensity={5} color="#22c55e" />
                    <spotLight position={[5, 0, -10]} intensity={5} color="#ef4444" />
                    <Environment preset="city" />

                    <Suspense fallback={null}>
                        <HeroBusinessman />
                        <Candlestick position={[-2.5, 1, 1]} color="#22c55e" height={1.2} />
                        <Candlestick position={[2.5, -1, -1]} color="#ef4444" height={0.8} />
                        <Candlestick position={[2, 1.5, 0]} color="#22c55e" height={0.5} />
                        <Candlestick position={[-2, -1.5, 0]} color="#ef4444" height={1.5} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Right Text */}
            <h1 className="font-serif-display text-6xl md:text-8xl lg:text-[10rem] leading-none text-white mix-blend-difference flex-1 text-left pl-12 md:pl-24">
              2026
            </h1>
        </div>
        
        <SponsorFooter/>

      </section>

      {/* ================= 2. EXPANDING SECTION ================= */}
      <ExpandingSection />

      {/* ================= 3. TUNNEL SECTION ================= */}
      <section className="relative z-30 w-full">
        <Tunnel />
      </section>

      {/* ================= 4. HIGHLIGHTS ================= */}
      <section className="relative z-30 px-6 md:px-16 py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif-display italic mb-16 text-center text-white">
            <span className="text-green-500 not-italic font-sans font-bold">02.</span> Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item, i) => (
              <div key={i} className="h-[400px] bg-neutral-900 border border-neutral-800 rounded-sm relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
                  <div className="absolute bottom-6 left-6 p-4">
                      <h3 className="text-xl font-bold">Event Highlight {item}</h3>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-30 border-t border-white/10 px-6 md:px-16 py-20 bg-[#050505]">
         <div className="text-center md:text-left">
            <h3 className="font-bold text-2xl">MES 2026</h3>
            <p className="text-gray-500 text-sm mt-2">© 2026 Manipal Entrepreneurship Summit</p>
         </div>
      </footer>

    </div>
  );
}