"use client";

import { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- MATERIAL FIXER ---
function fixMaterials(scene: THREE.Object3D) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      const name = mesh.name.toLowerCase();
      if (name.includes("sphere") || name.includes("circle") || name.includes("shape")) {
          mesh.visible = false;
          return;
      }

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.side = THREE.DoubleSide;
        mat.transparent = false;
        mat.opacity = 1;
      }
    }
  });
}


// --- FALLING MAN COMPONENT (Deep Dive Fix) ---
