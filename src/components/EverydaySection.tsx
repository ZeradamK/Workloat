"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

/**
 * Home teaser for the features page's "Your everyday money inbox" act:
 * centered headline, the act's two strongest collages side by side, and a
 * pill that deep-links to the act itself (/features#everyday).
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

export default function EverydaySection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,120px)]">
      <motion.h2
        {...up}
        className="text-center text-[clamp(30px,3.8vw,54px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink"
      >
        Your agents&apos; spending, in one ledger
      </motion.h2>
      <motion.p
        {...up}
        className="mx-auto mt-4 max-w-[520px] text-center text-[16px] leading-[1.5] text-sub"
      >
        Purchases, subscriptions, orders, and receipts, all recorded in one place.
      </motion.p>

      <div className="mt-12 flex flex-col items-center gap-5 min-[900px]:flex-row min-[900px]:justify-center">
        <motion.div
          {...up}
          className="relative aspect-[400/611] w-full max-w-[400px] overflow-hidden rounded-[24px]"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          <Image
            src="/features-stack2.jpg"
            alt="An agent order tracked to delivery"
            fill
            sizes="(min-width: 900px) 590px, 100vw"
            className="object-cover"
          />
        </motion.div>
        <motion.div
          {...up}
          transition={{ ...up.transition, delay: 0.08 }}
          className="relative aspect-[400/611] w-full max-w-[400px] overflow-hidden rounded-[24px]"
          style={{ backgroundColor: "#6aa5c8" }}
        >
          <Image
            src="/features-stack4.jpg"
            alt="A receipt matched to its purchase"
            fill
            sizes="(min-width: 900px) 590px, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      <motion.div {...up} className="mt-10 flex justify-center">
        <Link
          href="/features#everyday"
          className="inline-flex h-11 items-center rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Explore the ledger
        </Link>
      </motion.div>
    </section>
  );
}
