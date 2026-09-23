"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/**
 * The nav, on the Mews anatomy: one full-bleed row flush to the top of
 * every page. The Payloat mark and its wordmark float left a step in
 * from the page's content rail, the items sit centred on the screen, and
 * Sign up floats right as a black pill. Items are plain until hovered,
 * when a box appears behind the item and its panel drops 10px below the
 * bar. The bar rides above every section on every page.
 *
 * It is opaque on every ground, never glass: white with black type over
 * a light section, and pure black with white type and a white Sign up
 * pill over a dark one.
 * The liquid-glass bar that read its ground is parked at
 * design-archive/NavDock-liquid-glass-bar.tsx.txt.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.8 } as const;

/* the hamburger's three bars: where each sits, and where it travels and
   turns to when the menu opens. The middle one has no turn, so it is the
   one that fades. Square ends throughout, no radius anywhere. */
const BARS = [
  { at: 0, shut: 7, turn: 45 },
  { at: 7, shut: 0, turn: 0 },
  { at: 14, shut: -7, turn: -45 },
] as const;

/* one row, flush to the top of the page */
const BAR_H = 76;
const COMPACT_H = 64;
/* the logo steps this far in past the page's own content rail; the
   items ignore it and centre on the screen instead */
const LOGO_PAD = 50;

/* the grid line closing the bar's foot: the site's 1px hairline, each
   skin's own ground carried 20% toward its opposite. The bar sits on a
   ground close to the section's on both skins, so this rule is what
   draws its bottom edge. */
const GRID_DARK = "#4b4b4b";   /* #1e1e1e, 20% toward white */
const GRID_LIGHT = "#bebebe";  /* #eeeeee, 20% toward black */

/* the two grounds the bar can sit over, and the skin it takes on each:
   #eeeeee with black type, or pure black with white type. The dark skin
   sits just below the black sections it rides over, so a grid line at
   its foot is what draws the bar's bottom edge. Sign up
   is the hero's split button, an arrow block against a body, reversed
   on the dark skin so it still reads there. */
type Ground = "light" | "dark";
const SKIN: Record<Ground, {
  bg: string; fg: string; dim: string; rule: string; hover: string;
  arrow: string; arrowFg: string; cta: string; ctaFg: string; mark: string; line: string;
}> = {
  light: {
    bg: "#eeeeee",
    fg: "#0a0a0a",
    dim: "rgba(10,10,10,0.6)",
    rule: "rgba(10,10,10,0.12)",
    hover: "rgba(10,10,10,0.05)",
    /* Sign up is the hero's Get started for free: an #0a0a0a arrow
       block against an #1e1e1e body */
    arrow: "#0a0a0a",
    arrowFg: "#ffffff",
    cta: "#1e1e1e",
    ctaFg: "#ffffff",
    mark: "/payloat-mark.svg",
    line: GRID_LIGHT,
  },
  dark: {
    bg: "#000000",
    fg: "#ffffff",
    dim: "rgba(255,255,255,0.65)",
    rule: "rgba(255,255,255,0.16)",
    hover: "rgba(255,255,255,0.1)",
    /* the same button reversed, so it still reads on the black bar */
    arrow: "#eeeeee",
    arrowFg: "#0a0a0a",
    cta: "#ffffff",
    ctaFg: "#0a0a0a",
    mark: "/payloat-mark-white.svg",
    line: GRID_DARK,
  },
};
const TONE = "transition-[color,background-color,border-color] duration-200 ease-out";

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

/* the page frame, so the mark lands on the same rail every section's
   content starts from */
const FRAME = "mx-auto w-full max-w-[1860px]";
const INNER = "px-[clamp(20px,1.7vw,32px)]";

