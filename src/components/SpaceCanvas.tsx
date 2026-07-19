import { useEffect, useRef } from "react";

/**
 * SpaceCanvas — minimal space background.
 * Stars with mouse parallax + slowly drifting geometric stones (polygons).
 */

type Star = { x: number; y: number; z: number; r: number; tw: number; twSpeed: number };
type Stone = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  sides: number;
  rot: number; vr: number;
  depth: number; // parallax depth
  points: { r: number; a: number }[]; // irregular polygon radii
  hue: number;
  alpha: number;
};

export function SpaceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const isSmall = window.innerWidth < 1024;
    const interactive = !isTouch && !isSmall;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0;
    const stars: Star[] = [];
    const stones: Stone[] = [];

    let mx = 0, my = 0, px = 0, py = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 50;
      my = (e.clientY / window.innerHeight - 0.5) * 50;
    };
    if (interactive) window.addEventListener("mousemove", onMove, { passive: true });

    const counts = isSmall
      ? { stars: 160, stones: 18 }
      : { stars: 550, stones: 38 };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const makeStone = (): Stone => {
      const sides = 5 + Math.floor(Math.random() * 3); // 5-7
      const size = rand(isSmall ? 10 : 14, isSmall ? 22 : 34);
      const points: { r: number; a: number }[] = [];
      for (let i = 0; i < sides; i++) {
        points.push({
          r: size * rand(0.75, 1.1),
          a: (i / sides) * Math.PI * 2 + rand(-0.15, 0.15),
        });
      }
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-0.12, 0.12),
        vy: rand(-0.08, 0.08),
        size,
        sides,
        rot: Math.random() * Math.PI * 2,
        vr: rand(-0.003, 0.003),
        depth: rand(0.3, 1),
        points,
        hue: 210 + rand(-15, 25),
        alpha: rand(0.25, 0.55),
      };
    };

    const seed = () => {
      stars.length = 0;
      for (let i = 0; i < counts.stars; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: rand(0.25, 1),
          r: rand(0.3, 1.4),
          tw: Math.random() * Math.PI * 2,
          twSpeed: rand(0.006, 0.02),
        });
      }
      stones.length = 0;
      for (let i = 0; i < counts.stones; i++) stones.push(makeStone());
    };

    resize();
    seed();
    const onResize = () => { resize(); seed(); };
    window.addEventListener("resize", onResize);

    const drawStar = (s: Star, ox: number, oy: number) => {
      s.tw += s.twSpeed;
      const a = (0.35 + Math.sin(s.tw) * 0.35) * s.z + 0.15;
      const depth = Math.pow(s.z, 1.6);
      ctx.fillStyle = `rgba(220, 232, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x + ox * depth, s.y + oy * depth, s.r * s.z, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawStone = (s: Stone, ox: number, oy: number) => {
      const cx = s.x + ox * s.depth;
      const cy = s.y + oy * s.depth;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(s.rot);

      ctx.beginPath();
      s.points.forEach((p, i) => {
        const x = Math.cos(p.a) * p.r;
        const y = Math.sin(p.a) * p.r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      // subtle fill
      ctx.fillStyle = `hsla(${s.hue}, 40%, 22%, ${s.alpha * 0.5})`;
      ctx.fill();

      // crisp outline
      ctx.strokeStyle = `hsla(${s.hue}, 60%, 75%, ${s.alpha})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.restore();
    };

    let raf = 0;
    const loop = () => {
      if (interactive) { px += (mx - px) * 0.05; py += (my - py) * 0.05; }
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) drawStar(s, px, py);

      for (const s of stones) {
        s.x += s.vx; s.y += s.vy; s.rot += s.vr;
        if (s.x < -60) s.x = w + 60;
        if (s.x > w + 60) s.x = -60;
        if (s.y < -60) s.y = h + 60;
        if (s.y > h + 60) s.y = -60;
        drawStone(s, px, py);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (interactive) window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      aria-hidden
    />
  );
}
