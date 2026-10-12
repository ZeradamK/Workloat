"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import HeroStory from "./HeroStory";
import SignupButton from "./SignupButton";
import { heroT } from "./introProgress";

/**
 * The hero, in two blocks on #eeeeee. A short top block under the nav:
 * the headline left, the paragraph and the buttons right. Then the big
 * panel: a short story about one task (HeroStory), you typing it to a
 * Loat, his inbox and then his texts, over a looping video ground
 * (HeroVideo), in the ledger card's 6px corners. The act writes heroT as
 * it scrolls out so the nav dock moves to its light surface once the hero
 * is gone.
 */

export default function HeroShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  /* only the visible breakpoint's act may write the shared heroT signal */
  const isDesktop = useRef(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 800px)");
    const update = () => {
      isDesktop.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* 0 while the hero fills the viewport, 1 once it has scrolled away */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!isDesktop.current) return; /* hidden act must not stomp heroT */
    heroT.set(v);
  });

  return (
    <>
      <MobileHero />
      <div ref={ref} className="relative hidden bg-[#eeeeee] px-[clamp(20px,2.7vw,52px)] pb-[clamp(24px,3vw,48px)] pt-[100px] min-[800px]:block">
        {/* the top block: headline left, paragraph and buttons right */}
        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-end gap-[clamp(24px,4vw,88px)] pt-[clamp(24px,3.4vw,64px)]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.6, 0.2, 1], delay: 0.05 }}
            className="text-[clamp(34px,3.5vw,68px)] font-medium leading-[1.02] tracking-[-2px] text-ink [text-wrap:balance]"
          >
            Get a team of AI workers that runs your everyday tasks on autopilot.
          </motion.h1>
          <div className="justify-self-end pb-[6px]">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.6, 0.2, 1], delay: 0.12 }}
              className="max-w-[440px] text-[clamp(13px,calc(1.35vw-4px),20px)] font-light leading-[1.35] tracking-[-0.02em] text-ink"
            >
              Loats are AI workers with their own email address. Ask in chat or by email; they do the work and check with you before anything leaves.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.6, 0.2, 1], delay: 0.18 }}
              data-hero-cta
              className="mt-[clamp(20px,2.2vw,36px)] flex flex-wrap items-center gap-x-8 gap-y-5"
            >
              <SignupButton />
            </motion.div>
          </div>
        </div>
        {/* the big block: Workloat's input at work, on the looping ground.
            data-nav-skin keeps the nav on its light bar over the video, which
            reads dark */}
        <motion.div
          data-nav-skin="light"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.6, 0.2, 1], delay: 0.22 }}
          className="mt-[clamp(32px,4vw,64px)] flex h-[clamp(460px,46vw,680px)] items-center justify-center relative overflow-hidden rounded-[6px] bg-[#1b2433]"
        >
          <HeroVideo />
          <HeroStory layout="desktop" />
        </motion.div>
      </div>
    </>
  );
}

/* ---- Mobile hero (<800px): the same two blocks, stacked. ---- */

function MobileHero() {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 799px)");
    const update = () => {
      isMobile.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!isMobile.current) return; /* hidden act must not stomp heroT */
    heroT.set(v);
  });

  const up = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, ease: [0.25, 0.6, 0.2, 1] },
  } as const;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center bg-[#eeeeee] px-6 pb-20 pt-[120px] text-center min-[800px]:hidden"
    >
      {/* stacked: the headline, the paragraph and buttons, then the panel */}
      <motion.h2
        {...up}
        className="text-[clamp(32px,9vw,46px)] font-medium leading-[1.04] tracking-[-1.5px] text-ink [text-wrap:balance]"
      >
        Get a team of AI workers that runs your everyday tasks on autopilot.
      </motion.h2>
      <motion.p
        {...up}
        className="mt-7 max-w-[520px] text-[14px] font-light leading-[1.35] tracking-[-0.02em] text-ink"
      >
        Loats are AI workers with their own email address. Ask in chat or by email; they do the work and check with you before anything leaves.
      </motion.p>
      <motion.div {...up} data-hero-cta className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
        <SignupButton />
      </motion.div>
      <motion.div {...up} data-nav-skin="light" className="relative mt-10 flex h-[560px] w-full items-center justify-center overflow-hidden rounded-[6px] bg-[#1b2433]">
        <HeroVideo />
        <HeroStory layout="mobile" />
      </motion.div>
    </div>
  );
}

/* The hero panel's ground: hero-bg.mp4, a 15.2s loop whose last 1.5s
   crossfade into its opening, so it plays round without a seam. It loads
   and plays only while its panel is on screen (the hidden layout's copy
   never fetches), and holds its first frame for reduced motion. */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src="/landing/hero/hero-bg.mp4"
      poster="/landing/hero/hero-bg-poster.jpg"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    />
  );
}
