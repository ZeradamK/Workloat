"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { mono } from "./monoFont";
import { NOTE_HTML } from "./hero-tabs.html";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./OwnYourLoats.css";

/**
 * The enterprise page's case for owning your Loats, on Zaro's cards: one
 * wide card (a picture left, the case right) and two cards below, each a
 * picture, a mono label, a title, a paragraph and a link.
 *
 *   1. Your model, your infrastructure: Loats run on the model the company
 *      prefers, on its own infrastructure, the tools it runs scattered on
 *      a ruled field round "Own your Loats."
 *   2. Your data stays home: nothing is sent to a model provider to train
 *      on; a pixel lock over "Nothing leaves your walls".
 *   3. Native to your stack: the Loats themselves, their pixel portraits
 *      on a dark ground.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const SONA = WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "";
const ALFRED = NOTE_HTML.match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? "";
const W_PATH = "M249 348H409V684H543V530H712V684H846V348H1006V517H939V800H873V901H699V708H556V901H382V800H316V517H249Z";

const rise = (d: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE, delay: d },
});

/* the tools on the featured card's ruled field: where each tile sits (%
   of the picture), its size in px, and what it holds */
const TILES: { x: number; y: number; w: number; h: number; src?: string; w2?: number; kind?: "w" }[] = [
  { x: 3, y: -4, w: 132, h: 104, kind: "w" },
  { x: 27, y: -2, w: 104, h: 92, src: "/logos/tools/gmail.png", w2: 44 },
  { x: 41, y: -6, w: 96, h: 86, src: "/logos/tools/google-sheets.png", w2: 36 },
  { x: 55, y: -8, w: 84, h: 74, src: "/logos/tools/google-docs.png", w2: 30 },
  { x: 74, y: -6, w: 132, h: 128, src: "/logos/claude.svg", w2: 58 },
  { x: 0, y: 54, w: 92, h: 110, src: "/logos/openai.svg", w2: 40 },
  { x: 86, y: 44, w: 110, h: 120, src: "/logos/aws-color.svg", w2: 58 },
  { x: 10, y: 80, w: 130, h: 110, src: "/logos/salesforce.png", w2: 76 },
  { x: 30, y: 84, w: 130, h: 100, src: "/logos/oracle-red.svg", w2: 82 },
  { x: 52, y: 82, w: 126, h: 110, src: "/logos/stripe.svg", w2: 54 },
  { x: 72, y: 78, w: 116, h: 120, src: "/logos/tools/slack.svg", w2: 52 },
];

/* `lead`: the cards open the page, so they leave room for the nav and
   rise in on load rather than on scroll */
export default function OwnYourLoats({ lead = false }: { lead?: boolean }) {
  return (
    <section className={`oy${lead ? " oy--lead" : ""}`} style={{ "--oy-mono": mono.style.fontFamily } as React.CSSProperties}>
      <motion.article className="oy-card oy-card--wide" {...(lead ? { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay: 0.05 } } : rise(0))}>
        <div className="oy-pic oy-pic--field" aria-hidden>
          <p className="oy-ghost">Own your<br />Loats.</p>
          {TILES.map((t, i) => (
            <span key={i} className="oy-tile" style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.w, height: t.h }}>
              <i className="oy-tick oy-tick--tl" /><i className="oy-tick oy-tick--tr" /><i className="oy-tick oy-tick--bl" /><i className="oy-tick oy-tick--br" />
              {t.kind === "w" ? (
                <span className="oy-wtile"><svg viewBox="249 348 757 553"><path fill="#fff" d={W_PATH} /></svg></span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.src} alt="" style={{ width: t.w2 }} />
              )}
            </span>
          ))}
        </div>
        <div className="oy-text">
          <p className="oy-label">Infrastructure <span>Enterprise</span></p>
          {lead ? (
            <h1 className="oy-title oy-title--lg">Run your Loats on the model you choose, on infrastructure you own.</h1>
          ) : (
            <h3 className="oy-title oy-title--lg">Run your Loats on the model you choose, on infrastructure you own.</h3>
          )}
          <p className="oy-body">
            Enterprises do not need to hand their business to a frontier lab to get a capable Loat. Workloat runs Loats on your own infrastructure, with the model you prefer, from a provider you already trust or one you host yourself.
          </p>
          <Foot />
        </div>
      </motion.article>

      <div className="oy-row">
        <motion.article className="oy-card" {...rise(0.08)}>
          <div className="oy-pic oy-pic--ghost" aria-hidden>
            <p className="oy-ghost oy-ghost--sm"><span>Nothing</span> <span>leaves</span> <span>your</span> <span>walls</span></p>
            <PixelLock />
          </div>
          <div className="oy-text">
            <p className="oy-label">Security <span>Data</span></p>
            <h3 className="oy-title">Your data stays inside your walls</h3>
            <p className="oy-body">
              Loats read your mail, documents and ledgers where they already live. Nothing is sent to a model provider to train on, and every action is written to a ledger your security team can audit.
            </p>
            <Foot />
          </div>
        </motion.article>

        <motion.article className="oy-card" {...rise(0.16)}>
          <div className="oy-pic oy-pic--dark" aria-hidden>
            <span className="oy-px" dangerouslySetInnerHTML={{ __html: SONA }} />
            <span className="oy-px" dangerouslySetInnerHTML={{ __html: ALFRED }} />
            <span className="oy-px oy-px--w"><svg viewBox="249 348 757 553"><path fill="#e9e2cf" d={W_PATH} /></svg></span>
          </div>
          <div className="oy-text">
            <p className="oy-label">Product <span>Integration</span></p>
            <h3 className="oy-title">Loats native to every layer of your stack</h3>
            <p className="oy-body">
              Each Loat is built into the systems you already run, your identity provider, your tools and your approvals, so it works like a colleague who has been there for years and answers only to you.
            </p>
            <Foot />
          </div>
        </motion.article>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <Link href="/contact#sales" className="oy-foot">
      <span>Workloat for enterprise · Book a demo</span>
      <svg viewBox="0 0 16 16" aria-hidden><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </Link>
  );
}

/* a lock drawn on a 14 x 16 pixel grid, in the blue of Zaro's folder */
const LOCK = [
  "....######....",
  "...##....##...",
  "..##......##..",
  "..##......##..",
  "..##......##..",
  "##############",
  "##############",
  "######..######",
  "#####....#####",
  "#####....#####",
  "######..######",
  "######..######",
  "##############",
  "##############",
];
function PixelLock() {
  return (
    <svg className="oy-lock" viewBox="0 0 14 14" shapeRendering="crispEdges">
      {LOCK.flatMap((row, y) => [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width=".84" height=".84" fill={y < 5 ? "#7cc4f0" : "#58b2ec"} /> : null)))}
    </svg>
  );
}
