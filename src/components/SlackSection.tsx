"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import PhoneMock, { screenWidth as phoneScreenWidth } from "./PhoneMock";

/**
 * Slack act (Ramp investment-account hero anatomy, Mobbin ref
 * sites/sections/03c51e3d): bold headline over a device, two floating
 * white callouts. The page stays white; every device screen wears the brand
 * blue gradient (public/slack-gradient.jpg, 3840x2160) as its wallpaper,
 * and the Slack desktop window floats on it in real Slack colors (Mobbin
 * refs screens/49abc402, screens/c92cb6cf: aubergine rail and sidebar,
 * white active row, white message pane, square avatars, name + time rows,
 * composer with toolbar). Zeradam asks @Payloat for this month's spend and
 * the app answers with an Origin-style forecast card (Mobbin ref
 * sites/sections/1fde4e1c) drawn on the gradient: solid line so far,
 * dashed projection, milestone markers, right-edge y labels, mono x labels.
 *
 * Devices by width: MacBook Pro from 1024px (tilted, design 1440x900),
 * iPad from 700px (design 1024x768), iPhone below (PhoneMock, natural
 * size). Each screen lays out at its design size and scales to the device.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

type Layout = "desktop" | "tablet" | "phone";

const DESIGN: Record<Exclude<Layout, "phone">, { w: number; h: number }> = {
  desktop: { w: 1440, h: 900 },
  tablet: { w: 1024, h: 768 },
};

export default function SlackSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(140px,18vw,300px)] pt-[clamp(40px,5vw,96px)]">
      <motion.div {...up} className="flex flex-col items-center text-center">
        <h2 className="max-w-[760px] text-[clamp(32px,4.2vw,60px)] font-bold leading-[1.06] tracking-[-2px] text-ink">
          Ask @Payloat what
          <br />
          your agents spent.
        </h2>
        <p className="mt-4 max-w-[520px] text-[16px] leading-[1.5] text-sub">
          Anyone in your workspace can ask. Managers, finance, the owner.
          Payloat answers with the number, the graph, and what needs a look,
          right where the question was asked.
        </p>
      </motion.div>

      {/* ---- MacBook Pro, 1024px and up ---- */}
      <motion.div
        {...up}
        transition={{ ...up.transition, delay: 0.1 }}
        className="relative mx-auto mt-14 hidden w-full max-w-[1100px] min-[1024px]:block"
      >
        <div className="pt-[2%]" style={{ perspective: 2400, perspectiveOrigin: "50% 35%" }}>
          <div
            className="relative mx-auto w-[90%]"
            style={{ transform: "rotateY(14deg) rotateX(4deg)", transformStyle: "preserve-3d" }}
          >
            <MacBook>
              <ScaledScreen design={DESIGN.desktop}>
                <Desktop layout="desktop" />
              </ScaledScreen>
            </MacBook>
          </div>
        </div>
        <Callout1 className="absolute -left-2 top-[42%] z-10" delay={0.35} />
        <Callout2 className="absolute bottom-[18%] right-2 z-10" delay={0.5} />
      </motion.div>

      {/* ---- iPad, 700px to 1023px ---- */}
      <motion.div
        {...up}
        transition={{ ...up.transition, delay: 0.1 }}
        className="mx-auto mt-12 hidden w-full max-w-[760px] min-[700px]:block min-[1024px]:hidden"
      >
        <IPad>
          <ScaledScreen design={DESIGN.tablet}>
            <Desktop layout="tablet" />
          </ScaledScreen>
        </IPad>
        <div className="mt-6 grid gap-3 min-[700px]:grid-cols-2">
          <Callout1 delay={0.2} />
          <Callout2 delay={0.3} />
        </div>
      </motion.div>

      {/* ---- iPhone, below 700px ---- */}
      <motion.div
        {...up}
        transition={{ ...up.transition, delay: 0.1 }}
        className="mx-auto mt-10 w-full max-w-[380px] min-[700px]:hidden"
      >
        <Phone />
        <div className="mt-6 flex flex-col gap-3">
          <Callout1 delay={0.2} />
          <Callout2 delay={0.3} />
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- callouts (Ramp anatomy: lime tile + two-line label) ---------- */

