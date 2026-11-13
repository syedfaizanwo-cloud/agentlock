'use client';

import React, { useEffect, useRef, useState, Component, ReactNode } from 'react';
import * as THREE from 'three';

export interface WaveGridBackgroundProps {
  colorBase?: string;
  colorHigh?: string;
  autoAnimate?: boolean;
  waveAmplitude?: number;
  waveSpeed?: number;
  gridSize?: number;
  className?: string;
}

// Hoisted allocations outside render loop
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _baseColor = new THREE.Color();
const _highColor = new THREE.Color();
const _raycaster = new THREE.Raycaster();
const _pointerPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersectionPoint = new THREE.Vector3();

// Client-side error boundary with silent fallback to flat navy background
export class WaveGridErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Graceful error capture without console pollution
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="fixed inset-0 z-0 pointer-events-none bg-[#060D1F]"
            aria-hidden="true"
          />
        )
      );
    }
    return this.props.children;
  }
}

export default function WaveGridBackground({
  colorBase = '#22407A',
  colorHigh = '#FF6F59',
  autoAnimate = true,
  waveAmplitude = 0.5,
  waveSpeed = 1.0,
  gridSize = 36,
  className = '',
}: WaveGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Live mutable props ref so scene is NEVER rebuilt when props change
  const propsRef = useRef({
    colorBase,
    colorHigh,
    autoAnimate,
    waveAmplitude,
    waveSpeed,
  });

  useEffect(() => {
    propsRef.current = {
      colorBase,
      colorHigh,
      autoAnimate,
      waveAmplitude,
      waveSpeed,
    };
  }, [colorBase, colorHigh, autoAnimate, waveAmplitude, waveSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Detect device capabilities & reduce density for narrow screens and low-concurrency devices
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isLowConcurrency = (navigator.hardwareConcurrency || 4) <= 4;
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
    const isLowPower = isCoarse || isLowConcurrency || isNarrow;

    const effectiveGridSize = isLowPower ? Math.min(gridSize, 28) : gridSize;
    const maxPixelRatio = isLowPower ? 1.5 : Math.min(window.devicePixelRatio || 1, 2);

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let instancedMesh: THREE.InstancedMesh | null = null;
    let geometry: THREE.BoxGeometry | null = null;
    let material: THREE.MeshStandardMaterial | null = null;
    let animFrameId: number | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isLowPower,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(maxPixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 22, 28);
      camera.lookAt(0, -2, 0);

      // Lighting tuned so cubes read as mid navy and peaks as coral
      const ambientLight = new THREE.AmbientLight(0x0a1633, 1.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffeedd, 2.0);
      directionalLight.position.set(15, 30, 20);
      scene.add(directionalLight);

      const coralPointLight = new THREE.PointLight(0xff6f59, 3.5, 40);
      coralPointLight.position.set(0, 10, 0);
      scene.add(coralPointLight);

      // Instanced Grid of Cubes
      const countX = effectiveGridSize;
      const countZ = effectiveGridSize;
      const totalCount = countX * countZ;
      const cubeSize = 0.85;
      const spacing = 1.15;
      const offsetX = ((countX - 1) * spacing) / 2;
      const offsetZ = ((countZ - 1) * spacing) / 2;

      geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      material = new THREE.MeshStandardMaterial({
        roughness: 0.35,
        metalness: 0.25,
      });

      instancedMesh = new THREE.InstancedMesh(geometry, material, totalCount);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      // Initialize positions and colors
      _baseColor.set(propsRef.current.colorBase);
      for (let i = 0; i < totalCount; i++) {
        const ix = i % countX;
        const iz = Math.floor(i / countX);
        const x = ix * spacing - offsetX;
        const z = iz * spacing - offsetZ;

        _dummy.position.set(x, 0, z);
        _dummy.scale.set(1, 1, 1);
        _dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, _dummy.matrix);
        instancedMesh.setColorAt(i, _baseColor);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
      scene.add(instancedMesh);
    } catch {
      // Graceful fallback to flat navy background without console error
      return;
    }

    // Pointer state on window
    let pointerX = -9999;
    let pointerZ = -9999;
    let targetPointerX = -9999;
    let targetPointerZ = -9999;
    let isPointerOver = false;

    const handlePointerMove = (e: MouseEvent) => {
      if (!canvas || !camera) return;
      const rect = canvas.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      const hit = _raycaster.ray.intersectPlane(_pointerPlane, _intersectionPoint);
      if (hit) {
        targetPointerX = _intersectionPoint.x;
        targetPointerZ = _intersectionPoint.z;
        isPointerOver = true;
      }
    };

    const handlePointerLeave = () => {
      isPointerOver = false;
      targetPointerX = -9999;
      targetPointerZ = -9999;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    // Resize handling
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(maxPixelRatio);
    };
    window.addEventListener('resize', handleResize);

    // Tab visibility handling
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !prefersReducedMotion) {
        lastTime = performance.now();
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Static frame for prefers-reduced-motion
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
      setIsReady(true);
      if (typeof window !== 'undefined') {
        (window as any).__AGENTLOCK_WAVE_READY__ = true;
        window.dispatchEvent(new CustomEvent('agentlock-wave-ready'));
      }
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseleave', handlePointerLeave);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (instancedMesh && scene) scene.remove(instancedMesh);
        if (renderer) renderer.dispose();
      };
    }

    // Main render loop
    let lastTime = performance.now();
    let simTime = 0;
    let hasRenderedFirstFrame = false;

    const tick = () => {
      if (!isTabVisible || !renderer || !scene || !camera || !instancedMesh) return;

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const {
        autoAnimate: doAuto,
        waveAmplitude: amp,
        waveSpeed: spd,
        colorBase: currentBase,
        colorHigh: currentHigh,
      } = propsRef.current;

      simTime += delta * spd;

      // Smooth pointer lerp
      if (isPointerOver) {
        pointerX += (targetPointerX - pointerX) * 0.12;
        pointerZ += (targetPointerZ - pointerZ) * 0.12;
      } else {
        pointerX += (-9999 - pointerX) * 0.05;
        pointerZ += (-9999 - pointerZ) * 0.05;
      }

      _baseColor.set(currentBase);
      _highColor.set(currentHigh);

      const countX = effectiveGridSize;
      const countZ = effectiveGridSize;
      const totalCount = countX * countZ;
      const spacing = 1.15;
      const offsetX = ((countX - 1) * spacing) / 2;
      const offsetZ = ((countZ - 1) * spacing) / 2;

      for (let i = 0; i < totalCount; i++) {
        const ix = i % countX;
        const iz = Math.floor(i / countX);
        const x = ix * spacing - offsetX;
        const z = iz * spacing - offsetZ;

        // Wave heights
        let h = 0;
        if (doAuto) {
          const distFromCenter = Math.sqrt(x * x + z * z);
          h += Math.sin(distFromCenter * 0.45 - simTime * 1.8) * 1.1;
          h += Math.sin(x * 0.35 + simTime * 1.2) * 0.6;
          h += Math.cos(z * 0.35 + simTime * 1.4) * 0.6;
        } else {
          // Calm subtle ambient motion for lower sections
          h += Math.sin(x * 0.2 + simTime * 0.6) * 0.35;
          h += Math.cos(z * 0.2 + simTime * 0.7) * 0.35;
        }

        // Pointer ripple
        const dx = x - pointerX;
        const dz = z - pointerZ;
        const pointerDist = Math.sqrt(dx * dx + dz * dz);
        if (pointerDist < 10) {
          const factor = Math.max(0, 1 - pointerDist / 10);
          h += Math.sin(pointerDist * 1.2 - simTime * 4.0) * factor * 2.8;
        }

        const finalH = h * amp;

        // Position & Scale
        _dummy.position.set(x, finalH * 0.7, z);
        _dummy.rotation.x = finalH * 0.05;
        _dummy.rotation.z = -finalH * 0.05;
        const scaleY = Math.max(0.2, 1 + finalH * 0.5);
        _dummy.scale.set(1, scaleY, 1);
        _dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, _dummy.matrix);

        // Color interpolation: higher peaks turn to coral
        const colorT = Math.min(Math.max((finalH + 1.2) / 3.0, 0), 1);
        _color.copy(_baseColor).lerp(_highColor, colorT);
        instancedMesh.setColorAt(i, _color);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      renderer.render(scene, camera);

      if (!hasRenderedFirstFrame) {
        hasRenderedFirstFrame = true;
        setIsReady(true);
        if (typeof window !== 'undefined') {
          (window as any).__AGENTLOCK_WAVE_READY__ = true;
          window.dispatchEvent(new CustomEvent('agentlock-wave-ready'));
        }
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (instancedMesh && scene) scene.remove(instancedMesh);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [gridSize]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-[400ms] ease-out ${
        isReady ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      aria-hidden="true"
      style={{ backgroundColor: '#060D1F' }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        tabIndex={-1}
        className="w-full h-full block pointer-events-none"
        style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}
      />
    </div>
  );
}
