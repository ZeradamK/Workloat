"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { mono, roboto } from "./monoFont";
import { Explorer, Handoff } from "./FinanceSplits";
import { Record } from "./FinanceRows";
import { Launch } from "./EnterpriseFlow";
import { Phone } from "./FinanceHero";
import "./AuthScenes.css";

/**
 * The sign up page's right panel: five scenes from the site's own sections,
 * one at a time, each fading in over the last on its own ground, with a
 * short caption at its foot. The designs are the sections' own components
 * (FinanceSplits, FinanceRows, EnterpriseFlow, FinanceHero), drawn on their
 * fixed canvases and scaled to fit the panel; only the captions are new.
 *
 *   1. Sona asks before she pays, with the evidence (FinanceSplits).
 *   2. Every budget by team, and her warning (FinanceSplits).
 *   3. Sona in the chat (EnterpriseFlow, Launch).
 *   4. Sona by text (FinanceHero, the phone).
 *   5. A live record for a vendor (FinanceRows).
 *
 * A new scene every 4 seconds: each pops up (rising from 94% and 18px low)
 * and fades in over 2 seconds while the last fades out. With reduced motion
 * it rests on the first.
 * The panel only shows on large screens (the page hides it below 900px).
 */

type Scene = { key: string; w: number; h: number; ground: string; dark?: boolean; cap: [string, string]; draw: () => React.ReactNode };

const SCENES: Scene[] = [
  {
    key: "approve", w: 770, h: 725, ground: "as-g--paper",
    cap: ["Every approval comes with the evidence.", "Sona, your finance Loat"],
    draw: () => <div className="fs as-fs"><Handoff /></div>,
  },
  {
    key: "budgets", w: 770, h: 725, ground: "as-g--paper",
    cap: ["Every budget, tracked as you spend.", "By team, in Workloat"],
    draw: () => <div className="fs as-fs"><Explorer /></div>,
  },
  {
    key: "chat", w: 528, h: 607, ground: "as-g--video", dark: true,
    cap: ["Ask in the app, and the answer comes back with the facts.", "Sona in the Workloat app"],
    draw: () => <div className="ef-pic is-run as-ef"><Launch run /></div>,
  },
  {
    key: "text", w: 470, h: 930, ground: "as-g--sky", dark: true,
    cap: ["Approve from your phone with one reply.", "Sona by text"],
    draw: () => <div className="as-fh"><Phone layout="mobile" /></div>,
  },
  {
    key: "record", w: 640, h: 660, ground: "as-g--deep",
    cap: ["A live record for every vendor.", "Charges, contracts and approvals in one place"],
    draw: () => <Record />,
  },
];

/* a scene holds for 4 seconds, its arrival taking 2 of them */
const STEP = 4000;

export default function AuthScenes() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setAt((n) => (n + 1) % SCENES.length), STEP);
    return () => window.clearInterval(id);
  }, []);
  const s = SCENES[at];
  return (
    <div
      className={`as${s.dark ? " as--dark" : ""}`}
      style={{ "--fs-mono": mono.style.fontFamily, "--fr-mono": mono.style.fontFamily, "--ef-mono": mono.style.fontFamily, "--fh-roboto": roboto.style.fontFamily } as React.CSSProperties}
      aria-hidden
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={s.key}
          className={`as-scene ${s.ground}`}
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, transition: { duration: 1.2, ease: [0.4, 0, 0.6, 1] } }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Fit w={s.w} h={s.h}>{s.draw()}</Fit>
          <p className="as-cap">
            <span>{s.cap[0]}</span>
            <span>{s.cap[1]}</span>
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="as-dots">
        {SCENES.map((x, i) => <i key={x.key} className={i === at ? "is-on" : undefined} />)}
      </div>
    </div>
  );
}

/* a scene's canvas, scaled to fit the panel above its caption, centred */
function Fit({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [f, setF] = useState({ z: 0, x: 0, y: 0 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight;
      const z = Math.min(W / w, H / h) * 0.88;
      setF({ z, x: (W - w * z) / 2, y: (H - h * z) / 2 });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div ref={box} className="as-fit">
      <div className="as-canvas" style={{ width: w, height: h, transform: `translate(${f.x}px, ${f.y}px) scale(${f.z})`, opacity: f.z ? 1 : 0 }}>
        {children}
      </div>
    </div>
  );
}
