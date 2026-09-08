"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * Travel act (Cosmos know-what-you're-looking-at anatomy): headline left,
 * auto-cycling photo card center (Instagram zoom-blur transitions, pinned
 * spend bar in the standard notification anatomy), caption right.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const TRAVEL_SLIDES = [
  { src: "/travel/t1.jpg", place: "Mountain trip", note: "Day total", amount: "$86.00" },
  { src: "/travel/t2.jpg", place: "Barcelona", note: "Budget left", amount: "$412.00" },
  { src: "/travel/t3.jpg", place: "Rome", note: "Spent today", amount: "$95.00" },
  { src: "/travel/t4.jpg", place: "New York", note: "Trip so far", amount: "$1,240.00" },
  { src: "/travel/t5.jpg", place: "Paris", note: "Museum tickets", amount: "$60.00" },
  { src: "/travel/t6.jpg", place: "Paris", note: "Trip total", amount: "$2,150.00" },
];

export default function TravelSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[clamp(72px,9vw,150px)]">
      <div className="grid items-center gap-10 min-[900px]:grid-cols-[1fr_auto_1fr]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center text-[clamp(34px,3.8vw,56px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink min-[900px]:text-right"
        >
          Travel anywhere.
          <br />
          Budget everything.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
          className="justify-self-center"
        >
          <Parallax amount={45}>
            <TravelCarousel />
          </Parallax>
        </motion.div>
        <p className="max-w-[250px] text-[17px] leading-[1.5] text-ink max-[899px]:mx-auto max-[899px]:text-center">
          Payloat tracks your trip spending as it happens, so the budget makes
          it home with you.
        </p>
      </div>
    </section>
  );
}

/* Vertical auto-carousel: stops crossfade with the Instagram zoom-blur
   (incoming sharpens out of a frost, outgoing dissolves into one). */
function TravelCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = window.setInterval(
      () => setIdx((v) => (v + 1) % TRAVEL_SLIDES.length),
      2800,
    );
    return () => window.clearInterval(t);
  }, []);
  const s = TRAVEL_SLIDES[idx];
  return (
    <div className="relative aspect-[5/8] w-[min(340px,88vw)] overflow-hidden rounded-[32px] bg-[#eeeeee] min-[900px]:w-[444px]">
      <AnimatePresence initial={false}>
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.08, filter: "blur(16px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(16px)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.6, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={s.src}
            alt={s.place}
            fill
            sizes="444px"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      {/* the stop's charge, standard bar anatomy, concentric with the box
          (32 outer − 15 inset ≈ 18 bar; tile 11 + 6 pad ≈ 18) */}
      <motion.div
        key={idx}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="absolute bottom-[15px] left-[15px] right-[15px] z-10 flex items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-2.5"
      >
        <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-[#eeeeee]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold text-ink">
            {s.place}
          </span>
          <span className="block text-[13px] leading-snug text-sub">
            {s.note}
          </span>
        </span>
        <span className="text-[17px] font-semibold tracking-[-0.43px] text-ink">
          {s.amount}
        </span>
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="m6 3.5 5 4.5-5 4.5"
            stroke="#b3b1ac"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      {/* preload the next stop at the exact rendered geometry, so the
          optimizer serves the same variant the visible slide will use */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
      >
        <Image
          src={TRAVEL_SLIDES[(idx + 1) % TRAVEL_SLIDES.length].src}
          alt=""
          fill
          sizes="444px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

/* Scroll parallax, spring-smoothed like the home page scrubs. */
function Parallax({
  amount = 40,
  className,
  children,
}: {
  amount?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });
  const y = useTransform(smooth, [0, 1], [amount, -amount]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