function Callout({
  className = "",
  delay,
  icon,
  children,
}: {
  className?: string;
  delay: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      className={`flex items-center gap-4 rounded-[18px] bg-white p-3 pr-6 shadow-[0_18px_50px_rgba(0,0,0,0.14)] ${className}`}
    >
      <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[12px] bg-[#d6f251]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {icon}
        </svg>
      </span>
      <span className="text-[16px] font-medium leading-[1.3] tracking-[-0.3px] text-ink">{children}</span>
    </motion.div>
  );
}

function Callout1({ className, delay }: { className?: string; delay: number }) {
  return (
    <Callout className={className} delay={delay} icon={<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />}>
      The number, the graph,
      <br />
      and what to look at
    </Callout>
  );
}

function Callout2({ className, delay }: { className?: string; delay: number }) {
  return (
    <Callout className={className} delay={delay} icon={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />}>
      Every agent, every charge,
      <br />
      answered in seconds
    </Callout>
  );
}

/* ---------- devices ---------- */

/* MacBook Pro: thin black bezel with the notch, gradient screen, then the
   aluminum deck with its center lip. */
function MacBook({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      <div
        className="relative rounded-[16px] p-[10px] pb-[12px]"
        style={{
          background: "linear-gradient(180deg,#2c2c30 0%,#0e0e10 30%,#0e0e10 100%)",
          boxShadow: "0 60px 120px rgba(20,40,120,0.30), 0 24px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      >
        <div className="relative aspect-[1440/900] w-full overflow-hidden rounded-[8px] bg-[#0a1fd2]">
          <Wallpaper />
          {children}
          <div className="absolute left-1/2 top-0 h-[14px] w-[120px] -translate-x-1/2 rounded-b-[8px] bg-[#0e0e10]" />
          <Sheen />
        </div>
      </div>
      <div
        className="relative mx-auto h-[16px] w-[106%] -translate-x-[3%] rounded-b-[12px]"
        style={{
          background: "linear-gradient(180deg,#ececee 0%,#c8c8cc 55%,#8f8f95 100%)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div className="absolute left-1/2 top-0 h-[6px] w-[110px] -translate-x-1/2 rounded-b-[6px]" style={{ background: "linear-gradient(180deg,#b5b5ba,#d9d9dc)" }} />
      </div>
    </div>
  );
}

/* iPad: even dark bezel, camera dot, gradient screen. */
function IPad({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[26px] p-[18px]"
      style={{
        background: "linear-gradient(160deg,#2a2a2e 0%,#101012 45%,#1c1c1f 100%)",
        boxShadow: "0 40px 90px rgba(20,40,120,0.25), 0 16px 36px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.10)",
      }}
    >
      <span className="absolute left-1/2 top-[7px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#2f3a55]" />
      <div className="relative aspect-[1024/768] w-full overflow-hidden rounded-[12px] bg-[#0a1fd2]">
        <Wallpaper />
        {children}
        <Sheen />
      </div>
    </div>
  );
}

/* iPhone: the site's PhoneMock, sized to its column; Slack at natural size. */
function Phone() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(340);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full">
      <PhoneMock width={w} frame="black" screenBg="#0a1fd2">
        <Wallpaper />
        <div className="absolute inset-0 pt-[52px]" style={{ width: phoneScreenWidth(w) }}>
          <SlackWindow layout="phone" />
        </div>
      </PhoneMock>
    </div>
  );
}

function Wallpaper() {
  return <Image src="/slack-gradient.jpg" alt="" fill sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" />;
}

function Sheen() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "linear-gradient(115deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.03) 22%,transparent 40%)" }}
    />
  );
}

/* Lays children out at the design size and scales them to the box
   (measured, since CSS cannot divide container units by pixels). */
function ScaledScreen({ design, children }: { design: { w: number; h: number }; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / design.w);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [design.w]);
  return (
    <div ref={ref} className="absolute inset-0">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: design.w, height: design.h, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
      >
        {children}
      </div>
    </div>
  );
}

