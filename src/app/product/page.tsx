"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import { productLight } from "@/components/introProgress";

/**
 * Product page, Cash App outsmart-scams anatomy: massive H1, a hero canvas
 * with a corner paragraph, then the two "it works" canvases. Canvases are
 * reserved for supplied motion assets (shader / video / 3D) and ship as
 * clean color fields until then.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

/* the investing section's palette, Wise's forest and lime */
const GREEN_INK = "#163300";
const LIME = "#9fe870";

export default function ProductPage() {
  /* while the fixed dock (viewport band ~15–68px) overlaps the black hero
     canvas, zip the dock to #EEEEEE in 50ms; zip back once it passes */
  const heroRef = useRef<HTMLDivElement>(null);
  const litRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const r = heroRef.current?.getBoundingClientRect();
      if (!r) return;
      const overlap = r.top < 68 && r.bottom > 15;
      if (overlap !== litRef.current) {
        litRef.current = overlap;
        animate(productLight, overlap ? 1 : 0, {
          duration: 0.05,
          ease: "easeOut",
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      productLight.set(0);
    };
  }, []);

  return (
    <main className="bg-white">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[170px]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-4 text-[15px] text-sub"
        >
          Investing with agents
        </motion.p>
        {/* massive display headline, outsmart-scams scale */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-[clamp(48px,7.5vw,96px)] font-medium leading-[1.02] tracking-[-3px] text-ink"
        >
          Everything Payloat Ledger
          <br />
          sees after an agent pays
        </motion.h1>

        {/* hero canvas: the glowing card render, corner paragraph on top */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          className="relative mt-12 min-h-[420px] overflow-hidden rounded-[32px] p-8 min-[900px]:min-h-[600px] min-[900px]:p-12"
          style={{ backgroundColor: "#000000" }}
        >
          {/* smaller than native so it never upscales; its black field
              blends into the canvas */}
          <Parallax
            amount={26}
            className="absolute bottom-0 right-0 w-[min(62%,820px)]"
          >
            <Image
              src="/product-hero-card.jpg"
              alt=""
              width={1672}
              height={941}
              priority
              className="h-auto w-full"
            />
          </Parallax>
          <p className="relative max-w-[460px] text-[clamp(20px,2vw,26px)] leading-[1.35] tracking-[-0.5px] text-white">
            Purchases, subscriptions, orders, and travel, recorded by your
            agents and checked before the receipts land.
          </p>
        </motion.div>


        {/* Fluz "It works" anatomy: centered display headline + two moment
            canvases */}
        <div className="mt-[clamp(96px,11vw,176px)]">
          <h2 className="text-center text-[clamp(34px,4.5vw,64px)] font-medium leading-[1.05] tracking-[-2px] text-ink">
            From the agent or
            <br />
            from the card. It works.
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-center text-[15px] leading-[1.5] text-sub">
            Payloat Ledger takes what agents record and what cards charge,
            and lines them up.
          </p>
        </div>
      </section>

      {/* Investing with agents, on Wise's hero anatomy: a deep green ground,
          the headline in heavy lime caps, the copy in white with lime links
          and two small link columns; a white card on the right that works
          an investing agent's budget the way Wise's works a transfer, with
          a colored strip at its foot. */}
      <section className="mt-[clamp(72px,9vw,144px)] px-6 py-[clamp(72px,9vw,140px)]" style={{ backgroundColor: GREEN_INK }}>
        <div className="mx-auto grid max-w-[1200px] gap-12 min-[900px]:grid-cols-[1fr_1fr] min-[900px]:items-center min-[900px]:gap-16">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="text-[clamp(44px,6.2vw,92px)] font-black uppercase leading-[0.92] tracking-[-2.5px]"
              style={{ color: LIME }}
            >
              Investing
              <br />
              with
              <br />
              agents
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
              className="mt-10 max-w-[560px] text-[clamp(18px,1.6vw,24px)] leading-[1.4] text-white"
            >
              Give an investing agent a mandate and a cap. Payloat records every order it places,
              matches the confirmations, and shows you the position before the{" "}
              <a href="#" className="underline decoration-2 underline-offset-[6px]" style={{ color: LIME }}>
                statement lands
              </a>
              .
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.16 }}
              className="mt-12 grid max-w-[520px] grid-cols-2 gap-8 text-[18px] leading-[1.35] text-white"
            >
              <div>
                Agents that trade for you
                <br />
                <a href="#" className="underline decoration-2 underline-offset-[6px]" style={{ color: LIME }}>
                  See how it works
                </a>
              </div>
              <div>
                Is the cap enforced?
                <br />
                <a href="#" className="underline decoration-2 underline-offset-[6px]" style={{ color: LIME }}>
                  Yes, here&apos;s how
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="relative overflow-hidden rounded-[28px] bg-white pb-[18px]"
          >
            <div className="p-8 text-ink min-[900px]:p-10">
              <p className="text-[17px]" style={{ color: "#454745" }}>
                The agent may place up to
              </p>
              <div className="mt-3 flex h-[76px] items-center justify-between gap-3 rounded-[12px] px-5 min-[600px]:h-[88px] min-[600px]:px-6" style={{ border: "1.5px solid #868685" }}>
                <span className="font-numeral text-[24px] font-semibold tabular-nums min-[600px]:text-[30px]">5,000</span>
                <span className="flex shrink-0 items-center gap-2 text-[20px] font-semibold min-[600px]:text-[24px]">
                  <span className="h-[26px] w-[26px] rounded-full" style={{ background: "conic-gradient(#b22234 0 33%, #ffffff 33% 66%, #3c3b6e 66%)" }} />
                  USD
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3 text-[15px] min-[600px]:text-[18px]">
                {[
                  ["•", "3,240 USD", "Placed so far, 12 orders", false],
                  ["•", "12 of 12", "Confirmations matched", false],
                  ["−", "7.30 USD", "Brokerage and platform fees", false],
                  ["=", "1,752.70 USD", "Left on the cap", true],
                  ["×", "4 hours", "Confirmations usually arrive in", true],
                ].map(([mark, value, label, strong]) => (
                  <div key={String(label)} className="flex items-center gap-4" style={strong ? { borderTop: "1px solid #dedede", paddingTop: 12 } : undefined}>
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: mark === "•" ? "#e6e6e6" : "#0a0a0a", color: mark === "•" ? "#e6e6e6" : "#ffffff" }}>
                      {mark === "•" ? "" : mark}
                    </span>
                    <span className="font-numeral whitespace-nowrap font-semibold tabular-nums">{value}</span>
                    <span className="ml-auto text-right leading-[1.3]" style={{ color: "#454745" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-[17px]" style={{ color: "#454745" }}>
                The agent can still place
              </p>
              <div className="mt-3 flex h-[76px] items-center justify-between gap-3 rounded-[12px] px-5 min-[600px]:h-[88px] min-[600px]:px-6" style={{ border: "1.5px solid #868685" }}>
                <span className="font-numeral text-[24px] font-semibold tabular-nums min-[600px]:text-[30px]">1,752.70</span>
                <span className="flex shrink-0 items-center gap-2 text-[20px] font-semibold min-[600px]:text-[24px]">
                  <span className="h-[26px] w-[26px] rounded-full" style={{ background: "conic-gradient(#b22234 0 33%, #ffffff 33% 66%, #3c3b6e 66%)" }} />
                  USD
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>

              <p className="mt-6 text-[15px] leading-[1.5] min-[600px]:text-[17px]" style={{ color: "#454745" }}>
                Every order carries the <span className="font-semibold text-ink">task behind it</span>
                <br />
                Over the cap, the agent is <span className="font-semibold text-ink">stopped, not warned</span>
              </p>

              <div className="mt-8 grid gap-4 min-[600px]:grid-cols-2">
                <a href="#" className="flex h-[64px] items-center justify-center rounded-full text-[18px] font-semibold text-ink" style={{ border: "1.5px solid #0a0a0a" }}>
                  See a sample ledger
                </a>
                <a href="/signup" className="flex h-[64px] items-center justify-center rounded-full text-[18px] font-semibold text-ink" style={{ backgroundColor: LIME }}>
                  Get started
                </a>
              </div>
            </div>
            {/* the colored strip at the card's foot */}
            <div className="absolute inset-x-0 bottom-0 h-[18px] overflow-hidden">
              <Image src="/slack-gradient.jpg" alt="" fill sizes="600px" className="object-cover" style={{ filter: "hue-rotate(140deg) saturate(1.4)" }} />
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

/* Scroll parallax: drifts children vertically as the element crosses the
   viewport, spring-smoothed like the home page scrubs. */
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
