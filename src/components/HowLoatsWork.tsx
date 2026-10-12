"use client";

import { useEffect, useRef, useState } from "react";
import BrickMorph from "./BrickMorph";
import { geist, mono } from "./monoFont";
import s from "./HowLoatsWork.module.css";

/**
 * How Loats work: Connect and Ask on the left feed the workspace, Delegate
 * and Approve on the right are where the Loat acts. Each card is wired to
 * a brick in a 17 by 17 grid around the Workloat tile, and a spark runs
 * along each wire (in on the left, out on the right). Ported from the
 * "Workloat · How Loats work" design. The grid is seeded, so the server
 * and the browser draw the same one. The typewriter and the tile run only
 * on screen; with reduced motion everything holds still.
 */

/* ---- the brick grid: 17 x 17, mirrored four ways ---- */
const N = 17;
const H = 8;
const ENDS: [number, number][] = [[6, 0], [6, 16], [11, 0], [11, 16]]; // Connect, Delegate, Ask, Approve

type Cell = { kind: string; pulse: boolean; delay: string };
const GRID: Cell[] = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const quad: string[][] = [];
  for (let r = 0; r <= H; r++) {
    quad.push([]);
    for (let c = 0; c <= H; c++) {
      const x = rnd();
      quad[r].push(x < 0.4 ? "b" : x < 0.66 ? "d" : "");
    }
  }
  const kind = (r: number, c: number) => {
    const qr = r > H ? N - 1 - r : r, qc = c > H ? N - 1 - c : c;
    const dr = Math.abs(r - H), dc = Math.abs(c - H), dist = Math.hypot(dr, dc);
    if (ENDS.some(([er, ec]) => er === r && ec === c)) return "b end";
    if (dist < 2.9) return ""; // room for the tile and its glow
    if (dist < 4.2) return (dr + dc) % 2 ? "" : "d"; // a quiet dotted ring
    return quad[qr][qc];
  };
  const out: Cell[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const k = kind(r, c);
    let pulse = false, delay = "0s";
    if (k === "b" && rnd() < 0.3) {
      pulse = true;
      // a slow wave that rolls in from the edges toward the centre
      const edge = Math.max(Math.abs(r - H), Math.abs(c - H));
      delay = ((H - edge) * 0.35 + rnd() * 0.6).toFixed(2) + "s";
    }
    out.push({ kind: k, pulse, delay });
  }
  return out;
})();

const LINES: [string, string][] = [
  ["Alfred", " schedule a technical screen with Priya next week and send me the invite to approve."],
  ["Alfred", " summarize this contract and flag anything that renews automatically."],
  ["Alfred", " email every candidate who hasn't replied in three days."],
  ["Sona", " how much of the marketing budget is left this month?"],
];

/* the connected tools: the label under the tile, the product's full
   name, and its logo (trimmed to its own edges, in public/logos/tools) */
const APPS: { label: string; name: string; src: string; ground?: boolean }[] = [
  { label: "Files", name: "Files on macOS", src: "/logos/tools/macos-files.png" },
  { label: "Gmail", name: "Gmail", src: "/logos/tools/gmail.png" },
  /* the Slack mark comes on its own white square, so it takes rounded corners */
  { label: "Slack", name: "Slack", src: "/logos/tools/slack.png", ground: true },
  { label: "Drive", name: "Google Drive", src: "/logos/tools/google-drive.png" },
  { label: "Docs", name: "Google Docs", src: "/logos/tools/google-docs.png" },
  { label: "Sheets", name: "Google Sheets", src: "/logos/tools/google-sheets.png" },
];

/* bare: the four cards alone, without the heading, the workspace or the
   wires, for the product tour's tab (HeroTabs) */