/* A macOS desktop: menu bar, the Slack window floating on the wallpaper. */
function Desktop({ layout }: { layout: Exclude<Layout, "phone"> }) {
  const inset = layout === "desktop" ? { top: 54, x: 44, bottom: 40 } : { top: 30, x: 24, bottom: 24 };
  return (
    <div className="relative h-full w-full">
      {layout === "desktop" && (
        <div className="absolute inset-x-0 top-0 flex h-[26px] items-center justify-between px-4 text-[12px] font-medium text-white/90" style={{ backgroundColor: "rgba(0,0,0,0.18)" }}>
          <span className="flex items-center gap-4">
            <span></span>
            <span className="font-bold">Slack</span>
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Window</span>
            <span>Help</span>
          </span>
          <span className="flex items-center gap-3">
            <span>Tue Sep 9</span>
            <span>9:41 AM</span>
          </span>
        </div>
      )}
      <div
        className="absolute overflow-hidden rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        style={{ top: inset.top, left: inset.x, right: inset.x, bottom: inset.bottom }}
      >
        <SlackWindow layout={layout} />
      </div>
    </div>
  );
}

/* ---------- the Slack window, real Slack colors ---------- */

const AUBERGINE = "#3f0e40";
const AUBERGINE_DARK = "#350d36";
const INK = "#1d1c1d";
const MUTED = "#616061";

const CHANNELS = ["general", "finance", "agents", "ops", "kitchen"];

