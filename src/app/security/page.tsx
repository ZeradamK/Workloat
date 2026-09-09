"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import ShaderBackground from "@/components/ShaderBackground";

/**
 * Security page (Cash App built-in-security anatomy, user refs), routed
 * from the home security trio's "Learn about security". Four acts:
 *   1. "Built-in security": shader canvas with a white iOS support screen
 *      overlapping in from the bottom, accordion of protections right.
 *   2. Claim headline + full-width media canvas (imagery to come).
 *   3. "We help keep your data secure": black + white cards with the
 *      ref's giant glyphs (asterisk cursor / shield check).
 *   4. "Explore more": three columns routing to /product, /purchases,
 *      /signup (imagery to come).
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

const PROTECTIONS = [
  {
    title: "Renewals flagged automatically",
    copy: "Every subscription an agent holds is surfaced before it renews, so nothing charges quietly.",
  },
  {
    title: "Every agent purchase, recorded",
    copy: "Intents, checkouts, receipts, and status changes are appended to a ledger no one can quietly edit.",
  },
  {
    title: "Warned when something goes wrong",
    copy: "If an agent spends past its cap or a receipt does not match, Payloat Ledger flags it before the month closes.",
  },
];

export default function SecurityPage() {
  const [open, setOpen] = useState(2);

  return (
    <main className="bg-white">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[170px]">
        {/* ---- act 1: Built-in security ---- */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-[clamp(38px,5vw,64px)] font-medium leading-[1.05] tracking-[-2px] text-ink"
        >
          Built-in security
        </motion.h1>

        <div className="mt-10 grid items-center gap-12 min-[900px]:grid-cols-[3fr_2fr]">
          {/* shader canvas, white iOS screen overlapping in from the bottom */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="relative h-[520px] overflow-hidden rounded-[24px] min-[900px]:h-[620px]"
          >
            <ShaderBackground />
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div className="w-[min(420px,78%)] translate-y-6 rounded-[28px] bg-white p-7 pb-12">
                <p className="text-[24px] font-bold tracking-[-0.5px] text-ink">
                  How can we help?
                </p>
                <div className="mt-4 flex h-11 items-center gap-2.5 rounded-full bg-[#eeeeee] px-4">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8e8c88"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.8-3.8" />
                  </svg>
                  <span className="text-[15px] text-sub">Search support</span>
                </div>
                <p className="mt-6 text-[18px] font-semibold text-ink">
                  Notifications
                </p>
                <div className="mt-3 flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0a0a0a"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="mt-0.5"
                  >
                    <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
                  </svg>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">
                      Payloat Support
                    </span>
                    <span className="block text-[13px] text-sub">
                      Hi there, how can I help?
                    </span>
                  </span>
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-[#e5484d]" />
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className="mt-1 text-sub"
                  >
                    <path
                      d="m6 3.5 5 4.5-5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-5 border-t border-black/10 pt-5">
                  <p className="text-[18px] font-semibold text-ink">Agent keys</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-sub">
                    Pause an agent, rotate its key, or see everything it recorded
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* the protections accordion */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
          >
            {PROTECTIONS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.title}
                  className={
                    i < PROTECTIONS.length - 1
                      ? "border-b border-black/15"
                      : ""
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span
                      className={`text-[clamp(18px,1.8vw,23px)] tracking-[-0.4px] transition-colors duration-150 ${
                        isOpen
                          ? "font-semibold text-ink"
                          : "font-normal text-sub"
                      }`}
                    >
                      {item.title}
                    </span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      aria-hidden
                      className="shrink-0"
                    >
                      <path
                        d="M9 2v14"
                        stroke="#0a0a0a"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        className={`origin-center transition-transform duration-200 ${
                          isOpen ? "scale-y-0" : ""
                        }`}
                      />
                      <path
                        d="M2 9h14"
                        stroke="#0a0a0a"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.3, 0.9, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[420px] pb-6 text-[clamp(16px,1.5vw,20px)] leading-[1.45] text-ink">
                          {item.copy}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ---- act 2: claim + media canvas (imagery to come) ---- */}
        <div className="mt-[clamp(96px,11vw,176px)]">
          <motion.h2
            {...up}
            className="text-[clamp(30px,3.8vw,54px)] font-medium leading-[1.08] tracking-[-1.5px] text-ink"
          >
            Every silent purchase,
            <br />
            seen before the statement
          </motion.h2>
          <motion.div
            {...up}
            className="relative mt-8 h-[420px] overflow-hidden rounded-[24px] min-[900px]:h-[600px]"
            style={{ backgroundColor: "#eeeeee" }}
          >
            <Image
              src="/security-charge.jpg"
              alt=""
              fill
              sizes="(min-width: 1248px) 1152px, 100vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* ---- act 3: data security cards ---- */}
        <div className="mt-[clamp(96px,11vw,176px)]">
          <motion.h2
            {...up}
            className="text-[clamp(28px,3.4vw,48px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink"
          >
            We help keep your data secure
          </motion.h2>
          <div className="mt-8 grid gap-5 min-[900px]:grid-cols-2">
            {/* black card: encryption, the ref's asterisk cursor glyph */}
            <motion.div
              {...up}
              className="flex h-[480px] flex-col rounded-[24px] bg-[#0a0a0a] p-8 min-[900px]:h-[560px]"
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-white/70">
                Encryption
              </p>
              <p className="mt-3 max-w-[380px] text-[clamp(20px,2vw,27px)] font-medium leading-[1.3] tracking-[-0.5px] text-white">
                Your agents&apos; purchase data encrypted for your privacy
              </p>
              <div className="mt-auto flex items-end gap-4 pb-2">
                <AsteriskGlyph />
                <AsteriskGlyph />
                <span className="h-[150px] w-[12px] rounded-[3px] bg-white" />
              </div>
            </motion.div>

            {/* white card: never sold, the ref's shield check */}
            <motion.div
              {...up}
              transition={{ ...up.transition, delay: 0.08 }}
              className="flex h-[480px] flex-col rounded-[24px] border border-solid border-black/10 bg-white p-8 min-[900px]:h-[560px]"
            >
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-sub">
                Privacy
              </p>
              <p className="mt-3 max-w-[380px] text-[clamp(20px,2vw,27px)] font-medium leading-[1.3] tracking-[-0.5px] text-ink">
                Your data belongs to your company and is never sold to anyone
              </p>
              <div className="mt-auto flex justify-center pb-6">
                <svg
                  width="190"
                  height="190"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M24 5 8 10.5v10C8 31 14.5 39.3 24 43c9.5-3.7 16-12 16-22.5v-10L24 5Z" />
                  <path d="m16.5 24 5.5 5.5 10-11" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---- act 4: explore more ---- */}
        <div className="mt-[clamp(96px,11vw,176px)]">
          <motion.h2
            {...up}
            className="text-[clamp(28px,3.4vw,48px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink"
          >
            Explore more
          </motion.h2>
          <div className="mt-8 grid gap-10 min-[900px]:grid-cols-3">
            {EXPLORE.map((e, i) => (
              <motion.div
                key={e.href}
                {...up}
                transition={{ ...up.transition, delay: i * 0.08 }}
                className="flex flex-col items-start"
              >
                {/* imagery lands per column as supplied */}
                <div
                  className={`relative aspect-square w-full overflow-hidden rounded-[24px] ${
                    e.border ? "border border-solid border-black" : ""
                  }`}
                  style={{ backgroundColor: "#eeeeee" }}
                >
                  {e.image && (
                    <Image
                      src={e.image}
                      alt=""
                      fill
                      sizes="(min-width: 900px) 373px, 100vw"
                      className="object-cover"
                    />
                  )}
                  {e.label && (
                    <span className="absolute inset-0 flex items-center justify-center text-[clamp(36px,3.6vw,52px)] font-medium tracking-[-2px] text-white">
                      {e.label}
                    </span>
                  )}
                </div>
                <h3 className="mt-6 max-w-[300px] text-[clamp(20px,2vw,27px)] font-medium leading-[1.25] tracking-[-0.5px] text-ink">
                  {e.title}
                </h3>
                <Link
                  href={e.href}
                  className="mt-5 inline-flex h-11 items-center rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  {e.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

const EXPLORE: {
  title: string;
  cta: string;
  href: string;
  image?: string;
  label?: string;
  border?: boolean;
}[] = [
  {
    title: "See everything Payloat Ledger sees",
    cta: "Explore the product",
    href: "/product",
    image: "/explore-product-v2.jpg",
    border: true,
  },
  {
    title: "Agent purchases, from intent to receipt",
    cta: "See agent purchases",
    href: "/purchases",
    image: "/explore-purchases.jpg",
  },
  {
    title: "Be first when Payloat Ledger opens",
    cta: "Sign up",
    href: "/signup",
    image: "/explore-signup.jpg",
    label: "Sign Up",
  },
];

/* the ref's six-spoke asterisk, drawn big */
function AsteriskGlyph() {
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 48 48"
      fill="none"
      stroke="#ffffff"
      strokeWidth="7"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M24 6v36M8.4 15l31.2 18M39.6 15 8.4 33" />
    </svg>
  );
}
