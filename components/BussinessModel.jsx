// components/HeroBusinessman.tsx

import React, { useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import DollarRain from './DollarRain' 

export function HeroBusinessman() {
  const group = useRef(null);

  // ✅ UPDATED: Using your Supabase URL
  const { scene, animations } = useGLTF("https://sscoxziuelqjhmamtuyq.supabase.co/storage/v1/object/public/mes/BusinessmanFinal.glb");
  
  const { actions } = useAnimations(animations, group);
  const [startRain] = useState(true);

  useEffect(() => {
    // Finds "greet", "Greeting", or anything containing "greet"
    const greetAction = actions["idle"] || 
                        // 👇 REMOVED ": any" HERE
                        Object.values(actions).find((a) => a.getClip().name.toLowerCase().includes("idle"));
    
    if (greetAction) {
      greetAction.reset().play();
    } else {
      console.log("Found animations:", Object.keys(actions)); 
    }
}, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} position={[0, -7.5, 0]} scale={500} />
      {startRain && <DollarRain />}
    </group>
  );
}

// ✅ UPDATED: Preloading your Supabase URL
useGLTF.preload("https://sscoxziuelqjhmamtuyq.supabase.co/storage/v1/object/public/mes/BusinessmanFinal.glb");