"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import { supabase } from "@/lib/supabase";

/**
 * Where a finished sign-up lands. Craft's confirmation anatomy, in the
 * site's ruled grid: a caps eyebrow, one large line, what happens next,
 * the address we recorded, and a single way back.
 *
 * The web app is parked, so this page is the end of the flow rather
 * than a waypoint into it.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
} as const;

type State = "live" | "confirm" | "login";

const COPY: Record<State, { eyebrow: string; head: string; body: string }> = {
  live: {
    eyebrow: "You're in",
    head: "You're signed up.",
    body: "Your place is recorded. We will write to you the moment Payloat Ledger opens, with everything you need to connect your first agent.",
  },
  confirm: {
    eyebrow: "One step left",
    head: "Check your inbox.",
    body: "Your place is recorded. Open the link we just sent to confirm the address, and we will write to you the moment Payloat Ledger opens.",
  },
  login: {
    eyebrow: "Welcome back",
    head: "You're signed in.",
    body: "Your place is recorded. We will write to you the moment Payloat Ledger opens, with everything you need to connect your first agent.",
  },
};

export default function ConfirmedPage() {
  return (
    <main className="overflow-x-clip bg-[#eeeeee]">
      <NavDock skin="light" />
      <Suspense fallback={<div className="h-[70vh]" />}>
        <Confirmed />
      </Suspense>
      <FooterSection tone="dark" />
    </main>
  );
}

function Confirmed() {
  const params = useSearchParams();
  const state = (params.get("state") as State) ?? "live";
  const fromQuery = params.get("email");
  const [email, setEmail] = useState<string | null>(fromQuery);

  /* the address in the link is what the form recorded; fall back to the
     session so an OAuth return still names the account */
  useEffect(() => {
    if (email) return;
    let live = true;
    supabase.auth.getSession().then(({ data }) => {
      if (live && data.session?.user.email) setEmail(data.session.user.email);
    });
    return () => {
      live = false;
    };
  }, [email]);

  const copy = COPY[state] ?? COPY.live;

  return (
    <section className="px-[clamp(20px,1.7vw,32px)] pb-[clamp(72px,9vw,150px)] pt-[clamp(140px,12vw,230px)]">
      {/* the ruled cell: rails, rules running past them, crosshairs */}
      <motion.div
        {...up}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative mx-auto w-full max-w-[860px] border-x border-black/[0.12]"
      >
        <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-black/[0.12]" />
        <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-black/[0.12]" />
        <Cross pos="top-left" />
        <Cross pos="bottom-right" />

        <div className="border-y border-black/[0.12] bg-white px-[clamp(24px,4.5vw,72px)] py-[clamp(40px,5vw,80px)]">
          <p className="font-numeral text-[12px] uppercase tracking-[1.8px] text-ink/55">
            {copy.eyebrow}
          </p>
          <h1 className="mt-[clamp(16px,1.6vw,26px)] text-[clamp(34px,4.6vw,66px)] font-medium leading-[1.02] tracking-[-2.2px] text-ink">
            {copy.head}
          </h1>
          <p className="mt-[clamp(18px,1.8vw,30px)] max-w-[52ch] text-[clamp(15px,1.15vw,19px)] leading-[1.5] text-sub">
            {copy.body}
          </p>

          {/* the address we hold, so it is plain what was recorded */}
          <div className="mt-[clamp(28px,3vw,46px)] border border-black/[0.12] bg-[#eeeeee] px-5 py-4">
            <p className="font-numeral text-[11px] uppercase tracking-[1.6px] text-ink/55">
              Recorded against
            </p>
            <p className="mt-1.5 break-all text-[clamp(15px,1.2vw,20px)] font-semibold tracking-[-0.4px] text-ink">
              {email ?? "your email address"}
            </p>
          </div>

          {/* the one way on, in the site's split button */}
          <Link
            href="/"
            className="mt-[clamp(28px,3vw,46px)] inline-flex h-[52px] items-stretch text-[14px] font-semibold tracking-[-0.3px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex w-[52px] items-center justify-center bg-[#0a0a0a]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M5 2.5 10.5 8 5 13.5"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="flex items-center bg-[#1e1e1e] px-7 text-white">
              Back to home
            </span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* the grid's small crosshair where a rule meets a rail */
function Cross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at =
    pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/40" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/40" />
    </span>
  );
}
