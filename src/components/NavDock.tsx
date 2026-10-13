"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import BrickMorph from "./BrickMorph";
import { mono } from "./monoFont";

/**
 * The nav, on the Mews anatomy: one full-bleed row flush to the top of
 * every page. The Workloat mark and its wordmark float left a step in
 * from the page's content rail, the items sit centred on the screen, and
 * Log-in and Sign up float right. Items are plain until hovered,
 * when a box appears behind the item and its panel drops 10px below the
 * bar. The bar rides above every section on every page.
 *
 * It is opaque on every ground, never glass: white with black type over
 * a light section, and pure black with white type over a dark one. Sign
 * up is black on both; once the hero's own sign up button scrolls away,
 * it widens and the brick tile from that button fades in at its left.
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
/* the hover menu's card, after Ada's */
const CARD_W = 880;
/* menus whose pages are plain arrow links (no pictures) sit in a narrower
   card */
const ARROW_MENUS: Partial<Record<string, true>> = { Contact: true };
const ARROW_CARD_W = 560;
/* the foot line parting and knitting back */
const LINE_EASE = { duration: 0.42, ease: [0.65, 0, 0.25, 1] } as const;
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
   its foot is what draws the bar's bottom edge. Sign up is black on
   both skins; Log-in takes the skin's link greys. The menu panel's own
   button keeps the split arrow block, reversed on the dark skin. */
type Ground = "light" | "dark";
const SKIN: Record<Ground, {
  bg: string; fg: string; dim: string; rule: string; hover: string;
  login: string; loginHover: string; line: string; panelRule: string;
  arrow: string; arrowFg: string; cta: string; ctaFg: string;
}> = {
  light: {
    bg: "#eeeeee",
    fg: "#0a0a0a",
    dim: "rgba(10,10,10,0.6)",
    rule: "rgba(10,10,10,0.12)",
    hover: "rgba(10,10,10,0.05)",
    login: "rgba(10,10,10,0.6)",
    loginHover: "#0a0a0a",
    /* the menu panel's button: an #0a0a0a arrow block against an #1e1e1e body */
    arrow: "#0a0a0a",
    arrowFg: "#ffffff",
    cta: "#1e1e1e",
    ctaFg: "#ffffff",
    line: GRID_LIGHT,
    panelRule: "rgba(10,10,10,0.1)",
  },
  dark: {
    bg: "#000000",
    fg: "#ffffff",
    dim: "rgba(255,255,255,0.65)",
    rule: "rgba(255,255,255,0.16)",
    hover: "rgba(255,255,255,0.1)",
    login: "#bdbdbd",
    loginHover: "#ffffff",
    /* the same button reversed, so it still reads on the black panel */
    arrow: "#eeeeee",
    arrowFg: "#0a0a0a",
    cta: "#ffffff",
    ctaFg: "#0a0a0a",
    line: GRID_DARK,
    panelRule: "rgba(255,255,255,0.14)",
  },
};
const TONE = "transition-[color,background-color,border-color] duration-200 ease-out";

type PanelKey = "Product" | "Features" | "Pricing" | "Contact";

/* key order is the bar's item order */
/* key order is the bar's item order */
const PANEL_ORDER: Record<PanelKey, true> = {
  Features: true,
  Product: true,
  Pricing: true,
  Contact: true,
};

/** What each menu holds: an entry per page, each with the line that
    says what it is, the way Swap and Intercom set their menus out. */
type Entry = { label: string; href: string; blurb: string; img?: string; pos?: string };

const PRODUCT_ITEMS: Entry[] = [
  {
    label: "Bank Integration",
    href: "/integration",
    blurb: "Every account and card your agents draw from, in one ledger.",
    img: "/landing/anywhere/a6ccfa82f4.jpg",
    pos: "70% 20%",
  },
  {
    label: "Investing with agents",
    href: "/product",
    blurb: "Caps, approvals and receipts for the money agents move.",
    img: "/landing/hero/hero-bg-poster.jpg",
    pos: "40% 70%",
  },
];

