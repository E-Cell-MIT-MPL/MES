import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Move the dummy outside to prevent memory allocation every frame
const dummy = new THREE.Object3D();

function DollarRain() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const [isMobile, setIsMobile] = useState(false);

  // Optimized Asset Loading via Cloudinary
  const texture = useLoader(THREE.TextureLoader, 'https://res.cloudinary.com/dfzmbjjnz/image/upload/v1769942246/image-from-rawpixel-id-7572664-png_mijieh.png');

  useEffect(() => {
    const checkMobile = () => {
      // Direct check for mobile width
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- PERFORMANCE TUNING ---
  // PC: 250 bills | Mobile: 60 bills
  // This is the biggest factor in stopping the mobile lag.
  const count = isMobile ? 60 : 250;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        t: Math.random() * 100,
        speed: 0.05 + Math.random() * 0.1,
        xFactor: -2 + Math.random() * 4, 
        zFactor: -5 + Math.random() * 10, 
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      const particle = particles[i];
      particle.t += particle.speed;
      
      const y = 25 - (particle.t % 45); 
      
      dummy.position.set(particle.xFactor, y, particle.zFactor);
      
      // Rotations can be expensive; keeping it simple for the GPU
      dummy.rotation.set(particle.t * 0.8, particle.t * 0.4, particle.t * 0.2);
      dummy.scale.set(1.2, 0.5, 1); 
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      // Ensure the instance count is dynamic based on device
      args={[undefined as any, undefined as any, count]}
      frustumCulled={false} 
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        transparent={true}
        depthWrite={false} 
        // alphaTest ensures the mobile GPU doesn't waste cycles on transparent pixels
        alphaTest={0.5}
      />
    </instancedMesh>
  );
}

export default DollarRain;