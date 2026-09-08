"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import PurchaseTrackerCard from "@/components/tracker/PurchaseTrackerCard";

/**
 * Purchases page (Cash App fraud-page anatomy, user ref): a huge two-line
 * H1 top-left, then the Purchase Tracker card as the full-width hero media
 * in place of the reference's image (zoom-scaled so the iOS-true card
 * renders huge and stays proportionate at every viewport), then the small
 * supporting paragraph. Further sections arrive as designs are supplied.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

/* the card's design width; the hero scales it to the container */
const TRACKER_BASE_W = 560;

export default function PurchasesPage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[170px]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-[clamp(38px,6.2vw,84px)] font-medium leading-[1.04] tracking-[-3px] text-ink"
        >
          Every purchase accounted for,
          <br />
          from checkout to refund
        </motion.h1>

        {/* the hero media: the Purchase Tracker, huge */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          className="mt-10"
        >
          <HugeTracker />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.2 }}
          className="mt-6 max-w-[620px] text-[14px] leading-[1.55] text-sub"
        >
          From the moment a receipt lands to the day money comes back, every
          purchase is tracked in one place. Numbers shown are illustrative
          until the app ships.
        </motion.p>

        {/* ---- four-benefit card (Cash App anatomy: bordered surface,
                2x2 outline-icon rows) ---- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mt-[clamp(72px,9vw,140px)] rounded-[32px] border border-solid border-black/10 bg-white px-8 py-14 min-[900px]:px-20 min-[900px]:py-24"
        >
          <div className="grid gap-x-16 gap-y-14 min-[900px]:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.text} className="flex items-start gap-6">
                <span className="mt-0.5 shrink-0">{b.icon}</span>
                <p className="max-w-[430px] text-[clamp(18px,1.9vw,25px)] font-medium leading-[1.3] tracking-[-0.4px] text-ink">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ---- "How Payloat keeps purchases covered" trio (Cash App
                anatomy: wide pills-collage card + two portrait cards,
                titles and copy below) ---- */}
        <div className="mt-[clamp(72px,9vw,140px)]">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="text-[clamp(28px,3.4vw,48px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink"
          >
            How Payloat keeps purchases covered
          </motion.h2>

          <div className="mt-8 grid gap-5 min-[900px]:grid-cols-[2fr_1fr_1fr]">
            {/* card 1: the pills collage */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="flex flex-col"
            >
              <div
                className="relative h-[420px] overflow-hidden rounded-[24px] min-[900px]:h-[500px]"
                style={{ backgroundColor: "#eeeeee" }}
              >
                <span className="absolute left-[8%] top-[16%] -rotate-[38deg] rounded-full bg-[#dcdcda] px-8 py-4 text-[clamp(16px,1.6vw,22px)] font-medium text-ink">
                  Receipt parsing
                </span>
                <span className="absolute left-[38%] top-[24%] -rotate-[32deg] rounded-full bg-[#d6f251] px-8 py-4 text-[clamp(16px,1.6vw,22px)] font-medium text-ink">
                  Charge alerts
                </span>
                <span className="absolute left-[12%] top-[52%] -rotate-[14deg] rounded-full bg-[#0a0a0a] px-8 py-4 text-[clamp(16px,1.6vw,22px)] font-medium text-white">
                  Return tracking
                </span>
                <span className="absolute left-[42%] top-[68%] -rotate-[6deg] rounded-full bg-[#dcdcda] px-8 py-4 text-[clamp(16px,1.6vw,22px)] font-medium text-ink">
                  Refund watch
                </span>
                <span className="absolute right-[12%] top-[12%] flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#0a0a0a]">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="#fff"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <h3 className="mt-6 text-[clamp(22px,2.2vw,30px)] font-medium tracking-[-0.5px] text-ink">
                What Payloat does
              </h3>
              <p className="mt-3 max-w-[440px] text-[15px] leading-[1.5] text-sub">
                We read receipts, count down return windows, and flag every
                charge before it hits, so nothing slips away quietly.
              </p>
              <Link
                href="/product"
                className="mt-4 text-[15px] font-medium text-ink transition-opacity hover:opacity-60"
              >
                Explore the product →
              </Link>
            </motion.div>

            {/* card 2: lock toggle on black */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
              className="flex flex-col"
            >
              <div className="relative flex h-[420px] flex-col items-center justify-center rounded-[24px] bg-[#0a0a0a] min-[900px]:h-[500px]">
                <div className="relative h-[92px] w-[184px] rounded-full bg-[#d6f251]">
                  <span className="absolute right-1.5 top-1.5 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-white">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0a0a0a"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
                      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
                    </svg>
                  </span>
                </div>
                <span className="mt-7 text-[22px] font-medium text-white">
                  Lock card
                </span>
                <span className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#eeeeee]">
                  <PlusIcon />
                </span>
              </div>
              <h3 className="mt-6 text-[clamp(22px,2.2vw,30px)] font-medium tracking-[-0.5px] text-ink">
                What you can do
              </h3>
            </motion.div>

            {/* card 3: 24/7 on lime, serif display */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.16 }}
              className="flex flex-col"
            >
              <div className="relative flex h-[420px] items-center rounded-[24px] bg-[#d6f251] px-7 min-[900px]:h-[500px]">
                <span
                  className="text-[clamp(88px,8.5vw,132px)] leading-none tracking-[-3px] text-ink"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  24/7
                </span>
                <span className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <PlusIcon />
                </span>
              </div>
              <h3 className="mt-6 text-[clamp(22px,2.2vw,30px)] font-medium tracking-[-0.5px] text-ink">
                Help when you need it
              </h3>
            </motion.div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

/* ---- the four benefit rows, outline icons recreated from the ref ---- */

const ICON = {
  stroke: "#0a0a0a",
  strokeWidth: 2.6,
  fill: "none",
} as const;

const BENEFITS = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 44 44" {...ICON} aria-hidden>
        <circle
          cx="22"
          cy="22"
          r="17"
          strokeDasharray="21 7"
          strokeLinecap="round"
        />
        <path
          d="M15 22.5l5 5 9.5-10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: "Every receipt parsed into a tracked purchase",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 44 44" {...ICON} aria-hidden>
        <circle cx="22" cy="22" r="13" />
        <path d="M10 36 34 8" strokeLinecap="round" />
      </svg>
    ),
    text: "Zero silent charges, every renewal flagged a day early",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 44 44" {...ICON} aria-hidden>
        <circle cx="22" cy="22" r="17" />
        <path d="M22 13v9l6.5 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    text: "Return windows counted down to the deadline",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 44 44" {...ICON} aria-hidden>
        <path
          d="M7.5 25a16 16 0 0 1 29 0"
          strokeDasharray="9 6.5"
          strokeLinecap="round"
        />
        <path
          d="M16.5 24.5 27.5 35.5M27.5 24.5 16.5 35.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    text: "Encrypted purchase data, never sold to anyone",
  },
];

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2v12M2 8h12"
        stroke="#0a0a0a"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Renders the card at its design width, then zoom-scales it to fill the
   container — typography, chart, and spacing all grow in proportion, so
   the card is huge on desktop and intact on small screens. */
function HugeTracker() {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setZoom(el.offsetWidth / TRACKER_BASE_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      <div style={{ zoom } as React.CSSProperties}>
        <PurchaseTrackerCard
          countUp
          purchases={42}
          spend={2350}
          purchasesChange={8}
          spendChange={14}
          daily={DAILY}
          xLabels={X_LABELS}
        />
      </div>
    </div>
  );
}