export default function NavDock({ skin: pinned, ..._props }: {
  /** pin the bar to one skin and ignore the section behind it. Without
      it the bar reads its ground and flips on its own. */
  skin?: Ground;
  /** older call sites pass these; the bar reads its ground now, so they
      are accepted and ignored */
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

  /* ---- the ground under the bar, sampled on scroll. The bar spans the
     full width, so a section that is black under one part of the row and
     light under another would flip the whole thing off one reading. It
     takes three, one under each part: the mark at the left, the items at
     the centre, Sign up at the right. ---- */
  const headerRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barH = useRef(BAR_H);
  const [logoGround, setLogoGround] = useState<Ground>("light");
  const [itemsGround, setItemsGround] = useState<Ground>("light");
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
      const top = stack[0] as HTMLElement | undefined;
      /* a section can name the skin it wants the bar to wear over it, for
         grounds whose luminance reads the wrong way: the green statement
         band is dark but wants the light bar. Asked before any colour is
         read, because that band ends in a fade whose gradient would
         otherwise answer first. */
      const asked = top?.closest<HTMLElement>("[data-nav-skin]")?.dataset.navSkin;
      if (asked === "light" || asked === "dark") return asked;
      let el = top;
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
      const go = read(mid('[data-cell="logo"]', 0.05), y);
      if (go !== null) setLogoGround((c) => (c === go ? c : go));
      const gi = read(mid('[data-cell="nav"]', 0.5), y);
      if (gi !== null) setItemsGround((c) => (c === gi ? c : gi));
      const gc = read(mid('[data-cell="cta"]', 0.92), y);
      if (gc !== null) setCtaGround((c) => (c === gc ? c : gc));
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
  /* the bar turns black only when all three readings agree it is over
     black, so it never paints a ground the section behind it lacks. A
     pinned skin overrides the readings outright. */
  const sampled = logoGround === "dark" && itemsGround === "dark" && ctaGround === "dark";
  const solid = pinned ? pinned === "dark" : sampled;
  const S = SKIN[solid ? "dark" : "light"];

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
  const H = collapsed ? COMPACT_H : BAR_H;
  barH.current = H;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 ${TONE}`}
      style={{ height: H, zIndex: 9999, backgroundColor: S.bg, color: S.fg }}
      onMouseLeave={() => {
        setHovered(null);
        setActive(null);
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: S.line }}
        aria-hidden
      />

      <div className={`relative ${FRAME}`}>
        {/* ---- the full bar ---- */}
        {!collapsed && (
          <>
            {/* the row: mark and wordmark left, the items centred on the
                screen, Sign up floated right */}
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
                <Lockup skin={S} />
              </Link>

              {/* the frame is centred and its padding symmetric, so the
                  row's centre is the screen's centre at every width */}
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
                    className="relative flex h-10 items-center gap-1.5 whitespace-nowrap px-[clamp(10px,1.1vw,18px)] text-[16px] font-medium tracking-[-0.2px]"
                  >
                    {/* the box, only while hovered */}
                    <AnimatePresence>
                      {highlight === item && (
                        <motion.span
                          layoutId="navHoverBox"
                          className="absolute inset-0"
                          style={{ backgroundColor: S.hover, border: `1px solid ${S.rule}` }}
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
                  className="inline-flex h-[42px] items-stretch text-[14px] font-semibold tracking-[-0.3px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span
                    className={`flex w-[42px] items-center justify-center ${TONE}`}
                    style={{ backgroundColor: S.arrow }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M5 2.5 10.5 8 5 13.5" stroke={S.arrowFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span
                    className={`flex items-center px-5 ${TONE}`}
                    style={{ backgroundColor: S.cta, color: S.ctaFg }}
                  >
                    Sign up
                  </span>
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
                      backgroundColor: S.bg,
                      color: S.fg,
                      border: `1px solid ${S.rule}`,
                      "--nav-fg": S.fg,
                      "--nav-label": S.dim,
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
            <Link
              href="/"
              aria-label="Payloat home"
              className="flex items-center gap-[11px] transition-opacity hover:opacity-80"
            >
              <Lockup skin={S} />
            </Link>
            <div className="relative">
              {menuOpen && (
                <div className="fixed inset-0 cursor-default" onClick={() => setMenuOpen(false)} />
              )}
              {/* the hamburger: three square-ended bars, no box. Open,
                  the outer two close into a cross and the middle goes. */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="relative -mr-1 flex h-[42px] w-[42px] items-center justify-center"
              >
                <span className="relative block h-[16px] w-[24px]" aria-hidden>
                  {BARS.map((b) => (
                    <motion.span
                      key={b.at}
                      className={`absolute left-0 block h-[2px] w-full ${TONE}`}
                      style={{ top: b.at, backgroundColor: S.fg, borderRadius: 0 }}
                      initial={false}
                      animate={
                        menuOpen
                          ? { y: b.shut, rotate: b.turn, opacity: b.turn === 0 ? 0 : 1 }
                          : { y: 0, rotate: 0, opacity: 1 }
                      }
                      transition={SPRING}
                    />
                  ))}
                </span>
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
                        backgroundColor: S.bg,
                        color: S.fg,
                        border: `1px solid ${S.rule}`,
                        maxHeight: "calc(100vh - 100px)",
                        "--nav-fg": S.fg,
                        "--nav-label": S.dim,
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

                    <div className="mt-3 border-t pt-4" style={{ borderColor: S.rule }}>
                      <Link
                        href="/signup"
                        className="flex h-11 w-full items-stretch text-[15px] font-semibold tracking-[-0.5px]"
                      >
                        <span className="flex w-11 items-center justify-center" style={{ backgroundColor: S.arrow }}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M5 2.5 10.5 8 5 13.5" stroke={S.arrowFg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="flex flex-1 items-center justify-center" style={{ backgroundColor: S.cta, color: S.ctaFg }}>
                          Sign up
                        </span>
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

/* The mark and its wordmark, one component so the full bar and the
   compact one render exactly the same lockup. 26px semibold with the
   tracking pulled in sets the wordmark's cap height at about 55% of the
   mark's, the ratio the mark-plus-name lockups on Vercel, Linear,
   Cursor and Aboard all sit at. */
function Lockup({ skin }: { skin: (typeof SKIN)[Ground] }) {
  return (
    <>
      <Image
        src={skin.mark}
        alt=""
        width={622}
        height={910}
        priority
        className="h-[34px] w-auto"
      />
      <span
        className={`text-[26px] font-semibold leading-none tracking-[-0.6px] ${TONE}`}
        style={{ color: skin.fg }}
      >
        payloat
      </span>
    </>
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