const SOLUTION_ITEMS: Entry[] = [
  {
    label: "Financial teams",
    href: "/finance-teams",
    blurb: "Sona reads every charge and checks with you before the money moves.",
    img: "/landing/hero/hero-bg-poster.jpg",
    pos: "70% 60%",
  },
  {
    label: "Enterprise",
    href: "/enterprise",
    blurb: "Controls, audit and scale for companies running many agents.",
    img: "/landing/anywhere/0e999254fb.jpg",
    pos: "30% 60%",
  },
];

const CONTACT_ITEMS: Entry[] = [
  {
    label: "Support",
    href: "/contact#support",
    blurb: "A person reads every message.",
    img: "/landing/anywhere/0e999254fb.jpg",
    pos: "50% 30%",
  },
  {
    label: "Sales",
    href: "/contact#sales",
    blurb: "For companies with many agents, many locations, or both.",
    img: "/landing/hero/hero-bg-poster.jpg",
    pos: "20% 80%",
  },
];

const PRICING_ITEMS = [
  { title: "Starter", price: "$0/mo" },
  { title: "Team", price: "$49/mo" },
  { title: "Business", price: "$149/mo" },
  { title: "Enterprise", price: "Custom" },
];

/** The menu's right-hand side, after Ada's: short link columns under
    grey heads (an arrow marks a link that leaves the page). */
type SideLink = { label: string; href: string; out?: boolean };
const SIDE: Record<PanelKey, { head: string; links: SideLink[] }[]> = {
  Product: [
    { head: "Learn", links: [{ label: "How a Loat works", href: "/#how-loats-work" }, { label: "FAQ", href: "/#faq" }] },
    { head: "Get started", links: [{ label: "Sign up", href: "/signup" }, { label: "Book a demo", href: "/contact#sales" }] },
  ],
  Features: [
    { head: "Get started", links: [{ label: "Book a demo", href: "/contact#sales" }, { label: "Sign up", href: "/signup" }] },
  ],
  Pricing: [
    { head: "Get started", links: [{ label: "Sign up", href: "/signup" }] },
  ],
  Contact: [
    { head: "Follow", links: [{ label: "LinkedIn", href: "https://www.linkedin.com", out: true }, { label: "Mail", href: "mailto:zeradamkifle@workloat.com", out: true }] },
  ],
};

/* Pricing is LOCKED for now: fully built (panel, items, collapsed tree)
   but hidden from every screen size. Flip to true to restore it. */
const SHOW_PRICING = false;

/* Product is off the bar (and the phone menu) for now; its panel and
   pages stay. Flip to true to bring it back. */
const SHOW_PRODUCT = false;

