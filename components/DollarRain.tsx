import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const BILL_COUNT = 250;

function DollarRain() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const texture = useLoader(THREE.TextureLoader, '/images/image.png');

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < BILL_COUNT; i++) {
      temp.push({
        t: Math.random() * 100,
        speed: 0.05 + Math.random() * 0.1,
        // FIX: Tighten this range to restrict width
        // A range of -2 to 2 (total width of 4) keeps it strictly in the center
        xFactor: -2 + Math.random() * 4, 
        // Keeps bills safely behind the camera
        zFactor: -5 + Math.random() * 10, 
      });
    }
    return temp;
  }, []);

  const dummy = new THREE.Object3D();

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { speed, xFactor, zFactor } = particle;
      
      particle.t += speed;
      // Increased fall distance to ensure they don't pop out of existence too early
      const y = 25 - (particle.t % 45); 
      
      dummy.position.set(xFactor, y, zFactor);
      
      // Realistic fluttering
      dummy.rotation.set(particle.t * 0.8, particle.t * 0.4, particle.t * 0.2);
      dummy.scale.set(1.2, 0.5, 1); 
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[null!, null!, BILL_COUNT]}
      frustumCulled={false} 
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        transparent={true}
        depthWrite={false} 
      />
    </instancedMesh>
  );
}

export default DollarRain;