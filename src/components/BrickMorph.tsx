"use client";

import { useEffect, useRef } from "react";

/**
 * The brick tile: identical square bricks that walk from letter to letter
 * and spell WORKLOAT, ported from the "Workloat sign up button" design.
 * Each move is the minimum total travel (Hungarian assignment) from one
 * letter's cells to the next; every brick is a whole number of device
 * pixels and edges are interpolated in snapped pixel space, so bricks
 * moving together share an exact edge every frame. Pauses off screen;
 * with reduced motion it steps between letters without sliding.
 */

const FONT: Record<string, string[]> = {
  W: ["###.....###", "###.....###", "###.....###", "###.....###", ".##.###.##.", ".##.###.##.", ".#########.", ".#########.", "..###.###..", "..###.###.."],
  O: ["#########", "#########", "#########", "###...###", "###...###", "###...###", "###...###", "#########", "#########", "#########"],
  R: ["########.", "########.", "########.", "###..###.", "###..###.", "########.", "#######..", "#########", "###..####", "###...###"],
  K: ["###...###", "###...###", "###..###.", "###..###.", "######...", "######...", "###..###.", "###..###.", "###...###", "###...###"],
  L: ["###......", "###......", "###......", "###......", "###......", "###......", "###......", "#########", "#########", "#########"],
  A: ["########.", "########.", "########.", "###..###.", "###..###.", "########.", "#########", "#########", "###...###", "###...###"],
  T: ["#########", "#########", "#########", "...###...", "...###...", "...###...", "...###...", "...###...", "...###...", "...###..."],
};
const TEXT = "WORKLOAT";
const GRID = 11; // widest letter, in units
const ROWS = 10;
const THEMES = { dark: ["#000000", "#ffffff"], light: ["#eeeeee", "#1e1e1e"] } as const;
const T = { intro: 700, introStagger: 30, hold: 650, move: 700 };

type Cell = { c: number; r: number };

const LETTERS: Cell[][] = [...TEXT].map((ch) => {
  const g = FONT[ch];
  const off = (GRID - g[0].length) / 2;
  const cells: Cell[] = [];
  g.forEach((row, r) => [...row].forEach((v, c) => { if (v === "#") cells.push({ c: c + off, r }); }));
  return cells;
});
const N = Math.max(...LETTERS.map((l) => l.length));

/** minimum total travel of N bricks onto a letter's cells; spare bricks sit on their nearest cell */
function assign(from: Cell[], cells: Cell[]): Cell[] {
  const n = from.length, k = cells.length;
  const d = (a: Cell, b: Cell) => (a.c - b.c) ** 2 + (a.r - b.r) ** 2;
  const cost = from.map((p) => {
    const row = cells.map((q) => d(p, q));
    const near = Math.min(...row);
    for (let j = k; j < n; j++) row.push(near);
    return row;
  });
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const target: Cell[] = Array(n);
  for (let j = 1; j <= n; j++) {
    const i = p[j] - 1;
    if (j - 1 < k) target[i] = cells[j - 1];
    else {
      let best = cells[0], bd = Infinity;
      for (const q of cells) { const dd = d(from[i], q); if (dd < bd) { bd = dd; best = q; } }
      target[i] = best;
    }
  }
  return target.map((q) => ({ c: q.c, r: q.r }));
}

export default function BrickMorph({ size = 44, fill = 0.78, theme = "dark" }: { size?: number; fill?: number; theme?: keyof typeof THEMES }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.height = Math.round(size * dpr);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [bg, ink] = THEMES[theme];

    const first = LETTERS[0];
    let pos: Cell[] = Array.from({ length: N }, (_, i) => ({ ...first[i % first.length] }));
    let from = pos.map((x) => ({ ...x }));
    let to = pos;
    let index = 0;
    let phase: "intro" | "hold" | "move" = reduced ? "hold" : "intro";
    let phaseStart = performance.now();
    let raf = 0, running = false;

    const ease = (q: number) => (q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2);

    const step = (now: number) => {
      const el = now - phaseStart;
      if (phase === "intro") {
        if (el >= T.intro + GRID * T.introStagger) { phase = "hold"; phaseStart = now; }
      } else if (phase === "hold") {
        if (el >= (reduced ? 1600 : T.hold)) {
          const next = (index + 1) % LETTERS.length;
          if (reduced) { index = next; pos = assign(pos, LETTERS[next]); phaseStart = now; return; }
          from = pos.map((x) => ({ ...x }));
          to = assign(from, LETTERS[next]);
          index = next;
          phase = "move";
          phaseStart = now;
        }
      } else if (el >= T.move) {
        pos = to.map((x) => ({ ...x }));
        phase = "hold";
        phaseStart = now;
      }
    };

    const draw = (now: number) => {
      const S = canvas.width;
      // a whole device-pixel unit, so every brick is identical even in a tiny tile
      const unit = Math.max(1, Math.floor((S * fill) / GRID));
      const ox = Math.round((S - GRID * unit) / 2), oy = Math.round((S - ROWS * unit) / 2);
      const X = (c: number) => ox + Math.round(c * unit);
      const Y = (r: number) => oy + Math.round(r * unit);
      const lerp = (a: number, b: number, e: number) => Math.round(a + (b - a) * e);
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = ink;
      const el = now - phaseStart;
      const q = phase === "move" ? ease(Math.min(1, el / T.move)) : 1;
      for (let i = 0; i < N; i++) {
        let x0: number, x1: number, y0: number, y1: number, a = 1;
        if (phase === "move") {
          const f = from[i], t = to[i];
          x0 = lerp(X(f.c), X(t.c), q); x1 = lerp(X(f.c + 1), X(t.c + 1), q);
          y0 = lerp(Y(f.r), Y(t.r), q); y1 = lerp(Y(f.r + 1), Y(t.r + 1), q);
        } else {
          const { c, r } = pos[i];
          x0 = X(c); x1 = X(c + 1); y0 = Y(r); y1 = Y(r + 1);
          if (phase === "intro") a = Math.min(1, Math.max(0, (el - c * T.introStagger) / T.intro));
        }
        ctx.globalAlpha = a;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => { step(now); draw(now); raf = requestAnimationFrame(frame); };
    const start = () => { if (running) return; running = true; phaseStart = performance.now(); raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    draw(performance.now());
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    return () => { stop(); io.disconnect(); };
  }, [size, fill, theme]);

  return <canvas ref={ref} aria-hidden style={{ width: size, height: size, display: "block" }} />;
}