function SlackWindow({ layout }: { layout: Layout }) {
  const phone = layout === "phone";
  return (
    <div className="flex h-full w-full flex-col bg-white" style={{ fontFamily: "var(--font-ios)", color: INK }}>
      {/* title bar with traffic lights + search */}
      <div className="flex h-[40px] shrink-0 items-center px-3" style={{ backgroundColor: AUBERGINE_DARK }}>
        {!phone && (
          <span className="mr-4 flex items-center gap-2">
            <span className="h-[12px] w-[12px] rounded-full bg-[#ff5f57]" />
            <span className="h-[12px] w-[12px] rounded-full bg-[#febc2e]" />
            <span className="h-[12px] w-[12px] rounded-full bg-[#28c840]" />
          </span>
        )}
        {!phone && (
          <span className="mr-6 flex items-center gap-2 text-white/60">
            <Glyph d="M15 6l-6 6 6 6" />
            <Glyph d="M9 6l6 6-6 6" />
            <Glyph d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          </span>
        )}
        <div className="flex h-[26px] flex-1 items-center gap-2 rounded-[6px] px-3 text-[12px] text-white/75" style={{ backgroundColor: "rgba(255,255,255,0.18)", maxWidth: phone ? undefined : 520 }}>
          <Glyph d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5" size={12} />
          Search Payloat
        </div>
        {!phone && (
          <span className="ml-auto flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] text-white/80" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>?</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* rail (desktop only) */}
        {layout === "desktop" && (
          <div className="flex w-[68px] shrink-0 flex-col items-center gap-4 pt-4" style={{ backgroundColor: AUBERGINE_DARK }}>
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[9px] bg-white">
              <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] rounded-[9px]" />
            </span>
            {[
              ["Home", "M4 11 12 4l8 7v9H4z"],
              ["DMs", "M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z"],
              ["Activity", "M15 17H9m8-3V11a5 5 0 0 0-10 0v3l-2 3h14l-2-3Z"],
              ["Later", "M6 4h12v16l-6-4-6 4z"],
              ["More", "M5 12h.01M12 12h.01M19 12h.01"],
            ].map(([label, d], i) => (
              <span key={label} className={`flex flex-col items-center gap-1 text-[10px] ${i === 0 ? "text-white" : "text-white/70"}`}>
                <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] ${i === 0 ? "bg-white/25" : ""}`}>
                  <Glyph d={d} size={16} />
                </span>
                {label}
              </span>
            ))}
            <Image src="/zeradam.jpg" alt="Zeradam" width={28} height={28} className="mb-4 mt-auto h-[28px] w-[28px] rounded-[6px] object-cover" />
          </div>
        )}

        {/* sidebar (desktop + tablet) */}
        {!phone && (
          <div className="flex w-[228px] shrink-0 flex-col text-white" style={{ backgroundColor: AUBERGINE }}>
            <div className="flex h-[48px] items-center justify-between border-b border-white/10 px-4">
              <span className="flex items-center gap-1.5 text-[15px] font-bold">
                Payloat
                <Glyph d="M6 9l6 6 6-6" size={11} />
              </span>
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[#3f0e40]">
                <Glyph d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" size={13} />
              </span>
            </div>
            <div className="px-3 pt-3 text-[14px]">
              <SideRow label="Threads" icon="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
              <SideRow label="Drafts & sent" icon="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              <p className="mt-3 flex items-center gap-1 px-2 pb-1 text-[13px] text-white/70">
                <Glyph d="M6 9l6 6 6-6" size={10} />
                Channels
              </p>
              {CHANNELS.map((c) => (
                <SideRow key={c} label={c} hash active={c === "agents"} />
              ))}
              <p className="mt-3 flex items-center gap-1 px-2 pb-1 text-[13px] text-white/70">
                <Glyph d="M6 9l6 6 6-6" size={10} />
                Direct messages
              </p>
              <SideRow label="Zeradam" avatar="/zeradam.jpg" you />
              <SideRow label="Maya Chen" initial="M" />
              <SideRow label="Payloat" avatar="/payloat-app-icon-v2.png" />
              <p className="mt-3 flex items-center gap-1 px-2 pb-1 text-[13px] text-white/70">
                <Glyph d="M6 9l6 6 6-6" size={10} />
                Apps
              </p>
              <SideRow label="Payloat" avatar="/payloat-app-icon-v2.png" />
            </div>
          </div>
        )}

        {/* channel pane */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex h-[48px] shrink-0 items-center justify-between border-b border-black/10 px-4">
            <span className="flex items-center gap-1 text-[15px] font-bold" style={{ color: INK }}>
              # agents
              <Glyph d="M6 9l6 6 6-6" size={11} />
            </span>
            {!phone && (
              <div className="flex items-center gap-2 text-[12px]" style={{ color: MUTED }}>
                <span className="flex items-center gap-1.5 rounded-[6px] border border-black/10 px-2 py-1">
                  <span className="flex -space-x-1.5">
                    <Image src="/zeradam.jpg" alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-[4px] border border-white object-cover" />
                    <span className="h-[18px] w-[18px] rounded-[4px] border border-white bg-[#bcd1f7]" />
                    <span className="h-[18px] w-[18px] rounded-[4px] border border-white bg-[#f5c6a5]" />
                  </span>
                  12
                </span>
                <span className="flex items-center gap-1 rounded-[6px] border border-black/10 px-2 py-1">
                  <Glyph d="M3 18v-6a9 9 0 0 1 18 0v6M3 18h4v-5H3m14 5h4v-5h-4" size={12} />
                  Huddle
                </span>
              </div>
            )}
          </div>

          <div className={`flex min-h-0 flex-1 flex-col justify-end overflow-hidden ${phone ? "px-3 pb-3" : "px-5 pb-4"}`}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-black/10" />
              <span className="rounded-full border border-black/10 px-3 py-1 text-[12px] font-semibold" style={{ color: INK }}>
                Today
              </span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            {/* Zeradam asks */}
            <div className="flex items-start gap-3">
              <Image src="/zeradam.jpg" alt="Zeradam" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px] object-cover" />
              <div className="min-w-0">
                <p className="text-[14px] leading-[1.2]">
                  <span className="font-bold">Zeradam</span>
                  <span className="ml-2 text-[11px]" style={{ color: MUTED }}>9:41 AM</span>
                </p>
                <p className="mt-0.5 text-[14px] leading-[1.4]">
                  <span className="rounded-[3px] px-1 py-px font-medium text-[#1264a3]" style={{ backgroundColor: "rgba(29,155,209,0.12)" }}>@Payloat</span>{" "}
                  how much have our agents spent this month?
                </p>
              </div>
            </div>

            {/* Payloat answers */}
            <div className="mt-3 flex items-start gap-3">
              <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px]" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-[1.2]">
                  <span className="font-bold">Payloat</span>
                  <span className="ml-1.5 rounded-[3px] bg-black/[0.08] px-1 py-px text-[9px] font-semibold uppercase tracking-[0.04em]" style={{ color: MUTED }}>App</span>
                  <span className="ml-2 text-[11px]" style={{ color: MUTED }}>9:41 AM</span>
                </p>
                <p className="mt-0.5 text-[14px] leading-[1.4]">
                  September so far across <span className="font-semibold">4 agents</span>. Two things to look at, under the chart.
                </p>
                <SpendCard layout={layout} />
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {["Open in Payloat", "By agent", "Receipts"].map((b, i) => (
                    <span
                      key={b}
                      className={`rounded-[6px] border px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "border-[#007a5a] bg-[#007a5a] text-white" : "border-black/20 bg-white"}`}
                      style={i === 0 ? undefined : { color: INK }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* composer, Slack toolbar anatomy */}
            <div className="mt-4 rounded-[8px] border border-black/25">
              {!phone && (
                <div className="flex items-center gap-3 border-b border-black/[0.06] px-3 py-1.5" style={{ color: MUTED }}>
                  <span className="text-[13px] font-bold">B</span>
                  <span className="text-[13px] italic">I</span>
                  <span className="text-[13px] line-through">S</span>
                  <span className="h-3 w-px bg-black/15" />
                  <Glyph d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" size={12} />
                  <Glyph d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={12} />
                  <Glyph d="M16 18l6-6-6-6M8 6l-6 6 6 6" size={12} />
                </div>
              )}
              <p className="px-3 py-2 text-[14px]" style={{ color: MUTED }}>Message #agents</p>
              <div className="flex items-center justify-between px-2.5 pb-2" style={{ color: MUTED }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/[0.06]">
                    <Glyph d="M12 5v14M5 12h14" size={12} />
                  </span>
                  <span className="text-[12px] font-semibold">Aa</span>
                  <Glyph d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" size={13} />
                  <Glyph d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12v1.5a2.5 2.5 0 0 0 5 0V12a8 8 0 1 0-3 6.2" size={13} />
                </div>
                <span className="flex h-[24px] w-[30px] items-center justify-center rounded-[4px] bg-[#007a5a] text-white">
                  <Glyph d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideRow({
  label,
  hash,
  active,
  avatar,
  initial,
  icon,
  you,
}: {
  label: string;
  hash?: boolean;
  active?: boolean;
  avatar?: string;
  initial?: string;
  icon?: string;
  you?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-[6px] px-2 py-[5px] ${active ? "bg-white" : "text-white/90"}`} style={active ? { color: AUBERGINE } : undefined}>
      {hash && <span className={`w-[10px] text-[14px] ${active ? "opacity-70" : "text-white/60"}`}>#</span>}
      {icon && <Glyph d={icon} size={14} />}
      {avatar && <Image src={avatar} alt="" width={20} height={20} className="h-[20px] w-[20px] rounded-[4px] object-cover" />}
      {initial && <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#bcd1f7] text-[10px] font-semibold" style={{ color: INK }}>{initial}</span>}
      <span className="truncate">{label}</span>
      {you && <span className="text-[12px] text-white/60">you</span>}
    </div>
  );
}

/* ---------- the answer card: Origin forecast anatomy on the gradient ---------- */

/* daily cumulative spend in $K, Sep 1 through today (day 9), then projection */
const SO_FAR = [0, 1.9, 3.2, 3.4, 5.1, 6.0, 7.3, 8.6, 9.2];
const PROJECTED = [9.2, 10.4, 11.1, 12.6, 13.0, 14.4, 15.1, 15.9, 17.2, 17.8, 19.0, 19.6, 20.9, 21.4, 22.6, 23.3, 24.1, 25.2, 25.9, 26.8, 27.1, 27.9];
const MAX = 32;

function SpendCard({ layout }: { layout: Layout }) {
  const phone = layout === "phone";
  const W = phone ? 380 : 720;
  const H = phone ? 190 : layout === "tablet" ? 170 : 200;
  const padL = 14;
  const padR = phone ? 46 : 60;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const days = 30;
  const x = (day: number) => padL + (day / days) * plotW;
  const y = (k: number) => padT + plotH - (k / MAX) * plotH;

  const solid = SO_FAR.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const dashed = PROJECTED.map((v, i) => `${x(SO_FAR.length - 1 + i)},${y(v)}`).join(" ");
  const todayX = x(SO_FAR.length - 1);
  const area = `${x(0)},${y(0)} ${solid} ${todayX},${y(0)}`;

  const markers = [
    { day: 4, d: "M12 3v18M6 9l6-6 6 6" },
    { day: 16, d: "M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" },
  ];
  const yTicks = phone ? [0, 16, 32] : [0, 8, 16, 24, 32];
  const xTicks = (
    phone
      ? [
          [0, "SEP 1", "start"],
          [8, "TODAY", "middle"],
          [30, "SEP 30", "end"],
        ]
      : [
          [0, "SEP 1", "start"],
          [8, "TODAY", "middle"],
          [15, "SEP 15", "middle"],
          [22, "SEP 22", "middle"],
          [30, "SEP 30", "end"],
        ]
  ) as [number, string, "start" | "middle" | "end"][];

  return (
    <div className="relative mt-2.5 w-full max-w-[720px] overflow-hidden rounded-[12px] border border-black/10 text-white">
      <Image src="/slack-gradient.jpg" alt="" fill sizes="720px" className="object-cover" />
      <div className="relative p-4">
        <div className={`flex items-start justify-between ${phone ? "pr-1" : "pr-[50px]"}`}>
          <div>
            <p className="text-[11px] text-white/75">Spent so far · September</p>
            <p className="font-numeral text-[22px] font-semibold leading-tight tracking-[-0.8px]">$9,190</p>
          </div>
          <div>
            <p className="text-[11px] text-white/75">Projected by Sep 30</p>
            <p className="font-numeral flex items-center gap-1.5 text-[22px] font-semibold leading-tight tracking-[-0.8px]">
              $27,900
              <Glyph d="M7 17 17 7M9 7h8v8" size={14} />
            </p>
            <p className="font-numeral text-[11px] text-white/75">+$18,710 (204%) · 4 agents</p>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-auto w-full" aria-hidden>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={padL} x2={padL + plotW} y1={y(f * MAX)} y2={y(f * MAX)} stroke="rgba(255,255,255,0.14)" strokeDasharray="2 4" />
          ))}
          {[5, 10, 15, 20, 25].map((d) => (
            <line key={d} x1={x(d)} x2={x(d)} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.09)" strokeDasharray="2 4" />
          ))}
          <polygon points={area} fill="rgba(255,255,255,0.28)" />
          <polyline points={solid} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <line x1={todayX} x2={todayX} y1={padT - 4} y2={padT + plotH} stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={todayX} cy={padT - 4} r="3" fill="#ffffff" />
          <polyline points={dashed} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" strokeLinecap="round" />
          {markers.map((m) => {
            const mx = x(m.day);
            const my = m.day < SO_FAR.length ? y(SO_FAR[m.day]) : y(PROJECTED[m.day - (SO_FAR.length - 1)]);
            return (
              <g key={m.day}>
                <line x1={mx} x2={mx} y1={my} y2={padT + plotH} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={mx} cy={my} r="13" fill="#ffffff" />
                <path d={m.d} transform={`translate(${mx - 7} ${my - 7}) scale(0.58)`} fill="none" stroke="#0a1fd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
          {yTicks.map((k) => (
            <text key={k} x={W - padR + 12} y={y(k) + 4} fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing="1">
              ${k}K
            </text>
          ))}
          {xTicks.map(([d, l, a]) => (
            <text key={l} x={x(d)} y={H - 8} textAnchor={a} fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing="1.5">
              {l}
            </text>
          ))}
        </svg>

        <div className={`mt-1.5 grid gap-3 border-t border-white/20 pt-2.5 ${phone ? "" : "grid-cols-[1fr_1.15fr] gap-5"}`}>
          {!phone && (
            <div className="flex flex-col gap-1 text-[12px]">
              {[
                ["Procurement", "$4,120"],
                ["Software & seats", "$2,860"],
                ["Ops", "$1,450"],
                ["Travel", "$760"],
              ].map(([n, v]) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-white/85">{n}</span>
                  <span className="font-numeral font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1.5 text-[12px] leading-[1.35]">
            <p className="flex items-start gap-2">
              <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#ffb4a2]" />
              Procurement went $16.50 over its cap at WebstaurantStore.
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#d6f251]" />
              One Instacart receipt is still missing, 3 days old.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Glyph({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