const NAV = (Object.keys(PANEL_ORDER) as PanelKey[]).filter(
  (k) => (SHOW_PRICING || k !== "Pricing") && (SHOW_PRODUCT || k !== "Product"),
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
  /* where the card opens: centred on the hovered item, held inside the
     screen. `at` is the item's centre, where the bar's foot line breaks
     from. */
  const [card, setCard] = useState({ left: 0, w: CARD_W, at: 0 });
  const placeCard = (el: HTMLElement, key: string) => {
    const frame = headerRef.current?.getBoundingClientRect();
    if (!frame) return;
    const r = el.getBoundingClientRect();
    const w = Math.min(ARROW_MENUS[key] ? ARROW_CARD_W : CARD_W, window.innerWidth - 32);
    const at = r.left + r.width / 2;
    const left = Math.max(16, Math.min(at - w / 2, window.innerWidth - w - 16));
    setCard({ left: left - frame.left, w, at: at - frame.left });
  };

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
  /* over a band marked data-nav-clear (the home page's black agent act
     and the fades into and out of it) the bar drops its ground and its
     foot line, so the band runs on under it unbroken */
  const [clear, setClear] = useState(false);
  /* past the hero: its own sign up button (marked data-hero-cta) has gone
     up behind the bar. A page without one counts once it has scrolled
     most of a screen. */
  const [pastHero, setPastHero] = useState(false);
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
      /* a fade names its two ends and where it turns ("light-dark" at
         0.54): its colours are mixed in CSS, so reading them would answer
         wrongly, and with the bar clear over it the type must turn exactly
         where the ground does */
      const fade = top?.closest<HTMLElement>("[data-nav-fade]");
      if (fade) {
        const [from, to] = (fade.dataset.navFade ?? "light-dark").split("-") as [Ground, Ground];
        const r = fade.getBoundingClientRect();
        return (y - r.top) / r.height < Number(fade.dataset.navFlip ?? 0.5) ? from : to;
      }
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
      const under = document.elementsFromPoint(window.innerWidth / 2, y).find((el) => !header?.contains(el));
      const cl = !!under?.closest("[data-nav-clear]");
      setClear((c) => (c === cl ? c : cl));
      const heroCtas = [...document.querySelectorAll<HTMLElement>("[data-hero-cta]")].filter((e) => e.offsetWidth > 0);
      const past = heroCtas.length
        ? heroCtas.every((e) => e.getBoundingClientRect().bottom < barH.current)
        : window.scrollY > window.innerHeight * 0.6;
      setPastHero((c) => (c === past ? c : past));
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
  /* the menu card is black on both skins, so it always takes the dark ink */
  const M = SKIN.dark;
  const H = collapsed ? COMPACT_H : BAR_H;
  barH.current = H;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 ${TONE}`}
      style={{ height: H, zIndex: 9999, backgroundColor: clear && !menuOpen ? "transparent" : S.bg, color: S.fg }}
      onMouseLeave={() => {
        setHovered(null);
        setActive(null);
      }}
    >
      {/* the foot line, in two halves. While a menu is open they part from
          the item's centre to just past the card's edges, small ticks
          marking the break; they knit back when it closes */}
      {(() => {
        const open = !!active && !collapsed;
        const gapL = open ? card.left - 14 : card.at;
        const gapR = open ? card.left + card.w + 14 : card.at;
        const line = { backgroundColor: S.line };
        return (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-200" style={{ opacity: clear && !menuOpen ? 0 : 1 }} aria-hidden>
            <motion.span className="absolute left-0 top-0 h-px" style={line} initial={false} animate={{ width: Math.max(0, gapL) }} transition={LINE_EASE} />
            <motion.span className="absolute right-0 top-0 h-px" style={{ ...line, left: undefined }} initial={false} animate={{ left: gapR }} transition={LINE_EASE} />
            <motion.span className="absolute top-[-3px] h-[7px] w-px" style={{ backgroundColor: S.fg }} initial={false} animate={{ left: gapL, opacity: open ? 0.45 : 0 }} transition={LINE_EASE} />
            <motion.span className="absolute top-[-3px] h-[7px] w-px" style={{ backgroundColor: S.fg }} initial={false} animate={{ left: gapR, opacity: open ? 0.45 : 0 }} transition={LINE_EASE} />
          </span>
        );
      })()}

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
                aria-label="Workloat home"
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
                    onMouseEnter={(ev) => {
                      placeCard(ev.currentTarget, item);
                      setHovered(item);
                      setActive(item);
                    }}
                    onFocus={(ev) => {
                      placeCard(ev.currentTarget, item);
                      setHovered(item);
                    }}
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
                    className={`${mono.className} relative flex h-10 items-center gap-1.5 whitespace-nowrap px-[clamp(10px,1.1vw,18px)] text-[11px] font-medium uppercase leading-none tracking-[0.08em] transition-colors duration-150`}
                    style={{ color: highlight === item ? S.bg : undefined }}
                  >
                    {/* the open item, after Ada's: a full pill in the
                        bar's ink, the label reversed out of it */}
                    <AnimatePresence>
                      {highlight === item && (
                        <motion.span
                          layoutId="navHoverBox"
                          className="absolute inset-0"
                          style={{ backgroundColor: S.fg, borderRadius: 999 }}
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
                <NavAuth skin={S} pastHero={pastHero} />
              </div>
            </div>

            {/* the menu, after Ada's: a black card centred under the
                hovered item, 8px below its pill, crossing the bar's foot
                line (which breaks around it). Pages as picture cards on the
                left (a thumbnail, the title, one line), short link columns
                on the right. The card's wrapper overlaps the bar, so the
                pointer never leaves the header on its way down. */}
            <AnimatePresence>
              {active && (
                <motion.div
                  key="navPanel"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: [0.25, 0.6, 0.2, 1] }}
                  className="absolute pt-1"
                  style={{ top: BAR_H - 14, left: card.left, width: card.w }}
                >
                  <div
                    className="grid gap-x-[clamp(16px,2vw,36px)] rounded-[5px] p-2.5 min-[860px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
                    style={{
                      backgroundColor: "#0a0a0a",
                      color: M.fg,
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px -24px rgba(10,10,10,0.55)",
                    }}
                  >
                    <ul className="flex flex-col gap-1">
                      {ENTRIES[active].map((e) => ARROW_MENUS[active] ? (
                        /* an arrow link: the arrow at the left nudges right
                           on hover and eases back when the pointer leaves */
                        <li key={e.label}>
                          <Link
                            href={e.href}
                            onClick={() => setActive(null)}
                            className="group flex items-start gap-3 rounded-[4px] px-3 py-3 transition-colors"
                            style={{ color: M.fg }}
                            onMouseEnter={(ev) => { ev.currentTarget.style.backgroundColor = M.hover; }}
                            onMouseLeave={(ev) => { ev.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <svg
                              className="mt-[5px] shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-[5px] group-focus-visible:translate-x-[5px] motion-reduce:transition-none"
                              width="14" height="14" viewBox="0 0 340.034 340.034" aria-hidden
                            >
                              <polygon fill="currentColor" points="222.814,52.783 200.902,74.686 280.748,154.528 0,154.528 0,185.513 280.748,185.513 200.902,265.353 222.814,287.252 340.034,170.023" />
                            </svg>
                            <span className="min-w-0">
                              <span className="block text-[16px] font-medium tracking-[-0.3px]">{e.label}</span>
                              <span className="mt-1 block text-[13.5px] leading-[1.35]" style={{ color: M.dim }}>
                                {e.blurb}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ) : (
                        <li key={e.label}>
                          <Link
                            href={e.href}
                            onClick={() => setActive(null)}
                            className="flex items-center gap-4 rounded-[4px] p-1.5 pr-3 transition-colors"
                            style={{ color: M.fg }}
                            onMouseEnter={(ev) => { ev.currentTarget.style.backgroundColor = M.hover; }}
                            onMouseLeave={(ev) => { ev.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            <span
                              className="block h-[84px] w-[84px] shrink-0 rounded-[4px] bg-cover"
                              style={{ backgroundImage: e.img ? `url(${e.img})` : undefined, backgroundPosition: e.pos ?? "center", backgroundColor: M.hover }}
                              aria-hidden
                            />
                            <span className="min-w-0">
                              <span className="block text-[16px] font-medium tracking-[-0.3px]">{e.label}</span>
                              <span className="mt-1 block text-[13.5px] leading-[1.35]" style={{ color: M.dim }}>
                                {e.blurb}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-2 gap-x-6 px-3 pb-3 pt-3 min-[860px]:px-1">
                      {SIDE[active].map((g) => (
                        <div key={g.head}>
                          <p className="text-[15px]" style={{ color: M.dim }}>{g.head}</p>
                          <ul className="mt-2.5 flex flex-col gap-2">
                            {g.links.map((l) => (
                              <li key={l.label}>
                                <Link
                                  href={l.href}
                                  onClick={() => setActive(null)}
                                  className="inline-flex items-center gap-1 text-[16px] tracking-[-0.2px] hover:underline hover:underline-offset-4"
                                  style={{ color: M.fg }}
                                  {...(l.out ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                >
                                  {l.label}
                                  {l.out && (
                                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                                      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              aria-label="Workloat home"
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
                                    <li key={c.label}>
                                      <Link
                                        href={c.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-1 text-[15px] opacity-80 transition-opacity hover:opacity-100"
                                      >
                                        {c.label}
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
                      <NavAuth skin={S} pastHero={pastHero} wide onNavigate={() => setMenuOpen(false)} />
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

/* Log-in and Sign up, from the Workloat nav auth design: Geist Mono
   labels, uppercase at 11px. Sign up is #000000 with an #333333 border,
   30px tall, 5px radius, on either skin. Once the hero is passed it
   widens and the hero button's brick tile fades in at its left, starting
   its walk through W O R K L O A T. The focus ring takes the skin's ink
   so it shows on the light bar too. */
const EASE = [0.25, 0.6, 0.2, 1] as const;

function NavAuth({ skin, pastHero, wide = false, onNavigate }: {
  skin: (typeof SKIN)[Ground];
  pastHero: boolean;
  /** the compact menu's foot: Sign up fills the row */
  wide?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={`${mono.className} flex items-center gap-[14px] text-[11px] uppercase leading-none ${wide ? "w-full" : ""}`}
      style={{ "--l": skin.login, "--lh": skin.loginHover, "--ring": skin.fg } as React.CSSProperties}
    >
      <Link
        href="/signup?mode=login"
        onClick={onNavigate}
        className="whitespace-nowrap rounded-[2px] font-normal tracking-[0.06em] text-[var(--l)] transition-colors duration-[180ms] ease-out hover:text-[var(--lh)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--lh)]"
      >
        Log-in
      </Link>
      <Link
        href="/signup"
        onClick={onNavigate}
        className={`inline-flex h-[30px] items-center whitespace-nowrap rounded-[5px] border border-solid border-[#333333] bg-[#000000] pr-[13px] font-medium tracking-[0.08em] text-[#ffffff] transition-[background-color,border-color,transform] duration-[180ms] ease-out [-webkit-tap-highlight-color:transparent] hover:border-[#555555] hover:bg-[#0e0e0e] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${wide ? "flex-1 justify-center" : ""}`}
      >
        {/* the lead-in: 13px of padding before the hero, then room for
            the 22px tile and its gap after it */}
        <motion.span
          aria-hidden
          className="relative h-full shrink-0 overflow-hidden"
          initial={false}
          animate={{ width: pastHero ? 33 : 13 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <AnimatePresence>
            {pastHero && (
              <motion.span
                key="tile"
                className="absolute left-[3px] top-[3px] h-[22px] w-[22px] overflow-hidden rounded-[3px] bg-[#000000] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] after:content-['']"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE, delay: 0.18 } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18, ease: EASE } }}
              >
                <BrickMorph size={22} fill={0.78} theme="dark" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
        Sign up
      </Link>
    </div>
  );
}

/* The WORKLOAT wordmark alone, one component so the full bar and the
   compact one render exactly the same lockup. It is drawn as a mask over
   a filled box so it takes the skin's ink and flips with the bar in the
   same 200ms. */
function Lockup({ skin }: { skin: (typeof SKIN)[Ground] }) {
  return (
    <span
      role="img"
      aria-label="Workloat"
      className={`block h-[20px] w-[169px] shrink-0 ${TONE}`}
      style={{
        backgroundColor: skin.fg,
        WebkitMask: "url(/brand/workloat-wordmark.png) center / contain no-repeat",
        mask: "url(/brand/workloat-wordmark.png) center / contain no-repeat",
      }}
    />
  );
}

/* what each menu holds */
const ENTRIES: Record<PanelKey, Entry[]> = {
  Product: PRODUCT_ITEMS,
  Features: SOLUTION_ITEMS,
  Pricing: [],
  Contact: CONTACT_ITEMS,
};

