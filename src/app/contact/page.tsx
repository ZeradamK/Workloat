"use client";

import Link from "next/link";
import { motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";

/**
 * Contact page (Grok minimal card language + Tines hierarchy, adapted to
 * the site system): display H1, two primary canvases (Support on #EEEEEE,
 * Business sales on black), a row of three small cards, and the fallback
 * line. Routed from the Contact nav item's click.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

export default function ContactPage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[200px]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-[clamp(38px,5vw,64px)] font-medium leading-[1.05] tracking-[-2px] text-ink"
        >
          Contact
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
          className="mt-4 max-w-[460px] text-[17px] leading-[1.5] text-sub"
        >
          Questions, feedback, or press. We read everything.
        </motion.p>

        {/* primary pair */}
        <div className="mt-12 grid gap-5 min-[900px]:grid-cols-2">
          <motion.div
            {...up}
            id="support"
            className="flex min-h-[340px] scroll-mt-[100px] flex-col rounded-[24px] p-8"
            style={{ backgroundColor: "#eeeeee" }}
          >
            <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[11px] bg-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
              </svg>
            </span>
            <h2 className="mt-6 text-[clamp(22px,2.2vw,28px)] font-medium tracking-[-0.5px] text-ink">
              Support
            </h2>
            <p className="mt-2 max-w-[380px] text-[15px] leading-[1.5] text-sub">
              Questions about the ledger, your agents, or your data. A person
              reads every message.
            </p>
            <div className="mt-auto flex flex-wrap gap-2.5 pt-8">
              <a
                href="mailto:hello@payloat.com"
                className="inline-flex h-11 items-center rounded-full bg-[#0a0a0a] px-5 text-[13px] font-semibold tracking-[-0.5px] text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Email support
              </a>
              <Link
                href="/#faq"
                className="inline-flex h-11 items-center rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Read the FAQ
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...up}
            transition={{ ...up.transition, delay: 0.08 }}
            id="sales"
            className="flex min-h-[340px] scroll-mt-[100px] flex-col rounded-[24px] bg-[#0a0a0a] p-8"
          >
            <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[11px] bg-white/15">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3.5" y="8" width="17" height="12" rx="2.5" />
                <path d="M9 8V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V8M3.5 13h17" />
              </svg>
            </span>
            <h2 className="mt-6 text-[clamp(22px,2.2vw,28px)] font-medium tracking-[-0.5px] text-white">
              Sales
            </h2>
            <p className="mt-2 max-w-[380px] text-[15px] leading-[1.5] text-white/60">
              Payloat Ledger for companies with many agents, many locations,
              or both.
            </p>
            <div className="mt-auto pt-8">
              <a
                href="mailto:hello@payloat.com?subject=Business%20sales"
                className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Talk to sales
              </a>
            </div>
          </motion.div>
        </div>

        {/* secondary row */}
        <div className="mt-5 grid gap-5 min-[900px]:grid-cols-3">
          {SECONDARY.map((c, i) => (
            <motion.div
              key={c.title}
              {...up}
              transition={{ ...up.transition, delay: i * 0.06 }}
              id={c.id}
              className="flex min-h-[200px] scroll-mt-[100px] flex-col rounded-[24px] border border-solid border-black/10 bg-white p-7"
            >
              <h3 className="text-[19px] font-medium tracking-[-0.4px] text-ink">
                {c.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-sub">
                {c.copy}
              </p>
              <div className="mt-auto pt-6">
                {c.external ? (
                  <a
                    href={c.href}
                    className="text-[14px] font-medium text-ink transition-opacity hover:opacity-60"
                  >
                    {c.cta} →
                  </a>
                ) : (
                  <Link
                    href={c.href}
                    className="text-[14px] font-medium text-ink transition-opacity hover:opacity-60"
                  >
                    {c.cta} →
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* fallback line */}
        <motion.p
          {...up}
          className="mt-14 text-center text-[14px] leading-[1.5] text-sub"
        >
          Anything else? Write to{" "}
          <a
            href="mailto:hello@payloat.com"
            className="font-medium text-ink transition-opacity hover:opacity-60"
          >
            hello@payloat.com
          </a>{" "}
          and it reaches a human.
        </motion.p>
      </section>

      <FooterSection />
    </main>
  );
}

const SECONDARY = [
  {
    id: "press",
    title: "Press",
    copy: "Writing about Payloat Ledger? We are happy to talk.",
    cta: "Email press",
    href: "mailto:hello@payloat.com?subject=Press",
    external: true,
  },
  {
    id: "help",
    title: "Help center",
    copy: "Short answers to the questions we hear most.",
    cta: "Browse the FAQ",
    href: "/#faq",
    external: false,
  },
  {
    id: "updates",
    title: "Launch updates",
    copy: "Be first to know when Payloat Ledger opens.",
    cta: "Sign up",
    href: "/signup",
    external: false,
  },
];
