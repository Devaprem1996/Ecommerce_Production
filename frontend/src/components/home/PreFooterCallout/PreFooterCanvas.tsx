"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const PreFooterCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL not supported for PreFooterCanvas:', e);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    // --- 1. Floating 3D Golden Honey & Morning Dew Droplets ---
    const dropCount = 18;
    const dropGroup = new THREE.Group();
    scene.add(dropGroup);

    const dropGeometry = new THREE.SphereGeometry(0.35, 24, 24);
    // Scale slightly on Y to make a gentle droplet teardrop
    dropGeometry.scale(0.85, 1.25, 0.85);

    const honeyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf59e0b),
      emissive: new THREE.Color(0xd97706),
      emissiveIntensity: 0.15,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.85,
      thickness: 0.8,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.88,
    });

    const dewMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0.05,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.5,
      ior: 1.33,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.8,
    });

    const drops: {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedX: number;
      speedY: number;
      wobbleSpeed: number;
      scale: number;
    }[] = [];

    for (let i = 0; i < dropCount; i++) {
      const isHoney = i % 2 === 0;
      const mesh = new THREE.Mesh(dropGeometry, isHoney ? honeyMaterial : dewMaterial);
      const scale = Math.random() * 0.5 + 0.4;
      mesh.scale.set(scale, scale * 1.3, scale);

      const x = (Math.random() - 0.5) * 22;
      const y = (Math.random() - 0.5) * 12;
      const z = (Math.random() - 0.5) * 10 - 2;

      mesh.position.set(x, y, z);
      dropGroup.add(mesh);

      drops.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        speedX: (Math.random() - 0.5) * 0.006,
        speedY: Math.random() * 0.008 + 0.004,
        wobbleSpeed: Math.random() * 2 + 1,
        scale,
      });
    }

    // --- 2. 3D Floating Organic Botanical Leaves ---
    const leafCount = 12;
    const leafGroup = new THREE.Group();
    scene.add(leafGroup);

    // Create realistic 3D leaf contour
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, -0.6);
    leafShape.quadraticCurveTo(0.4, 0, 0, 0.8);
    leafShape.quadraticCurveTo(-0.4, 0, 0, -0.6);

    const leafExtrude = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    leafExtrude.center();

    const leafMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x34d399), // fresh emerald leaf
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });

    const leaves: {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
    }[] = [];

    for (let i = 0; i < leafCount; i++) {
      const mesh = new THREE.Mesh(leafExtrude, leafMaterial);
      const scale = Math.random() * 0.4 + 0.3;
      mesh.scale.set(scale, scale, scale);

      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 8 - 1;

      mesh.position.set(x, y, z);
      leafGroup.add(mesh);

      leaves.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        rotSpeedZ: (Math.random() - 0.5) * 0.015,
      });
    }

    // --- 3. Golden Sunbeam Pollen Dust Specks ---
    const pollenCount = 65;
    const pollenGeo = new THREE.BufferGeometry();
    const pollenPositions = new Float32Array(pollenCount * 3);
    const pollenSpeeds = new Float32Array(pollenCount * 3);

    for (let i = 0; i < pollenCount; i++) {
      pollenPositions[i * 3] = (Math.random() - 0.5) * 28;
      pollenPositions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pollenPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      pollenSpeeds[i * 3] = (Math.random() - 0.5) * 0.004;
      pollenSpeeds[i * 3 + 1] = Math.random() * 0.007 + 0.002;
      pollenSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(253, 224, 71, 1)');
      grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.7)');
      grad.addColorStop(0.8, 'rgba(245, 158, 11, 0.15)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      pCtx.fillStyle = grad;
      pCtx.beginPath();
      pCtx.arc(32, 32, 32, 0, Math.PI * 2);
      pCtx.fill();
    }
    const pollenTex = new THREE.CanvasTexture(pCanvas);

    const pollenMat = new THREE.PointsMaterial({
      size: 0.9,
      map: pollenTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.65,
    });

    const pollenPoints = new THREE.Points(pollenGeo, pollenMat);
    scene.add(pollenPoints);

    // --- Dynamic Studio Lights ---
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 3.2); // warm golden morning sun
    sunLight.position.set(5, 8, 8);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 2.5, 20); // sky reflection
    rimLight.position.set(-6, -2, 6);
    scene.add(rimLight);

    // Mouse Parallax Event
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 1.5;
      mouseRef.current.targetY = y * 1.0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Event
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 60FPS Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      camera.position.x = mouseRef.current.x * 1.2;
      camera.position.y = mouseRef.current.y * 0.8;
      camera.lookAt(0, 0, 0);

      // Animate honey & dew droplets
      drops.forEach((d) => {
        d.mesh.position.y += d.speedY;
        d.mesh.position.x += Math.sin(elapsed * d.wobbleSpeed + d.baseX) * 0.005;
        d.mesh.rotation.y = elapsed * 0.5;

        // Wrap droplets around
        if (d.mesh.position.y > 8) {
          d.mesh.position.y = -8;
          d.mesh.position.x = (Math.random() - 0.5) * 22;
        }
      });

      // Animate floating botanical leaves
      leaves.forEach((l) => {
        l.mesh.rotation.x += l.rotSpeedX;
        l.mesh.rotation.y += l.rotSpeedY;
        l.mesh.rotation.z += l.rotSpeedZ;
        l.mesh.position.y += Math.sin(elapsed + l.baseX) * 0.004;
        l.mesh.position.x += Math.cos(elapsed * 0.8 + l.baseY) * 0.004;
      });

      // Animate pollen particles upward drift
      const pArr = pollenGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < pollenCount; i++) {
        pArr[i * 3 + 1] += pollenSpeeds[i * 3 + 1];
        pArr[i * 3] += pollenSpeeds[i * 3];

        if (pArr[i * 3 + 1] > 9) {
          pArr[i * 3 + 1] = -9;
          pArr[i * 3] = (Math.random() - 0.5) * 28;
        }
      }
      pollenGeo.attributes.position.needsUpdate = true;

      renderer?.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      dropGeometry.dispose();
      honeyMaterial.dispose();
      dewMaterial.dispose();
      leafExtrude.dispose();
      leafMaterial.dispose();
      pollenGeo.dispose();
      pollenMat.dispose();
      pollenTex.dispose();
      renderer?.dispose();

      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-15 overflow-hidden"
      aria-hidden="true"
    />
  );
};
