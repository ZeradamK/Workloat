"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/**
 * The nav, on the Mews anatomy: one full-bleed row flush to the top of
 * every page. The Payloat mark and wordmark float hard left, the items
 * sit immediately beside them, and Sign up floats right. Items are
 * plain until hovered, when a box appears behind the item and its panel
 * drops 10px below the bar.
 *
 * The bar has no ground of its own: #eeeeee at 30% over a backdrop
 * blur, with an SVG displacement map bending that backdrop at the top
 * and bottom edges, so sections refract as they pass under it. It sits
 * above every section on every page.
 *
 * The previous floating liquid-glass bar is parked at
 * design-archive/NavDock-liquid-glass-bar.tsx.txt.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.8 } as const;

/* one row, flush to the top of the page */
const BAR_H = 76;
const COMPACT_H = 64;
/* the logo steps this far in past the page's own content rail; the
   items ignore it and centre on the screen instead */
const LOGO_PAD = 50;

/* the glass: #eeeeee at 30%, the same on every ground */
const TINT = "rgba(238,238,238,0.30)";
const BLUR = "blur(14px) saturate(1.7) brightness(1.02)";
const PANEL_BLUR = "blur(22px) saturate(1.7)";

/* the displacement map behind the refraction: neutral through the
   middle, pushing the backdrop down at the top edge and up at the foot,
   the way light bends at the rim of a pane of glass */
const MAP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="76" viewBox="0 0 8 76">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" stop-color="rgb(128,255,128)"/>' +
  '<stop offset="0.14" stop-color="rgb(128,176,128)"/>' +
  '<stop offset="0.34" stop-color="rgb(128,128,128)"/>' +
  '<stop offset="0.66" stop-color="rgb(128,128,128)"/>' +
  '<stop offset="0.86" stop-color="rgb(128,80,128)"/>' +
  '<stop offset="1" stop-color="rgb(128,0,128)"/>' +
  "</linearGradient></defs>" +
  '<rect width="8" height="76" fill="url(#g)"/></svg>';
const MAP = `data:image/svg+xml;utf8,${encodeURIComponent(MAP_SVG)}`;

type PanelKey = "Product" | "Features" | "Pricing" | "Contact";

/* key order is the bar's item order */
const PANEL_DIMS: Record<PanelKey, { w: number }> = {
  Features: { w: 400 },
  Product: { w: 356 },
  Pricing: { w: 380 },
  Contact: { w: 380 },
};

/** Product sub-items: one per page. */
const PRODUCT_ITEMS = [
  { label: "Bank Integration", href: "/integration" },
  { label: "Investing with agents", href: "/product" },
  { label: "Personal finance", href: "/consumer" },
];

/** Features sub-items: one per audience page. */
const SOLUTION_ITEMS = [
  { label: "Financial teams", href: "/finance-teams" },
  { label: "Enterprise", href: "/enterprise" },
];

const PRICING_ITEMS = [
  { title: "Starter", price: "$0/mo" },
  { title: "Team", price: "$49/mo" },
  { title: "Business", price: "$149/mo" },
  { title: "Enterprise", price: "Custom" },
];

const CONTACT_ITEMS = [
  { title: "Support", detail: "hello@payloat.com", href: "/contact#support" },
  { title: "Sales", detail: "", href: "/contact#sales" },
  { title: "Press", detail: "", href: "/contact#press" },
  { title: "Help center", detail: "", href: "/#faq" },
];

/* Pricing is LOCKED for now: fully built (panel, items, collapsed tree)
   but hidden from every screen size. Flip to true to restore it. */
const SHOW_PRICING = false;

const NAV = (Object.keys(PANEL_DIMS) as PanelKey[]).filter(
  (k) => SHOW_PRICING || k !== "Pricing",
);

/** main nav items with a page of their own */
const PAGE_ROUTES: Partial<Record<PanelKey, string>> = {
  Product: "/product",
  Features: "/finance-teams",
  Contact: "/contact",
};

/* the bar takes no color from the ground, only its ink: black type and
   hairlines over light sections, white over dark ones */
type Ground = "light" | "dark";
const INK: Record<Ground, {
  fg: string;
  dim: string;
  rule: string;
  hover: string;
  glow: string;
  panel: string;
  cta: string;
  ctaFg: string;
}> = {
  light: {
    fg: "#0a0a0a",
    dim: "rgba(10,10,10,0.6)",
    rule: "rgba(10,10,10,0.12)",
    hover: "rgba(10,10,10,0.05)",
    glow: "rgba(255,255,255,0.55)",
    panel: "rgba(240,240,238,0.86)",
    cta: "#0a0a0a",
    ctaFg: "#eeeeee",
  },
  dark: {
    fg: "#ffffff",
    dim: "rgba(255,255,255,0.7)",
    rule: "rgba(255,255,255,0.16)",
    hover: "rgba(255,255,255,0.1)",
    glow: "rgba(255,255,255,0.2)",
    panel: "rgba(18,18,18,0.82)",
    cta: "#eeeeee",
    ctaFg: "#0a0a0a",
  },
};

