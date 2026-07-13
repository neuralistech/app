import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LinearSRGBColorSpace,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';
import { throttle } from '~/utils/throttle';
import { cleanRenderer, cleanScene } from '~/utils/three';
import styles from './displacement-sphere.module.css';

// Scene constants
const PARTICLE_COUNT  = 180;
const MAX_CONNECTIONS = 900;
const CONNECT_DIST    = 58;   // scene units
const REPEL_RADIUS    = 48;
const REPEL_STRENGTH  = 16;

// Theme palettes — Neuralis blue spectrum
const PALETTE = {
  dark: {
    colorA:          new Color(0x1e7aed),  // electric blue
    colorB:          new Color(0x60c8ff),  // bright cyan
    lineColor:       new Color(0x2288dd),
    particleOpacity: 0.80,
    lineOpacity:     0.24,
    particleSize:    1.9,
  },
  light: {
    colorA:          new Color(0x0a52c9),  // deep blue
    colorB:          new Color(0x1e7aed),  // Neuralis blue
    lineColor:       new Color(0x1060c0),
    particleOpacity: 0.55,
    lineOpacity:     0.16,
    particleSize:    1.6,
  },
};

export const DisplacementSphere = props => {
  const { theme } = useTheme();
  const canvasRef    = useRef();
  const renderer     = useRef();
  const camera       = useRef();
  const scene        = useRef();
  const pGeo         = useRef();   // particle geometry
  const lGeo         = useRef();   // line geometry
  const pMat         = useRef();   // particle material
  const lMat         = useRef();   // line material
  const homePos      = useRef();   // Float32Array — resting positions
  const phases       = useRef();   // Float32Array — per-particle phase offset
  const mouse        = useRef({ x: 0, y: 0 });
  const startTime    = useRef(Date.now());
  const reduceMotion = useReducedMotion();
  const isInViewport = useInViewport(canvasRef);
  const windowSize   = useWindowSize();

  // ── Init WebGL scene ──────────────────────────────────────────────────────
  useEffect(() => {
    const { innerWidth, innerHeight } = window;

    renderer.current = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });
    renderer.current.setSize(innerWidth, innerHeight);
    renderer.current.setPixelRatio(1);
    renderer.current.outputColorSpace = LinearSRGBColorSpace;

    camera.current = new PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 200);
    camera.current.position.z = 52;

    scene.current = new Scene();

    // -- Allocate particle buffers --
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const home      = new Float32Array(PARTICLE_COUNT * 3);
    const phase     = new Float32Array(PARTICLE_COUNT);
    const palDark   = PALETTE.dark;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      // Distribute across the visible frustum at z ≈ 0
      const x = (Math.random() - 0.5) * 170;
      const y = (Math.random() - 0.5) * 110;
      const z = (Math.random() - 0.3) * 45;

      positions[ix]     = home[ix]     = x;
      positions[ix + 1] = home[ix + 1] = y;
      positions[ix + 2] = home[ix + 2] = z;

      phase[i] = Math.random() * Math.PI * 2;

      // Blend colorA / colorB by random factor
      const t   = Math.random();
      const col = t < 0.55 ? palDark.colorA : palDark.colorB;
      colors[ix]     = col.r;
      colors[ix + 1] = col.g;
      colors[ix + 2] = col.b;
    }

    homePos.current = home;
    phases.current  = phase;

    // -- Particle Points --
    pGeo.current = new BufferGeometry();
    pGeo.current.setAttribute('position', new Float32BufferAttribute(positions, 3));
    pGeo.current.setAttribute('color',    new Float32BufferAttribute(colors, 3));

    pMat.current = new PointsMaterial({
      size:         palDark.particleSize,
      vertexColors: true,
      transparent:  true,
      opacity:      palDark.particleOpacity,
      blending:     AdditiveBlending,
      depthWrite:   false,
      sizeAttenuation: true,
    });

    const points = new Points(pGeo.current, pMat.current);
    scene.current.add(points);

    // -- Connection LineSegments (pre-allocated) --
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
    lGeo.current = new BufferGeometry();
    lGeo.current.setAttribute('position', new Float32BufferAttribute(linePositions, 3));
    lGeo.current.setDrawRange(0, 0);

    lMat.current = new LineBasicMaterial({
      color:       palDark.lineColor,
      transparent: true,
      opacity:     palDark.lineOpacity,
      blending:    AdditiveBlending,
      depthWrite:  false,
    });

    const lineSegs = new LineSegments(lGeo.current, lMat.current);
    scene.current.add(lineSegs);

    return () => {
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
    };
  }, []);

  // ── Update colors when theme changes ─────────────────────────────────────
  useEffect(() => {
    if (!pGeo.current || !pMat.current || !lMat.current) return;
    const pal = PALETTE[theme] ?? PALETTE.dark;

    const colors = pGeo.current.attributes.color.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t   = (phases.current[i] / (Math.PI * 2));
      const col = t < 0.55 ? pal.colorA : pal.colorB;
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    pGeo.current.attributes.color.needsUpdate = true;

    pMat.current.opacity     = pal.particleOpacity;
    pMat.current.size        = pal.particleSize;
    lMat.current.color.copy(pal.lineColor);
    lMat.current.opacity     = pal.lineOpacity;

    if (reduceMotion) {
      renderer.current.render(scene.current, camera.current);
    }
  }, [theme, reduceMotion]);

  // ── Resize handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const { width, height } = windowSize;
    const adjHeight = height + height * 0.3;
    renderer.current.setSize(width, adjHeight);
    camera.current.aspect = width / adjHeight;
    camera.current.updateProjectionMatrix();

    if (reduceMotion) {
      renderer.current.render(scene.current, camera.current);
    }
  }, [reduceMotion, windowSize]);

  // ── Mouse → scene-space coordinates ──────────────────────────────────────
  useEffect(() => {
    const onMouseMove = throttle(event => {
      mouse.current = {
        x:  ((event.clientX / window.innerWidth)  * 2 - 1) * 85,
        y: -((event.clientY / window.innerHeight) * 2 - 1) * 55,
      };
    }, 30);

    if (!reduceMotion && isInViewport) {
      window.addEventListener('mousemove', onMouseMove);
    }
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isInViewport, reduceMotion]);

  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    let raf;
    let frame = 0;

    const animate = () => {
      raf   = requestAnimationFrame(animate);
      frame++;

      const t   = (Date.now() - startTime.current) * 0.001;
      const pos = pGeo.current.attributes.position;
      const pa  = pos.array;
      const hp  = homePos.current;
      const ph  = phases.current;
      const mx  = mouse.current.x;
      const my  = mouse.current.y;

      // Update particle positions: drift + mouse repulsion
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const p  = ph[i];

        let x = hp[ix]     + Math.sin(t * 0.22 + p)        * 3.8;
        let y = hp[ix + 1] + Math.cos(t * 0.18 + p * 1.35) * 2.8;
        const z = hp[ix + 2] + Math.sin(t * 0.14 + p * 0.8)  * 1.5;

        const dx = x - mx;
        const dy = y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < REPEL_RADIUS * REPEL_RADIUS && d2 > 0.01) {
          const d     = Math.sqrt(d2);
          const force = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH;
          x += (dx / d) * force;
          y += (dy / d) * force;
        }

        pa[ix]     = x;
        pa[ix + 1] = y;
        pa[ix + 2] = z;
      }
      pos.needsUpdate = true;

      // Rebuild connection lines every 2 frames (halves GPU upload cost)
      if (frame % 2 === 0) {
        const lp = lGeo.current.attributes.position.array;
        let lc   = 0;

        for (let i = 0; i < PARTICLE_COUNT - 1 && lc < MAX_CONNECTIONS; i++) {
          const ix = i * 3;
          for (let j = i + 1; j < PARTICLE_COUNT && lc < MAX_CONNECTIONS; j++) {
            const jx = j * 3;
            const dx = pa[ix] - pa[jx];
            const dy = pa[ix + 1] - pa[jx + 1];
            const dz = pa[ix + 2] - pa[jx + 2];
            if (dx * dx + dy * dy + dz * dz < CONNECT_DIST * CONNECT_DIST) {
              const li     = lc * 6;
              lp[li]       = pa[ix];     lp[li + 1] = pa[ix + 1]; lp[li + 2] = pa[ix + 2];
              lp[li + 3]   = pa[jx];     lp[li + 4] = pa[jx + 1]; lp[li + 5] = pa[jx + 2];
              lc++;
            }
          }
        }

        lGeo.current.setDrawRange(0, lc * 2);
        lGeo.current.attributes.position.needsUpdate = true;
      }

      renderer.current.render(scene.current, camera.current);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      renderer.current.render(scene.current, camera.current);
    }

    return () => cancelAnimationFrame(raf);
  }, [isInViewport, reduceMotion]);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => (
        <canvas
          aria-hidden
          className={styles.canvas}
          data-visible={visible}
          ref={nodeRef}
          {...props}
        />
      )}
    </Transition>
  );
};
