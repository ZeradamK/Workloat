"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/**
 * The nav: one bordered row in the site's grid, taller than its buttons.
 * The mark and the wordmark float left, the items sit centered, the
 * Sign up split button floats right. Items are plain until hovered,
 * when a box appears behind the item and its panel drops 10px below the
 * bar. The row is 1200px wide at 1920 and keeps that share of the
 * viewport as the screen narrows; once its contents no longer fit, the
 * compact Menu nav takes over.
 *
 * The bar is liquid glass, 5px rounded, in one color on every ground:
 * #A1BC98 at 50%, magnifying what passes under it, with no shadow.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.8 } as const;
const BAR_H = 64;

type PanelKey = "Product" | "Features" | "Pricing" | "Contact";

/* key order is the bar's item order */
const PANEL_DIMS: Record<PanelKey, { w: number; h: number }> = {
  Features: { w: 400, h: 206 },
  Product: { w: 356, h: 246 },
  Pricing: { w: 380, h: 286 },
  Contact: { w: 380, h: 286 },
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

const NAV = (Object.keys(PANEL_DIMS) as PanelKey[]).filter((k) => SHOW_PRICING || k !== "Pricing");

/** main nav items with a page of their own */
const PAGE_ROUTES: Partial<Record<PanelKey, string>> = {
  Product: "/product",
  Features: "/finance-teams",
  Contact: "/contact",
};

/* the three grounds the bar can sit over, and the surface it takes on
   each: the opposite of the ground */
type Ground = "white" | "mist" | "black";
/* liquid glass in one color on every ground: #A1BC98 at 50%, over a
   backdrop blur that magnifies what passes under it, with a hairline and
   a soft inner highlight */
const GLASS = {
  bg: "rgba(161,188,152,0.5)",
  fg: "#0a0a0a",
  rule: "rgba(10,10,10,0.12)",
  hover: "rgba(10,10,10,0.06)",
  glow: "rgba(255,255,255,0.7)",
  filter: "blur(18px) saturate(1.5) contrast(1.08) brightness(1.04)",
};
const SURFACE: Record<Ground, typeof GLASS> = { white: GLASS, mist: GLASS, black: GLASS };


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

  /* ---- the ground under the bar, sampled on scroll ---- */
  const headerRef = useRef<HTMLElement>(null);
  const [ground, setGround] = useState<Ground>("white");
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
    /* #eeeeee is 0.93; the off-whites the cards use sit above 0.95 */
    const toGround = (l: number): Ground => (l >= 0.95 ? "white" : l >= 0.5 ? "mist" : "black");
    let raf = 0;
    const sample = () => {
      raf = 0;
      const y = 44;
      const stack = document.elementsFromPoint(window.innerWidth / 2, y).filter((el) => !header?.contains(el));
      let el = stack[0] as HTMLElement | undefined;
      let g: Ground | null = null;
      while (el && el !== document.documentElement) {
        const cs = getComputedStyle(el);
        const l = lum(cs.backgroundColor);
        if (l !== null) {
          g = toGround(l);
          break;
        }
        if (cs.backgroundImage.includes("gradient")) {
          const stops = cs.backgroundImage.match(/(?:rgba?|color)\([^)]*\)/g) ?? [];
          const first = stops[0] ? lum(stops[0]) : null;
          const last = stops[stops.length - 1] ? lum(stops[stops.length - 1]) : null;
          if (first !== null && last !== null) {
            const r = el.getBoundingClientRect();
            g = toGround((y - r.top) / r.height < 0.5 ? first : last);
            break;
          }
        }
        el = el.parentElement ?? undefined;
      }
      if (g !== null) setGround((cur) => (cur === g ? cur : g));
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
  const S = SURFACE[ground];

  /* ---- collapse: the bar is min(1400px, 72.9vw); once its cells need
     more than that, the compact Menu nav takes over ---- */
  const rowRef = useRef<HTMLDivElement>(null);
  const needW = useRef(0);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<PanelKey | null>(null);
  useLayoutEffect(() => {
    const check = () => {
      const row = rowRef.current;
      if (row) {
        /* the cells' natural width: everything but the open spacer cell */
        let w = 0;
        row.querySelectorAll<HTMLElement>("[data-cell]").forEach((c) => (w += c.offsetWidth));
        if (w > 0) needW.current = w + 80;
      }
      const avail = Math.min(1200, window.innerWidth * 0.625);
      setCollapsed(needW.current > avail || window.innerWidth < 900);
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

  /* the Sign up split button: on the light surfaces the nav's black and
     dark gray; on the black surface an #eeeeee block and a white body */
  const wordmark = "/payloat-wordmark-black.svg";
  const label = "rgba(10,10,10,0.4)";

  return (
    <header ref={headerRef} className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex justify-center px-5 pt-4 sm:pt-5">
        {/* ---- the bar: a bordered row, taller than its buttons; the logo
            floats left, the items sit centered, Demo and Sign up float
            right. Items are plain until hovered, when a box appears
            behind the item and its panel drops 10px below the bar. ---- */}
        {!collapsed && (
          <nav
            aria-label="Primary"
            className="pointer-events-auto relative"
            style={{ width: "min(1200px, 62.5vw)" }}
            onMouseLeave={() => {
              setHovered(null);
              setActive(null);
            }}
          >
            <motion.div
              ref={rowRef}
              className="grid grid-cols-[1fr_auto_1fr] items-center px-3"
              animate={{ backgroundColor: S.bg, color: S.fg, borderColor: S.rule }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                height: BAR_H,
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 5,
                backdropFilter: S.filter,
                WebkitBackdropFilter: S.filter,
                boxShadow: `inset 0 1px 0 ${S.glow}, inset 0 -1px 0 rgba(10,10,10,0.04)`,
              }}
            >

              {/* the logo, floated left */}
              <Link
                href="/"
                data-cell
                aria-label="Payloat home"
                className="flex w-fit items-center gap-3 px-2 transition-opacity hover:opacity-80"
              >
                <Image src="/payloat-app-icon-v2.png" alt="" width={41} height={41} priority className="h-[41px] w-[41px] rounded-[9px]" />
                <Image src={wordmark} alt="Payloat" width={501} height={166} priority className="h-[25px] w-auto" />
              </Link>

              {/* the items, centered */}
              <div className="flex items-center gap-1" data-cell>
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
                    className="relative flex h-11 items-center gap-1.5 px-5 text-[16px] font-medium tracking-[-0.2px]"
                  >
                    {/* the box, only while hovered */}
                    <AnimatePresence>
                      {highlight === item && (
                        <motion.span
                          layoutId="navHoverBox"
                          className="absolute inset-0"
                          style={{ backgroundColor: S.hover, border: `1px solid ${S.rule}`, borderRadius: 5 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.12 } }}
                          transition={SPRING}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{item}</span>
                    <motion.svg className="relative z-10" width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden initial={false} animate={{ rotate: highlight === item ? 180 : 0 }} transition={SPRING}>
                      <path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  </button>
                ))}
              </div>

              {/* Sign up, floated right */}
              <div className="flex items-center justify-end" data-cell>
                <Link
                  href="/signup"
                  className="flex h-11 items-center px-6 text-[15px] font-semibold tracking-[-0.5px] text-white transition-opacity hover:opacity-90"
                  style={{ borderRadius: 5, backgroundColor: "#0a0a0a" }}
                >
                  Sign up
                </Link>
              </div>
            </motion.div>

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
                      borderRadius: 5,
                      backdropFilter: S.filter,
                      WebkitBackdropFilter: S.filter,
                      boxShadow: `inset 0 1px 0 ${S.glow}`,
                      "--nav-fg": S.fg,
                      "--nav-label": label,
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
            {active && <span className="absolute inset-x-0 h-[12px]" style={{ top: BAR_H }} />}
          </nav>
        )}

        {/* ---- collapsed: the mark left, the Menu trigger right ---- */}
        {collapsed && (
          <div className="pointer-events-auto flex w-full items-center justify-between">
            <Link href="/" aria-label="Payloat home" className="flex items-center gap-2.5">
              <Image src="/payloat-app-icon-v2.png" alt="" width={41} height={41} priority className="h-[41px] w-[41px] rounded-[9px]" />
              <Image src={wordmark} alt="Payloat" width={501} height={166} className="h-[20px] w-auto" />
            </Link>
            <div className="relative">
              {menuOpen && <div className="fixed inset-0 cursor-default" onClick={() => setMenuOpen(false)} />}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                className="relative flex h-12 items-center gap-2 px-5 text-[16px] font-medium"
                style={{ backgroundColor: S.bg, color: S.fg, border: `1px solid ${S.rule}`, borderRadius: 5, backdropFilter: S.filter, WebkitBackdropFilter: S.filter }}
              >
                Menu
                <motion.svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden initial={false} animate={{ rotate: menuOpen ? 180 : 0 }} transition={SPRING}>
                  <path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="no-scrollbar absolute right-0 top-[58px] w-[min(340px,calc(100vw-40px))] overflow-y-auto p-5"
                    style={
                      {
                        backgroundColor: S.bg,
                        color: S.fg,
                        border: `1px solid ${S.rule}`,
                        borderRadius: 5,
                        backdropFilter: S.filter,
                        WebkitBackdropFilter: S.filter,
                        maxHeight: "calc(100vh - 110px)",
                        "--nav-fg": S.fg,
                        "--nav-label": label,
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
                            <motion.svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden initial={false} animate={{ rotate: openSection === item ? 180 : 0 }} transition={SPRING}>
                              <path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
                                      <Link href={f.href} onClick={() => setMenuOpen(false)} className="block py-1 text-[15px] opacity-80 transition-opacity hover:opacity-100">
                                        {f.label}
                                      </Link>
                                    </li>
                                  ))}
                                {item === "Features" &&
                                  SOLUTION_ITEMS.map((f) => (
                                    <li key={f.label}>
                                      <Link href={f.href} onClick={() => setMenuOpen(false)} className="block py-1 text-[15px] opacity-80 transition-opacity hover:opacity-100">
                                        {f.label}
                                      </Link>
                                    </li>
                                  ))}
                                {item === "Pricing" &&
                                  PRICING_ITEMS.map((t) => (
                                    <li key={t.title}>
                                      <a href="#" className="flex items-baseline justify-between py-1 opacity-80 transition-opacity hover:opacity-100">
                                        <span className="text-[15px]">{t.title}</span>
                                        <span className="text-[13px] font-semibold tabular-nums">{t.price}</span>
                                      </a>
                                    </li>
                                  ))}
                                {item === "Contact" &&
                                  CONTACT_ITEMS.map((c) => (
                                    <li key={c.title}>
                                      <Link href={c.href} onClick={() => setMenuOpen(false)} className="flex items-baseline justify-between py-1 opacity-80 transition-opacity hover:opacity-100">
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
                      <Link href="/signup" className="flex h-11 w-full items-center justify-center text-[15px] font-semibold tracking-[-0.5px] text-white" style={{ borderRadius: 5, backgroundColor: "#0a0a0a" }}>
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

const bigLink = "block text-[26px] font-medium leading-[1.55] tracking-[-0.02em] [color:var(--nav-fg)] transition-opacity hover:opacity-60";

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
            <Link href={c.href} className="flex items-baseline justify-between transition-opacity hover:opacity-50">
              <span className="text-[26px] font-medium leading-[1.55] tracking-[-0.02em] [color:var(--nav-fg)]">{c.title}</span>
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
              <span className="text-[26px] font-medium leading-[1.55] tracking-[-0.02em] [color:var(--nav-fg)]">{t.title}</span>
              <span className="text-[15px] font-semibold tabular-nums [color:var(--nav-fg)]">{t.price}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
