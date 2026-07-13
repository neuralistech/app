import { useEffect, useRef } from 'react';
import styles from './error-tech-animation.module.css';

const CHANNELS = [
  { yRatio: 0.28, amp: 0.07, freq: 1.3, phase: 0.0,  speed: 0.9, width: 1.5, alpha: 0.55 },
  { yRatio: 0.50, amp: 0.11, freq: 0.8, phase: 1.1,  speed: 1.1, width: 2.0, alpha: 0.90 },
  { yRatio: 0.72, amp: 0.05, freq: 1.8, phase: 2.4,  speed: 0.7, width: 1.5, alpha: 0.55 },
];

const HEX_COUNT = 14;

export function ErrorTechAnimation({ flatlined = false }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf;
    const start = Date.now();

    // Accent color depends on the flatlined CSS override injected by error.jsx
    const accent      = flatlined ? '#e84040' : '#1e7aed';
    const accentDim   = flatlined ? 'rgba(232,64,64,0.18)'  : 'rgba(30,122,237,0.18)';
    const accentFaint = flatlined ? 'rgba(232,64,64,0.045)' : 'rgba(30,122,237,0.045)';

    // Pre-allocate hex fragments
    const hexItems = Array.from({ length: HEX_COUNT }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      val:   Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0'),
      speed: 0.00006 + Math.random() * 0.00014,
      alpha: 0.08 + Math.random() * 0.18,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    function drawFrame() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const t = (Date.now() - start) * 0.001;

      ctx.clearRect(0, 0, w, h);

      // ── Background ───────────────────────────────────────────────────────
      ctx.fillStyle = 'rgba(5, 7, 14, 0.97)';
      ctx.fillRect(0, 0, w, h);

      // ── Dot grid ─────────────────────────────────────────────────────────
      const step = 26;
      ctx.fillStyle = accentFaint;
      for (let gx = step; gx < w; gx += step) {
        for (let gy = step; gy < h; gy += step) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Corner brackets ───────────────────────────────────────────────────
      const bLen = 28, bW = 2, mg = 18;
      ctx.strokeStyle = accent;
      ctx.lineWidth   = bW;
      ctx.globalAlpha = 0.65;
      for (const [cx, cy, dx, dy] of [
        [mg, mg, 1, 1], [w - mg, mg, -1, 1],
        [mg, h - mg, 1, -1], [w - mg, h - mg, -1, -1],
      ]) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dy * bLen);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + dx * bLen, cy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Signal channels ───────────────────────────────────────────────────
      CHANNELS.forEach((ch, idx) => {
        const cy = h * ch.yRatio;

        // Flatline: each channel flattens sequentially
        const flatDelay  = idx * 0.6;
        const elapsed    = flatlined ? Math.max(0, t - flatDelay) : 0;
        const flatFactor = Math.min(1, elapsed * 0.35);
        const amp        = h * ch.amp * (1 - flatFactor);

        // Baseline
        ctx.beginPath();
        ctx.strokeStyle = accentDim;
        ctx.lineWidth   = 1;
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.stroke();

        // Waveform
        ctx.beginPath();
        ctx.strokeStyle = accent;
        ctx.lineWidth   = ch.width;
        ctx.globalAlpha = ch.alpha;

        // Occasional glitch offset after flatline
        const glitch = (flatFactor > 0.7 && flatlined)
          ? Math.sin(t * 28 + idx * 4) * (1 - flatFactor) * 10
          : 0;

        ctx.moveTo(0, cy + glitch);
        for (let px = 0; px <= w; px += 2) {
          const wave = Math.sin((px / w) * ch.freq * Math.PI * 8 + t * ch.speed + ch.phase);
          ctx.lineTo(px, cy + wave * amp + glitch);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // ── Scanline sweep ────────────────────────────────────────────────────
      const scanY = (t * 75) % h;
      const scan  = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scan.addColorStop(0,   'transparent');
      scan.addColorStop(0.5, accentFaint);
      scan.addColorStop(1,   'transparent');
      ctx.fillStyle = scan;
      ctx.fillRect(0, scanY - 40, w, 80);

      // ── Floating hex values ───────────────────────────────────────────────
      ctx.font      = '11px "Courier New", monospace';
      ctx.fillStyle = accent;
      for (const item of hexItems) {
        item.y = (item.y + item.speed) % 1.05;
        ctx.globalAlpha = item.alpha;
        ctx.fillText(`0x${item.val}`, item.x * (w - 70), item.y * h);
      }
      ctx.globalAlpha = 1;

      // ── Status badge ──────────────────────────────────────────────────────
      const label   = flatlined ? 'SIGNAL LOST' : 'ERROR 404';
      const pulse   = 0.45 + Math.sin(t * 2.2) * 0.35;
      ctx.globalAlpha = pulse;
      ctx.fillStyle   = accent;
      ctx.font        = 'bold 10px "Courier New", monospace';
      ctx.fillText(label, w - label.length * 6.5 - 18, h - 22);
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(drawFrame);
    }

    drawFrame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [flatlined]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
