"use client";

import { motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";

/**
 * Enterprise page. Cleared to a headline while its design is supplied;
 * the nav and footer stay so the route is live.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function EnterprisePage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />
      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[170px]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[15px] text-sub"
        >
          Payloat for enterprise
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
          className="mt-4 max-w-[900px] text-[clamp(34px,4.2vw,58px)] font-medium leading-[1.08] tracking-[-2px] text-ink"
        >
          One ledger for every agent&apos;s spend, across every team.
        </motion.h1>
      </section>
      <FooterSection />
    </main>
  );
}
