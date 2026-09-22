"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

/**
 * The nav, on the Mews anatomy: one full-bleed row flush to the top of
 * every page. The Payloat mark floats left a step in from the page's
 * content rail, the items sit centred on the screen, and
 * Sign up floats right as a black pill. Items are plain until hovered,
 * when a box appears behind the item and its panel drops 10px below the
 * bar. The bar rides above every section on every page.
 *
 * It is solid white on every ground, with black type throughout: no
 * glass, no refraction, and nothing sampled from the section behind.
 * The liquid-glass bar that read its ground is parked at
 * design-archive/NavDock-liquid-glass-bar.tsx.txt.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.8 } as const;

/* one row, flush to the top of the page */
const BAR_H = 76;
const COMPACT_H = 64;
/* the logo steps this far in past the page's own content rail; the
   items ignore it and centre on the screen instead */
const LOGO_PAD = 50;

/* the bar's one palette, the same at every scroll position on every
   page: white, with black type over it */
const WHITE = "#ffffff";
const FG = "#0a0a0a";
const DIM = "rgba(10,10,10,0.6)";
const RULE = "rgba(10,10,10,0.12)";
const HOVER = "rgba(10,10,10,0.05)";
/* Sign up reverses it, so the one filled thing in the row carries the
   weight */
const CTA_BG = "#0a0a0a";
const CTA_FG = "#eeeeee";

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

export default function NavDock(_props: {
  /** older call sites pass these; the bar is white on every page now,
      so they are accepted and ignored */
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

  /* ---- collapse: once the row's cells no longer fit the frame, the
     compact Menu nav takes over ---- */
  const rowRef = useRef<HTMLDivElement>(null);
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

  return (
    <header
      className="fixed inset-x-0 top-0"
      style={{ height: H, zIndex: 9999, backgroundColor: WHITE, color: FG }}
      onMouseLeave={() => {
        setHovered(null);
        setActive(null);
      }}
    >
      {/* a hairline at the foot, so the white bar still reads as a bar
          where the section under it is also white */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: RULE }}
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
                className="flex shrink-0 items-center transition-opacity hover:opacity-80"
                style={{ marginLeft: LOGO_PAD }}
              >
                <Image
                  src="/payloat-mark.svg"
                  alt="Payloat"
                  width={622}
                  height={910}
                  priority
                  className="h-[34px] w-auto"
                />
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
                          style={{ backgroundColor: HOVER, border: `1px solid ${RULE}` }}
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
                  className="flex h-[42px] items-center px-[28px] text-[14px] font-semibold tracking-[-0.3px] transition-opacity hover:opacity-85"
                  style={{ backgroundColor: CTA_BG, color: CTA_FG, borderRadius: 999 }}
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
                      backgroundColor: WHITE,
                      color: FG,
                      border: `1px solid ${RULE}`,
                      "--nav-fg": FG,
                      "--nav-label": DIM,
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
            <Link href="/" aria-label="Payloat home" className="flex items-center">
              <Image
                src="/payloat-mark.svg"
                alt="Payloat"
                width={622}
                height={910}
                priority
                className="h-[30px] w-auto"
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
                className="relative flex h-[42px] items-center gap-2 px-5 text-[15px] font-medium"
                style={{ border: `1px solid ${RULE}`, color: FG }}
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
                        backgroundColor: WHITE,
                        color: FG,
                        border: `1px solid ${RULE}`,
                        maxHeight: "calc(100vh - 100px)",
                        "--nav-fg": FG,
                        "--nav-label": DIM,
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

                    <div className="mt-3 border-t pt-4" style={{ borderColor: RULE }}>
                      <Link
                        href="/signup"
                        className="flex h-11 w-full items-center justify-center text-[15px] font-semibold tracking-[-0.5px]"
                        style={{ backgroundColor: CTA_BG, color: CTA_FG, borderRadius: 999 }}
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
