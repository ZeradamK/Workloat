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
          Product intro
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

          <div className="mt-12 grid gap-5 min-[900px]:grid-cols-2">
            <Parallax amount={32}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="relative flex h-[400px] items-center justify-center rounded-[32px] min-[900px]:h-[460px]"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <div className="relative w-[min(320px,80%)]">
                <Bar
                  logo="/logos/openai.svg"
                  name="OpenAI"
                  note="API usage this month"
                  amount="$2,500.00"
                />
                <div className="absolute -bottom-10 right-3 flex items-center gap-1.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M5.5 3.5 18 12l-5.3 1 2.9 5.4-2.7 1.4-2.9-5.5-4.5 3.2V3.5Z"
                      fill="#0a0a0a"
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="rounded-full bg-[#0a0a0a] px-3 py-1.5 text-[12px] font-semibold text-white">
                    Recorded
                  </span>
                </div>
              </div>
            </motion.div>
            </Parallax>

            <Parallax amount={52}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
              className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-[32px] min-[900px]:h-[460px]"
            >
              <Image
                src="/payloat-card-gradient.png"
                alt=""
                fill
                sizes="(min-width: 900px) 590px, 100vw"
                className="object-cover"
              />
              <div className="relative h-[210px] w-[min(340px,80%)] rounded-[22px] bg-[#0d0d0d] p-5">
                <div className="flex items-start justify-between">
                  <span className="font-numeral text-[14px] font-semibold text-white/80">
                    •••• 3346
                  </span>
                  <span className="text-[14px] font-bold italic tracking-tight text-white/80">
                    VISA
                  </span>
                </div>
                <span className="absolute bottom-5 left-5 text-[26px] font-bold tracking-[-0.5px] text-white">
                  Payloat
                </span>
              </div>
            </motion.div>
            </Parallax>
          </div>
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

/* The activities-list notification bar, white on the canvas fields. */
function Bar({
  logo,
  name,
  note,
  amount,
  bg,
  dark,
}: {
  logo: string;
  name: string;
  note: string;
  amount: string;
  /** the bar's ground (the goal act's per-charge colors) and, on dark
      grounds, white type */
  bg?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] py-[6px] pl-[6px] pr-2.5" style={{ backgroundColor: bg ?? "#ffffff" }}>
      <span className={`flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] ${bg ? "bg-white" : "bg-[#eeeeee]"}`}>
        <Image
          src={logo}
          alt={name}
          width={54}
          height={54}
          className="h-[27px] w-[27px] rounded-[5px] object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[16px] font-semibold ${dark ? "text-white" : "text-ink"}`}>{name}</span>
        <span className={`block text-[13px] leading-snug ${dark ? "text-white/70" : "text-sub"}`}>{note}</span>
      </span>
      <span className={`text-[17px] font-semibold tracking-[-0.43px] ${dark ? "text-white" : "text-ink"}`}>
        {amount}
      </span>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="m6 3.5 5 4.5-5 4.5"
          stroke={dark ? "#ffffff" : "#b3b1ac"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

