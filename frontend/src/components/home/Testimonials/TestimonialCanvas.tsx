"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TestimonialCanvasProps {
  activeIndex: number;
}

export const TestimonialCanvas: React.FC<TestimonialCanvasProps> = ({ activeIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const gleamProgressRef = useRef(0);
  const prevIndexRef = useRef(activeIndex);

  // Trigger light gleam sweep whenever activeIndex changes
  useEffect(() => {
    if (prevIndexRef.current !== activeIndex) {
      gleamProgressRef.current = 1.0;
      prevIndexRef.current = activeIndex;
    }
  }, [activeIndex]);

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
      console.warn('WebGL not supported for TestimonialCanvas:', e);
      return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    // Group to hold all 3D glass slabs
    const slabsGroup = new THREE.Group();
    scene.add(slabsGroup);

    // Helper to generate a 2D rounded rectangle shape
    const createRoundedRectShape = (w: number, h: number, r: number) => {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -h / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + h - r);
      shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      shape.lineTo(x + r, y + h);
      shape.quadraticCurveTo(x, y + h, x, y + h - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);
      return shape;
    };

    // Check dark mode
    const isDark = document.documentElement.classList.contains('dark');

    // Create 3D Beveled Glass Material with physical transmission and specular reflections
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isDark ? 0x1f2937 : 0xffffff),
      metalness: 0.05,
      roughness: 0.12,
      transmission: 0.75, // Physical glass transparency
      thickness: 0.6,
      ior: 1.48, // Glass Index of Refraction
      reflectivity: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: isDark ? 0.65 : 0.82,
      depthWrite: false,
    });

    // Secondary subtle rim/edge material for enhanced bevel highlight
    const edgeHighlightMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isDark ? 0x38bdf8 : 0xe0f2fe),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.9,
    });

    // Bevel settings for smooth rounded edges
    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    // Staggered glass slab positions matching the reference design layout
    const slabConfigs = [
      // Top Center (above the avatar card)
      { w: 2.5, h: 1.7, r: 0.35, x: -1.0, y: 2.2, z: -0.3, rotZ: 0 },
      // Top Right (wide card behind the quote side)
      { w: 3.2, h: 2.1, r: 0.38, x: 2.2, y: 2.0, z: -0.6, rotZ: 0 },
      // Middle Right (wide rounded card next to avatar)
      { w: 3.6, h: 2.5, r: 0.42, x: 2.5, y: -0.4, z: -0.2, rotZ: 0 },
      // Bottom Center (directly below the avatar card)
      { w: 2.6, h: 1.9, r: 0.35, x: -1.0, y: -2.4, z: -0.4, rotZ: 0 },
      // Bottom Right (lower wide card)
      { w: 3.2, h: 2.1, r: 0.38, x: 2.2, y: -2.6, z: -0.7, rotZ: 0 },
      // Far Left (subtle cut off card)
      { w: 1.8, h: 2.2, r: 0.32, x: -3.5, y: 0.8, z: -0.9, rotZ: 0 },
    ];

    const slabMeshes: THREE.Mesh[] = [];

    slabConfigs.forEach((cfg) => {
      const shape = createRoundedRectShape(cfg.w, cfg.h, cfg.r);
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();

      const mesh = new THREE.Mesh(geometry, glassMaterial);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.z = cfg.rotZ;
      slabsGroup.add(mesh);
      slabMeshes.push(mesh);
    });

    // --- Dynamic Studio Lighting for Glass Refraction & Bevel Glints ---
    // 1. Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.0 : 1.4);
    scene.add(ambientLight);

    // 2. Crisp Key Light (creates razor-sharp reflections on beveled edges)
    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.5 : 3.0);
    keyLight.position.set(-3, 4, 6);
    scene.add(keyLight);

    // 3. Subtle Sky/Cyan Backlight (accentuates the ambient blue aesthetic)
    const blueAccentLight = new THREE.PointLight(0x38bdf8, 3.5, 14);
    blueAccentLight.position.set(-1.2, 0, 2);
    scene.add(blueAccentLight);

    // 4. Moving Gleam Light (sweeps across on testimonial switch)
    const gleamLight = new THREE.PointLight(0xffffff, 0, 16);
    gleamLight.position.set(-5, 0, 3);
    scene.add(gleamLight);

    // Mouse Parallax Event Listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || 500;
      const newHeight = container.clientHeight || 450;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation (spring feel)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      // Subtle 3D tilt of the glass slabs group
      slabsGroup.rotation.y = mouseRef.current.x * 0.12;
      slabsGroup.rotation.x = -mouseRef.current.y * 0.1;

      // Slight individual breathing float on each slab
      slabMeshes.forEach((mesh, idx) => {
        mesh.position.y = slabConfigs[idx].y + Math.sin(elapsedTime * 0.8 + idx * 1.2) * 0.04;
      });

      // Dynamically move key light with mouse to cast changing specular reflections across bevels
      keyLight.position.x = -3 + mouseRef.current.x * 2.5;
      keyLight.position.y = 4 + mouseRef.current.y * 2.0;

      // Handle slide-switch gleam sweep across glass slabs
      if (gleamProgressRef.current > 0.01) {
        gleamProgressRef.current *= 0.94;
        const sweepX = (1.0 - gleamProgressRef.current) * 10 - 5;
        gleamLight.position.set(sweepX, mouseRef.current.y * 2, 2.5);
        gleamLight.intensity = Math.sin((1.0 - gleamProgressRef.current) * Math.PI) * 4.5;
      } else {
        gleamProgressRef.current = 0;
        gleamLight.intensity = 0;
      }

      renderer?.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      slabMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
      });
      glassMaterial.dispose();
      edgeHighlightMaterial.dispose();
      renderer?.dispose();

      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-visible"
      aria-hidden="true"
    />
  );
};