export default function HowLoatsWork({ bare = false }: { bare?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const wires = useRef<SVGSVGElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const [tile, setTile] = useState(73);
  const [typed, setTyped] = useState<{ i: number; n: number; caret: boolean }>({ i: 0, n: LINES[0][1].length, caret: false });

  /* the tile follows the grid's size; the wires are redrawn with it */
  useEffect(() => {
    const P = panel.current, G = grid.current, W = wires.current;
    if (bare || !P || !G || !W) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NS = "http://www.w3.org/2000/svg";
    const layout = () => {
      // the section's scale: 0.7 on desktop, 1 where the cards stack
      const k = Number(getComputedStyle(P).getPropertyValue("--k")) || 1;
      setTile(Math.round(Math.max(72 * k, Math.min(108 * k, (G.getBoundingClientRect().width / (P.getBoundingClientRect().width / P.offsetWidth || 1) / N) * 3.1))));
      W.replaceChildren();
      if (getComputedStyle(W).display === "none") return;
      const PR = P.getBoundingClientRect();
      // under a CSS zoom (the product tour scales the panel) the rects come
      // back zoomed while the wires draw in the panel's own units
      const z = PR.width / P.offsetWidth || 1;
      cards.current.forEach((card, i) => {
        if (!card) return;
        const left = i === 0 || i === 2;
        const lower = i >= 2;
        const [er, ec] = ENDS[i];
        const cell = G.children[er * N + ec] as HTMLElement | undefined;
        if (!cell) return;
        const C = card.getBoundingClientRect(), B = cell.getBoundingClientRect();
        const sx = ((left ? C.right : C.left) - PR.left) / z;
        const sy = (C.top - PR.top + C.height * (lower ? 0.62 : 0.4)) / z;
        const inset = B.width * 0.11;
        const bx = ((left ? B.left + inset : B.right - inset) - PR.left) / z;
        const by = (B.top + B.height / 2 - PR.top) / z;
        const mx = sx + (bx - sx) * 0.42;
        const dir = by > sy ? 1 : -1, hx = left ? 1 : -1;
        const rad = Math.min(14, Math.abs(by - sy) / 2, Math.abs(mx - sx) / 2);
        const d = `M${sx} ${sy} H${mx - hx * rad} Q${mx} ${sy} ${mx} ${sy + dir * rad} V${by - dir * rad} Q${mx} ${by} ${mx + hx * rad} ${by} H${bx}`;
        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", d);
        path.id = `how-wire-${i}`;
        W.appendChild(path);
        const port = document.createElementNS(NS, "circle");
        port.setAttribute("class", "port");
        port.setAttribute("cx", String(sx));
        port.setAttribute("cy", String(sy));
        port.setAttribute("r", "3");
        W.appendChild(port);
        if (reduce) return;
        // left cards feed the workspace; right cards are where the Loat acts
        const spark = document.createElementNS(NS, "circle");
        spark.setAttribute("class", "spark");
        spark.setAttribute("r", "3.5");
        const anim = document.createElementNS(NS, "animateMotion");
        anim.setAttribute("dur", "3.2s");
        anim.setAttribute("repeatCount", "indefinite");
        anim.setAttribute("begin", `${i * 0.8}s`);
        anim.setAttribute("keyPoints", left ? "0;1" : "1;0");
        anim.setAttribute("keyTimes", "0;1");
        anim.setAttribute("calcMode", "linear");
        const mp = document.createElementNS(NS, "mpath");
        mp.setAttribute("href", `#how-wire-${i}`);
        anim.appendChild(mp);
        spark.appendChild(anim);
        W.appendChild(spark);
      });
    };
    const ro = new ResizeObserver(layout);
    ro.observe(P);
    document.fonts?.ready.then(layout);
    return () => ro.disconnect();
  }, [bare]);

  /* the Delegate card's typewriter: types a request, holds it, erases it
     quickly, and moves to the next, only while the section is on screen */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, visible = false, running = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const play = async () => {
      if (running) return;
      running = true;
      let i = 0;
      while (alive && visible) {
        const text = LINES[i][1];
        for (let k = 0; k <= text.length && alive; k++) { setTyped({ i, n: k, caret: true }); await wait(28 + Math.random() * 30); }
        await wait(1800);
        for (let k = text.length; k >= 0 && alive; k -= 3) { setTyped({ i, n: k, caret: true }); await wait(12); }
        await wait(250);
        i = (i + 1) % LINES.length;
      }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); }, { threshold: 0.1 });
    if (panel.current) io.observe(panel.current);
    return () => { alive = false; io.disconnect(); };
  }, []);

  const [who, line] = LINES[typed.i];
  const card = (i: number) => (el: HTMLElement | null) => { cards.current[i] = el; };

  return (
    <section
      id={bare ? undefined : "how-loats-work"}
      className={`${s.how} ${bare ? s.bare : ""} ${geist.className}`}
      aria-labelledby={bare ? undefined : "how-title"}
      aria-label={bare ? "How Loats work" : undefined}
    >
      {!bare && (
        <header className={s.head}>
          <p className={`${s.eyebrow} ${mono.className}`}>How Loats work</p>
          <h2 className={s.title} id="how-title">
            A team of AI workers <span>plugged into everything you use.</span>
          </h2>
        </header>
      )}

      <div className={s.panel} ref={panel}>
        <article ref={card(0)} className={`${s.card} ${s.c1}`}>
          <div>
            <h3 className={s.cardTitle}>Connect</h3>
            <p className={s.cardText}>Bring your files, mail and chats. Your Loats read every attachment whole.</p>
          </div>
          <div className={s.cardBody}>
            <ul className={s.apps} aria-label="Connected tools">
              {APPS.map((app) => (
                <li key={app.label} className={s.app} title={app.name}>
                  <span className={s.appTile}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.src} alt={app.name} className={`${s.appLogo} ${app.ground ? s.appLogoGround : ""}`} />
                  </span>
                  <span className={`${s.appLabel} ${mono.className}`} aria-hidden>{app.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article ref={card(2)} className={`${s.card} ${s.c2}`}>
          <div>
            <h3 className={s.cardTitle}>Ask</h3>
            <p className={s.cardText}>Ask your Loat anything about your work. It answers once, with evidence.</p>
          </div>
          <div className={`${s.cardBody} ${s.bleed}`}>
            <p className={s.askBubble}><b>@Alfred</b> who replied to last week&apos;s interview invites?</p>
            <p className={`${s.askMeta} ${mono.className}`}>Alfred thought for 6s</p>
            <p className={s.askAnswer}>Priya and Daniel replied. Priya picked Tuesday at 2pm, and Daniel asked to move to next week.</p>
          </div>
        </article>

        <article ref={card(1)} className={`${s.card} ${s.c3}`}>
          <div>
            <h3 className={s.cardTitle}>Delegate</h3>
            <p className={s.cardText}>Tell your Loat what to do. It runs the task on autopilot, by chat or by email.</p>
          </div>
          <div className={s.cardBody}>
            <div className={s.composer}>
              <p className={s.composerText} aria-label={`@${LINES[0][0]}${LINES[0][1]}`}>
                <span className={s.mention}>@{who}</span>
                {line.slice(0, typed.n)}
                {typed.caret && <span className={s.caret} />}
              </p>
              <span className={s.send} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
          </div>
        </article>

        <article ref={card(3)} className={`${s.card} ${s.c4}`}>
          <div>
            <h3 className={s.cardTitle}>Approve</h3>
            <p className={s.cardText}>Nothing leaves without you. Approve in the app, or reply YES to your Loat&apos;s email.</p>
          </div>
          <div className={`${s.cardBody} ${s.bleed} ${s.mailcard}`}>
            <p className={`${s.mailTag} ${mono.className}`}>Email draft</p>
            <p className={s.mailRow}>To <b>Priya</b></p>
            <p className={s.mailRow}>Subject <b>Technical screen next Tuesday</b></p>
            <p className={s.mailBody}>Hi Priya, thanks for picking a time. You&apos;re confirmed for Tuesday at 2pm, and a calendar invite with a Meet link is on its way.</p>
            <div className={s.mailActions} aria-hidden>
              <span className={`${s.btn} ${s.btnDark}`}>Approve and send</span>
              <span className={`${s.btn} ${s.btnGhost}`}>Edit</span>
            </div>
          </div>
        </article>

        {!bare && <div className={s.core}>
          <div className={s.grid} ref={grid} aria-hidden>
            {GRID.map((c, i) => (
              <div
                key={i}
                className={[s.cell, ...c.kind.split(" ").filter(Boolean).map((k) => s[k]), c.pulse ? s.pulse : ""].join(" ")}
                style={c.pulse ? ({ "--delay": c.delay } as React.CSSProperties) : undefined}
              />
            ))}
          </div>
          <div className={s.glow} aria-hidden />
          <div className={s.tile} style={{ "--tile": `${tile}px` } as React.CSSProperties}>
            <BrickMorph size={tile} fill={0.62} theme="dark" />
          </div>
        </div>}

        {!bare && <svg className={s.wires} ref={wires} aria-hidden />}
        {!bare && <span className={`${s.label} ${mono.className}`}>Your workspace</span>}
      </div>
    </section>
  );
}
