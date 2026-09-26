"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const TorusCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL not supported, falling back gracefully:', e);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 650;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    // Soft warm ambient glow matching reference GIF
    const ambientLight = new THREE.AmbientLight(0xffeedb, 2.4);
    scene.add(ambientLight);

    // Directional Key Light (Warm Sunset Amber)
    const keyLight = new THREE.DirectionalLight(0xffb074, 3.2);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    // Fill Light (Luminous Peach)
    const fillLight = new THREE.DirectionalLight(0xff733b, 2.2);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    // Rim / Edge Glow Light (Radiant Coral)
    const rimLight = new THREE.PointLight(0xff501a, 4.0, 15);
    rimLight.position.set(0, 4, -2);
    scene.add(rimLight);

    // Torus Ring Geometry & Material
    // Grand, imposing scale for the 75-85vh cinematic viewport
    const geometry = new THREE.TorusGeometry(2.4, 0.76, 64, 160);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x94384e, // Warm dusty rose-maroon matching reference GIF
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.95,
      clearcoatRoughness: 0.12,
      reflectivity: 0.85,
    });

    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // Mouse movement listener for subtle 3D parallax tilt
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.4;
      mouseRef.current.targetY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || 650;

      camera.aspect = newWidth / newHeight;
      // Adjust camera distance to keep torus grandly framed across screen sizes
      if (newWidth < 640) {
        camera.position.z = 10.5;
      } else if (newWidth < 1024) {
        camera.position.z = 9.2;
      } else {
        camera.position.z = 8.2;
      }
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Continuous 60FPS Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Continuous 3D tumbling rotation matching reference GIF
      torus.rotation.x += delta * 0.45;
      torus.rotation.y += delta * 0.65;
      torus.rotation.z += delta * 0.2;

      // Smooth lerp mouse parallax tilt
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      torus.position.x = mouseRef.current.x;
      torus.position.y = mouseRef.current.y;

      renderer?.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      material.dispose();
      renderer?.dispose();

      if (renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    />
  );
};