/* the page frame, so the mark lands on the same rail every section's
   content starts from */
const FRAME = "mx-auto w-full max-w-[1860px]";
const INNER = "px-[clamp(20px,1.7vw,32px)]";
const TONE = "transition-[color,background-color,border-color] duration-200 ease-out";

export default function NavDock(_props: {
  /** older call sites pass these; the bar reads its ground on every page
      now, so they are accepted and ignored */
  forceDark?: boolean;
  introChoreo?: boolean;
  logoSrc?: string;
  logoLightSrc?: string;
  surface?: string;
  ctaOutline?: boolean;
}) {
  void _props;
  const router = useRouter();
  const [active, setActive] = useState<PanelKey | null>(null);
  const [hovered, setHovered] = useState<PanelKey | null>(null);

  /* ---- the ground under the bar, sampled on scroll. The bar has no
     ground of its own and spans the full width, so a section that is
     light on one side and dark on the other would flip the whole row
     off one reading. It takes three, one under each of the row's parts:
     the logo at the left, the items at the centre, Sign up at the
     right. ---- */
  const headerRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barH = useRef(BAR_H);
  const [logoGround, setLogoGround] = useState<Ground>("light");
  const [ground, setGround] = useState<Ground>("light");
  const [ctaGround, setCtaGround] = useState<Ground>("light");
  useEffect(() => {
    const header = headerRef.current;
    const lum = (c: string): number | null => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (m) {
        if (m[4] !== undefined && Number(m[4]) < 0.5) return null;
        return (0.2126 * Number(m[1]) + 0.7152 * Number(m[2]) + 0.0722 * Number(m[3])) / 255;
      }
      const k = c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
      if (k) {
        if (k[4] !== undefined && Number(k[4]) < 0.5) return null;
        return 0.2126 * Number(k[1]) + 0.7152 * Number(k[2]) + 0.0722 * Number(k[3]);
      }
      return null;
    };
    const toGround = (l: number): Ground => (l >= 0.5 ? "light" : "dark");
    /* the ground at one point under the bar */
    const read = (x: number, y: number): Ground | null => {
      const stack = document.elementsFromPoint(x, y).filter((el) => !header?.contains(el));
      let el = stack[0] as HTMLElement | undefined;
      while (el && el !== document.documentElement) {
        const cs = getComputedStyle(el);
        const l = lum(cs.backgroundColor);
        if (l !== null) return toGround(l);
        if (cs.backgroundImage.includes("gradient")) {
          const stops = cs.backgroundImage.match(/(?:rgba?|color)\([^)]*\)/g) ?? [];
          const first = stops[0] ? lum(stops[0]) : null;
          const last = stops[stops.length - 1] ? lum(stops[stops.length - 1]) : null;
          if (first !== null && last !== null) {
            const r = el.getBoundingClientRect();
            return toGround((y - r.top) / r.height < 0.5 ? first : last);
          }
        }
        el = el.parentElement ?? undefined;
      }
      return null;
    };
    let raf = 0;
    const sample = () => {
      raf = 0;
      const y = barH.current / 2;
      const row = rowRef.current;
      const mid = (sel: string, fallback: number) => {
        const cell = row?.querySelector<HTMLElement>(sel);
        if (!cell) return window.innerWidth * fallback;
        const r = cell.getBoundingClientRect();
        return r.left + r.width / 2;
      };
      const go = read(mid('[data-cell="logo"]', 0.06), y);
      if (go !== null) setLogoGround((cur) => (cur === go ? cur : go));
      const gl = read(mid('[data-cell="nav"]', 0.5), y);
      if (gl !== null) setGround((cur) => (cur === gl ? cur : gl));
      const gr = read(mid('[data-cell="cta"]', 0.92), y);
      if (gr !== null) setCtaGround((cur) => (cur === gr ? cur : gr));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sample);
    };
    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const I = INK[ground];
  const C = INK[ctaGround];
  /* the wordmark reads against the ground under the logo, which the
     items' reading no longer covers now they sit centred */
  const dark = logoGround === "dark";

  /* ---- collapse: once the row's cells no longer fit the frame, the
     compact Menu nav takes over ---- */
  const needW = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<PanelKey | null>(null);
  useLayoutEffect(() => {
    const check = () => {
      const row = rowRef.current;
      const cell = (n: string) => row?.querySelector<HTMLElement>(`[data-cell="${n}"]`);
      const logo = cell("logo");
      const items = cell("nav");
      const cta = cell("cta");
      if (logo && items && cta) {
        /* the items sit centred, so the wider flank sets the width the
           row needs: that flank's own width on both sides of them */
        const flank = Math.max(logo.offsetWidth + LOGO_PAD, cta.offsetWidth);
        needW.current = items.offsetWidth + flank * 2 + 96;
      }
      const gutter = Math.min(32, Math.max(20, window.innerWidth * 0.017));
      const avail = Math.min(1860, window.innerWidth) - gutter * 2;
      setCollapsed(needW.current > avail || window.innerWidth < 1000);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  barH.current = collapsed ? COMPACT_H : BAR_H;
  useEffect(() => {
    if (!collapsed) {
      setMenuOpen(false);
      setOpenSection(null);
    }
  }, [collapsed]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setActive(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const highlight = hovered ?? active;
  const dims = active ? PANEL_DIMS[active] : null;
  const wordmark = dark ? "/payloat-wordmark-white.svg" : "/payloat-wordmark-black.svg";
  const H = collapsed ? COMPACT_H : BAR_H;

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0"
      style={{ height: H, zIndex: 9999 }}
      onMouseLeave={() => {
        setHovered(null);
        setActive(null);
      }}
    >
      {/* ---- the glass plate: a tint with no ground of its own, the
          backdrop blurred under it, then bent at the bar's two edges so
          sections refract as they scroll past ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: TINT,
            backdropFilter: BLUR,
            WebkitBackdropFilter: BLUR,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "url(#navRefract)",
            WebkitBackdropFilter: "url(#navRefract)",
          }}
        />
        {/* the rim: a bright line along the top, a hairline at the foot */}
        <div
          className={`absolute inset-0 ${TONE}`}
          style={{ boxShadow: `inset 0 1px 0 ${I.glow}, inset 0 -1px 0 ${I.rule}` }}
        />
      </div>

      {/* the displacement map the refraction reads */}
      <svg aria-hidden focusable="false" className="pointer-events-none absolute h-0 w-0">
        <filter
          id="navRefract"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={MAP}
            result="map"
            preserveAspectRatio="none"
            x="0"
            y="0"
            width="100%"
            height="100%"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className={`relative ${FRAME}`} style={{ color: I.fg }}>
        {/* ---- the full bar ---- */}
        {!collapsed && (
          <>
            {/* the row: mark and wordmark hard left, the items
                immediately beside them, Sign up floated right */}
            <div
              ref={rowRef}
              className={`${INNER} relative flex items-center`}
              style={{ height: BAR_H }}
            >
              <Link
                href="/"
                data-cell="logo"
                aria-label="Payloat home"
                className="flex shrink-0 items-center gap-[11px] transition-opacity hover:opacity-80"
                style={{ marginLeft: LOGO_PAD }}
              >
                <Image
                  src="/payloat-app-icon-v2.png"
                  alt=""
                  width={36}
                  height={36}
                  priority
                  className="h-[34px] w-[34px] rounded-[8px]"
                />
                <Image
                  src={wordmark}
                  alt="Payloat"
                  width={501}
                  height={166}
                  priority
                  className="h-[21px] w-auto"
                />
              </Link>

              <nav
                aria-label="Primary"
                data-cell="nav"
                className="absolute left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-[clamp(2px,0.5vw,10px)]"
              >
                {NAV.map((item) => (
                  <button
                    key={item}
                    type="button"
                    data-item={item}
                    onMouseEnter={() => {
                      setHovered(item);
                      setActive(item);
                    }}
                    onFocus={() => setHovered(item)}
                    onClick={() => {
                      const route = PAGE_ROUTES[item];
                      if (route) {
                        setActive(null);
                        router.push(route);
                        return;
                      }
                      setActive((v) => (v === item ? null : item));
                    }}
                    aria-expanded={active === item}
                    aria-haspopup="true"
                    className="relative flex h-10 items-center gap-1.5 px-[clamp(10px,1.1vw,18px)] text-[16px] font-medium tracking-[-0.2px] whitespace-nowrap"
                  >
                    {/* the box, only while hovered */}
                    <AnimatePresence>
                      {highlight === item && (
                        <motion.span
                          layoutId="navHoverBox"
                          className="absolute inset-0"
                          style={{
                            backgroundColor: I.hover,
                            border: `1px solid ${I.rule}`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.12 } }}
                          transition={SPRING}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{item}</span>
                    <motion.svg
                      className="relative z-10"
                      width="10"
                      height="10"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      initial={false}
                      animate={{ rotate: highlight === item ? 180 : 0 }}
                      transition={SPRING}
                    >
                      <path
                        d="M3 5.5 8 10.5l5-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </button>
                ))}
              </nav>

              <div className="ml-auto flex shrink-0 items-center pl-6" data-cell="cta">
                <Link
                  href="/signup"
                  className={`flex h-[42px] items-center px-[28px] text-[14px] font-semibold tracking-[-0.3px] ${TONE} hover:opacity-85`}
                  style={{ backgroundColor: C.cta, color: C.ctaFg, borderRadius: 999 }}
                >
                  Sign up
                </Link>
              </div>
            </div>

            {/* the item's panel, dropping 10px under the bar, its left
                edge under the item */}
            <AnimatePresence>
              {active && dims && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: [0.25, 0.6, 0.2, 1] }}
                  className="absolute px-4 pb-4 pt-2"
                  style={
                    {
                      top: BAR_H + 10,
                      left: panelLeft(rowRef.current, active),
                      width: dims.w,
                      backgroundColor: I.panel,
                      color: I.fg,
                      border: `1px solid ${I.rule}`,
                      backdropFilter: PANEL_BLUR,
                      WebkitBackdropFilter: PANEL_BLUR,
                      boxShadow: `inset 0 1px 0 ${I.glow}`,
                      "--nav-fg": I.fg,
                      "--nav-label": I.dim,
                    } as React.CSSProperties
                  }
                >
                  {active === "Product" && <ProductPanel />}
                  {active === "Features" && <SolutionsPanel />}
                  {active === "Pricing" && <PricingPanel />}
                  {active === "Contact" && <ContactPanel />}
                </motion.div>
              )}
            </AnimatePresence>
            {/* a bridge so the pointer can cross the 10px gap to the panel */}
            {active && (
              <span className="absolute inset-x-0 h-[12px]" style={{ top: BAR_H }} />
            )}
          </>
        )}

        {/* ---- collapsed: the mark left, the Menu trigger right ---- */}
        {collapsed && (
          <div
            className={`${INNER} flex items-center justify-between`}
            style={{ height: COMPACT_H }}
          >
            {/* the mark alone; the wordmark rides only in the full bar */}
            <Link href="/" aria-label="Payloat home" className="flex items-center">
              <Image
                src="/payloat-app-icon-v2.png"
                alt="Payloat"
                width={36}
                height={36}
                priority
                className="h-[34px] w-[34px] rounded-[8px]"
              />
            </Link>
            <div className="relative">
              {menuOpen && (
                <div className="fixed inset-0 cursor-default" onClick={() => setMenuOpen(false)} />
              )}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                className={`relative flex h-[42px] items-center gap-2 px-5 text-[15px] font-medium ${TONE}`}
                style={{ border: `1px solid ${C.rule}`, color: C.fg }}
              >
                Menu
                <motion.svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  initial={false}
                  animate={{ rotate: menuOpen ? 180 : 0 }}
                  transition={SPRING}
                >
                  <path
                    d="M3 5.5 8 10.5l5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="no-scrollbar absolute right-0 top-[54px] w-[min(340px,calc(100vw-40px))] overflow-y-auto p-5"
                    style={
                      {
                        backgroundColor: I.panel,
                        color: I.fg,
                        border: `1px solid ${I.rule}`,
                        backdropFilter: PANEL_BLUR,
                        WebkitBackdropFilter: PANEL_BLUR,
                        maxHeight: "calc(100vh - 100px)",
                        "--nav-fg": I.fg,
                        "--nav-label": I.dim,
                      } as React.CSSProperties
                    }
                  >
                    {NAV.map((item) => (
                      <div key={item}>
                        <div className="flex w-full items-center justify-between py-3">
                          <button
                            type="button"
                            onClick={() => {
                              const route = PAGE_ROUTES[item];
                              if (route) {
                                setMenuOpen(false);
                                router.push(route);
                                return;
                              }
                              setOpenSection((v) => (v === item ? null : item));
                            }}
                            className="text-left text-[20px] font-medium tracking-[-0.5px]"
                          >
                            {item}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenSection((v) => (v === item ? null : item))}
                            aria-expanded={openSection === item}
                            aria-label={`Toggle ${item} list`}
                            className="flex h-9 w-9 items-center justify-center"
                          >
                            <motion.svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden
                              initial={false}
                              animate={{ rotate: openSection === item ? 180 : 0 }}
                              transition={SPRING}
                            >
                              <path
                                d="M3 5.5 8 10.5l5-5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          </button>
                        </div>
                        <AnimatePresence initial={false}>
                          {openSection === item && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.3, 0.9, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <ul className="pb-3 pl-3">
                                {item === "Product" &&
                                  PRODUCT_ITEMS.map((f) => (
                                    <li key={f.label}>
                                      <Link
                                        href={f.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-1 text-[15px] opacity-80 transition-opacity hover:opacity-100"
                                      >
                                        {f.label}
                                      </Link>
                                    </li>
                                  ))}
                                {item === "Features" &&
                                  SOLUTION_ITEMS.map((f) => (
                                    <li key={f.label}>
                                      <Link
                                        href={f.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-1 text-[15px] opacity-80 transition-opacity hover:opacity-100"
                                      >
                                        {f.label}
                                      </Link>
                                    </li>
                                  ))}
                                {item === "Pricing" &&
                                  PRICING_ITEMS.map((t) => (
                                    <li key={t.title}>
                                      <a
                                        href="#"
                                        className="flex items-baseline justify-between py-1 opacity-80 transition-opacity hover:opacity-100"
                                      >
                                        <span className="text-[15px]">{t.title}</span>
                                        <span className="text-[13px] font-semibold tabular-nums">
                                          {t.price}
                                        </span>
                                      </a>
                                    </li>
                                  ))}
                                {item === "Contact" &&
                                  CONTACT_ITEMS.map((c) => (
                                    <li key={c.title}>
                                      <Link
                                        href={c.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-baseline justify-between py-1 opacity-80 transition-opacity hover:opacity-100"
                                      >
                                        <span className="text-[15px]">{c.title}</span>
                                        {c.detail && <span className="text-[12px]">{c.detail}</span>}
                                      </Link>
                                    </li>
                                  ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    <div className="mt-3 border-t pt-4" style={{ borderColor: I.rule }}>
                      <Link
                        href="/signup"
                        className="flex h-11 w-full items-center justify-center text-[15px] font-semibold tracking-[-0.5px]"
                        style={{ backgroundColor: I.cta, color: I.ctaFg, borderRadius: 999 }}
                      >
                        Sign up
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* where an item's panel opens: under that item's cell, so the panel's
   left edge lines up with the cell's left edge */
function panelLeft(row: HTMLDivElement | null, item: PanelKey): number {
  const cell = row?.querySelector<HTMLElement>(`[data-item="${item}"]`);
  if (!cell || !row) return 0;
  return cell.getBoundingClientRect().left - row.getBoundingClientRect().left;
}

/* ---------- the panels ---------- */

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] [color:var(--nav-label)]">{children}</p>;
}

const bigLink =
  "block text-[26px] font-medium leading-[1.55] tracking-[-0.02em] [color:var(--nav-fg)] transition-opacity hover:opacity-60";

function ProductPanel() {
  return (
    <div className="w-full px-1 pt-3">
      <PanelLabel>Product</PanelLabel>
      <ul className="mt-2">
        {PRODUCT_ITEMS.map((f) => (
          <li key={f.label}>
            <Link href={f.href} className={bigLink}>
              {f.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SolutionsPanel() {
  return (
    <div className="w-full px-1 pt-3">
      <PanelLabel>Features</PanelLabel>
      <ul className="mt-2">
        {SOLUTION_ITEMS.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={bigLink}>
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactPanel() {
  return (
    <div className="w-full px-1 pt-3">
      <PanelLabel>Contact</PanelLabel>
      <ul className="mt-2">
        {CONTACT_ITEMS.map((c) => (
          <li key={c.title}>
            <Link
              href={c.href}
              className="flex items-baseline justify-between transition-opacity hover:opacity-50"
            >
              <span className="text-[26px] font-medium leading-[1.55] tracking-[-0.02em] [color:var(--nav-fg)]">
                {c.title}
              </span>
              {c.detail && <span className="text-[13px] [color:var(--nav-label)]">{c.detail}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingPanel() {
  return (
    <div className="w-full px-1 pt-3">
      <PanelLabel>Pricing</PanelLabel>
      <ul className="mt-2">
        {PRICING_ITEMS.map((t) => (
          <li key={t.title}>
            <a href="#" className="flex items-baseline justify-between transition-opacity hover:opacity-50">
              <span className="text-[26px] font-medium leading-[1.55] tracking-[-0.02em] [color:var(--nav-fg)]">
                {t.title}
              </span>
              <span className="text-[15px] font-semibold tabular-nums [color:var(--nav-fg)]">
                {t.price}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
