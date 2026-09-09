"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Security trio (Cash App anatomy): heading + pill left, three square
 * cards right — black (live spike clock, 24/7 monitoring), gray
 * (transaction alert toasts), white with black border (card lock toggle).
 */

export default function SecuritySection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(56px,7vw,120px)] pt-[clamp(40px,5vw,96px)]">
      <div className="grid grid-cols-12 gap-6">
        {/* ---- Left: heading ---- */}
        <div className="col-span-12 min-[900px]:col-span-3">
          <h2 className="text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.15] tracking-[-1px] text-ink">
            Agent spend tracking
            <br />
            built for security
          </h2>
          <Link
            href="/security"
            className="mt-7 inline-flex h-11 items-center rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Learn about security
          </Link>
        </div>

        {/* ---- Right: the three cards ---- */}
        <div className="col-span-12 grid gap-6 min-[700px]:grid-cols-[1fr_calc(33.333%+50px)_1fr] min-[900px]:col-span-9">
          {/* black: the live clock */}
          <div>
            <div
              className="flex h-[290px] items-center justify-center overflow-hidden rounded-[32px]"
              style={{ backgroundColor: "#0a0a0a" }}
            >
              <SpikeClock size={250} />
            </div>
            <p className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.5px] text-ink">
              24/7 ledger monitoring
            </p>
          </div>

          {/* gray: transaction alert toasts */}
          <div className="flex flex-col">
            <div
              className="relative flex h-[290px] items-center justify-center overflow-hidden rounded-[32px] px-5"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <div className="relative w-full max-w-[320px]">
                <div className="absolute -top-8 left-1/2 h-[46px] w-[82%] -translate-x-1/2 rounded-[16px] bg-white/35" />
                <div className="absolute -top-4 left-1/2 h-[50px] w-[91%] -translate-x-1/2 rounded-[16px] bg-white/60" />
                <div className="relative flex items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-2.5">
                  <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-[#eeeeee]">
                    <Image
                      src="/logos/apple.webp"
                      alt="Apple"
                      width={54}
                      height={54}
                      className="h-[27px] w-[27px] rounded-[5px] object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold leading-tight text-ink">
                      New agent purchase
                    </span>
                    <span className="block text-[13px] leading-snug text-sub">
                      Procurement spent $350 at Apple
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.5px] text-ink">
              Real-time purchase alerts
            </p>
          </div>

          {/* white with black border: lock toggle */}
          <div>
            <div className="flex h-[290px] flex-col items-center justify-center gap-5 rounded-[32px] border border-solid border-black bg-white">
              <div className="relative h-[62px] w-[128px] rounded-full" style={{ backgroundColor: "#0a0a0a" }}>
                <span className="absolute right-[6px] top-1/2 flex h-[50px] w-[50px] -translate-y-1/2 items-center justify-center rounded-full bg-white">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0a0a0a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="5" y="11" width="14" height="9" rx="2.5" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </div>
              <p className="text-[20px] font-medium tracking-[-0.5px] text-ink">
                Pause agent
              </p>
            </div>
            <p className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.5px] text-ink">
              Pause any agent, revoke any key
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- The spike-ring clock: two rotating tick rings, live hour center,
        bracketed minute readout — white on the black card ---- */

function SpikeClock({ size = 250 }: { size?: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now?.getSeconds() ?? 0;
  const m = now?.getMinutes() ?? 0;
  const h = now?.getHours() ?? 0;

  const secondsR = size / 2 - 10;
  const minutesR = size / 2 - 34;

  const ring = (count: number, radius: number, major: number) =>
    Array.from({ length: count }, (_, i) => (
      <i
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 2,
          height: i % major === 0 ? 13 : 7,
          marginLeft: -1,
          marginTop: i % major === 0 ? -6.5 : -3.5,
          background:
            i % major === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.38)",
          transform: `rotate(${6 * i}deg) translateY(${-radius}px)`,
        }}
      />
    ));

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* seconds ring sweeps once per second */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${-6 * s}deg)`,
          transition: s === 0 ? "none" : "transform 1s linear",
        }}
      >
        {ring(60, secondsR, 5)}
      </div>
      {/* minutes ring steps once per minute */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${-6 * m}deg)`,
          transition: m === 0 ? "none" : "transform 0.6s ease",
        }}
      >
        {ring(60, minutesR, 15)}
      </div>

      {/* hour, dead center */}
      <span
        className="font-numeral"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 50,
          fontWeight: 400,
          color: "#ffffff",
          lineHeight: 1,
        }}
      >
        {now ? h : ""}
      </span>

      {/* minute readout: fused 3px capsule */}
      <div
        style={{
          position: "absolute",
          right: size / 5.8,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
        }}
      >
        <span
          className="font-numeral"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 46,
            height: 32,
            padding: "0 9px",
            border: "1px solid #ffffff",
            borderRadius: 9999,
            fontSize: 18,
            fontWeight: 400,
            color: "#ffffff",
            backgroundColor: "#0a0a0a",
          }}
        >
          {now ? m : ""}
        </span>
      </div>
    </div>
  );
}
