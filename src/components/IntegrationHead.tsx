"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import "./IntegrationHead.css";

/**
 * A section head on Ada's "experiences that give your customers [video]
 * life back": a large centred headline with a picture set into the line
 * and its last words in italic, then a short paragraph. In place of Ada's
 * rounded video, the logos of the tools the Loat works in take turns in
 * the line, one every 1.6 seconds, each fading in from nothing (small and
 * blurred) and out again, starting when the head comes into view. With
 * reduced motion it holds the first logo.
 */

const LOGOS = [
  { src: "/logos/tools/gmail.png", alt: "Gmail" },
  { src: "/logos/tools/slack.svg", alt: "Slack" },
  { src: "/logos/tools/google-sheets.png", alt: "Google Sheets" },
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/tools/google-drive.png", alt: "Google Drive" },
  { src: "/logos/tools/google-calendar.png", alt: "Google Calendar" },
  { src: "/logos/tools/google-docs.png", alt: "Google Docs" },
  { src: "/logos/claude.svg", alt: "Claude" },
];

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function IntegrationHead() {
  /* -1 until the head comes into view, so even the first logo fades in
     from nothing */
  const [i, setI] = useState(-1);
  const head = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setI(0); return; }
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(t);
      if (!e.isIntersecting) return;
      setI((n) => (n < 0 ? 0 : n));
      t = window.setInterval(() => setI((n) => (n + 1) % LOGOS.length), 1600);
    }, { threshold: 0.3 });
    if (head.current) io.observe(head.current);
    return () => { window.clearInterval(t); io.disconnect(); };
  }, []);
  return (
    <motion.header
      ref={head}
      className="ih"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <h2 className="ih-title">
        Your finance Loat works in the tools{" "}
        <span className="ih-tile" role="img" aria-label="Gmail, Slack, Google Sheets, Stripe, Google Drive, Calendar, Docs and Claude">
          {LOGOS.map((l, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={l.alt} src={l.src} alt="" className={k === i ? "is-on" : i >= 0 && k === (i + LOGOS.length - 1) % LOGOS.length ? "is-out" : undefined} />
          ))}
        </span>{" "}
        <em>you already use</em>
      </h2>
      <p className="ih-body">
        Sona reads your mail, your Slack, your sheets and the vendors you pay, so every approval and every budget comes with the facts, without moving your team to a new tool.
      </p>
    </motion.header>
  );
}
