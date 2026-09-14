"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useTransform,
} from "motion/react";
import {
  heroT,
  introT,
  marketsLight,
  productLight,
  slackDark,
  splitsDark,
} from "./introProgress";

/**
 * Docker-style nav: app icon cornered top-left, a floating #EEEEEE dock in
 * the center, Sign up / Subscribe on the right (both route to /signup). Each nav item is its own
 * dynamic island: hovering expands the dock downward into that item's
 * dropdown panel, and switching items morphs the island between panel
 * sizes. White pill highlight rides the hovered/active item.
 */

const SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.8,
} as const;

const DOCK_H = 48;
const RADIUS = 24;

type PanelKey = "Product" | "Features" | "Pricing" | "Contact";

const PANEL_DIMS: Record<PanelKey, { w: number; h: number }> = {
  Product: { w: 356, h: 206 },
  Features: { w: 400, h: 246 },
  Pricing: { w: 380, h: 286 },
  Contact: { w: 380, h: 286 },
};

/** Product sub-items: one per page. */
const PRODUCT_ITEMS = [
  { label: "Product intro", href: "/product" },
  { label: "Integration", href: "/integration" },
];

const SOLUTION_ITEMS = [
  "For restaurants",
  "For agent builders",
  "For finance teams",
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

/* dock row width tracks the item count */
const ROW_W = SHOW_PRICING ? 470 : 386;

/** main nav items with a page of their own */
const PAGE_ROUTES: Partial<Record<PanelKey, string>> = {
  Product: "/product",
  Features: "/features",
  Contact: "/contact",
};

export default function NavDock({
  introChoreo = false,
  forceDark = false,
}: {
  /** Sync the nav's entrance to the intro scroll act: the dock blurs in
      as the phone screen fills the viewport, then the logo and buttons
      ease in once the phone has fully vanished. */
  introChoreo?: boolean;
  /** Pin the dock to its dark theme, ignoring the home page's scroll
      signals (which persist across client-side routes). */
  forceDark?: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState<PanelKey | null>(null);

  const [hovered, setHovered] = useState<PanelKey | null>(null);
  const [dockW, setDockW] = useState<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  /* responsive collapse: when the dock's right tip comes within 40px of
     the Sign up button's left tip, everything except the app icon
     converges into a dropdown menu */
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<PanelKey | null>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const chromeW = useRef(232);

  useEffect(() => {
    const check = () => {
      if (chromeRef.current && chromeRef.current.offsetWidth > 0)
        chromeW.current = chromeRef.current.offsetWidth;
      const vw = window.innerWidth;
      const pad = vw >= 640 ? 28 : 20;
      const dockRight = vw / 2 + ROW_W / 2; /* dock centered */
      const signupLeft = vw - pad - chromeW.current;
      setCollapsed(dockRight + 40 > signupLeft);
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
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* intro-synced reveal: the dock eases in as the phone's island turns
     #EEEEEE (complete by the time the color lands), then the chrome */
  const dockO = useTransform(introT, [0.55, 0.66], [0, 1]);
  const dockBlurPx = useTransform(introT, [0.55, 0.66], [12, 0]);
  const dockFilter = useMotionTemplate`blur(${dockBlurPx}px)`;
  const dockPE = useTransform(dockO, (v) => (v > 0.5 ? "auto" : "none"));
  const chromeO = useTransform(introT, [0.96, 1], [0, 1]);
  const chromeY = useTransform(introT, [0.96, 1], [-10, 0]);
  const chromePE = useTransform(chromeO, (v) => (v > 0.5 ? "auto" : "none"));

  /* surface syncs with the page: dark on hero slide 1, #EEEEEE on
     slide 2, then dips back to dark while the feature splits are on
     screen */
  const lightAmt = useTransform(() => {
    /* pinned-dark pages can still flash light while the dock crosses a
       black canvas (productLight, 50ms zip) */
    if (forceDark) return productLight.get();
    const base = Math.min(Math.max((heroT.get() - 0.4) / 0.25, 0), 1);
    const darkOverride = splitsDark.get() * (1 - marketsLight.get());
    /* the Slack act's gray box: dark while it is under the dock */
    return base * (1 - darkOverride) * (1 - slackDark.get());
  });
  const dockBg = useTransform(lightAmt, [0, 1], ["#0a0a0a", "#eeeeee"]);
  const navFg = useTransform(lightAmt, [0, 1], ["#ffffff", "#0a0a0a"]);
  const navLabel = useTransform(
    lightAmt,
    [0, 1],
    ["rgba(255,255,255,0.4)", "rgba(10,10,10,0.4)"],
  );

  const open = active !== null;
  /* the white pill rides the hovered item, or the active one while open */
  const highlight = hovered ?? active;

  /* Measure the dock's natural (closed) width once so the island can
     spring between real pixel sizes. */
  useLayoutEffect(() => {
    if (!collapsed && rowRef.current) setDockW(rowRef.current.offsetWidth);
  }, [collapsed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dims = active ? PANEL_DIMS[active] : null;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="relative flex items-center justify-end px-5 pt-4 sm:px-7 sm:pt-5">
        {/* ---- Left: Payloat app icon, cornered 15px top-left ---- */}
        <motion.div
          className="pointer-events-auto absolute left-[15px] top-[15px]"
          style={
            introChoreo
              ? { opacity: chromeO, y: chromeY, pointerEvents: chromePE }
              : undefined
          }
        >
          <Link
            href="/"
            className="block transition-opacity hover:opacity-80"
            aria-label="Payloat home"
          >
            <Image
              src="/payloat-app-icon-v2.png"
              alt="Payloat"
              width={50}
              height={50}
              priority
              className="h-[50px] w-[50px] rounded-[11px]"
            />
          </Link>
        </motion.div>

        {/* ---- Center: the nav dock island ---- */}
        {!collapsed && (
        <motion.nav
          className="pointer-events-auto absolute left-1/2 top-4 hidden -translate-x-1/2 sm:top-5 min-[900px]:block"
          aria-label="Primary"
          style={
            introChoreo
              ? { opacity: dockO, filter: dockFilter, pointerEvents: dockPE }
              : undefined
          }
          onMouseLeave={() => {
            setHovered(null);
            setActive(null);
          }}
        >
          <motion.div
            initial={false}
            animate={{
              /* never narrower than the dock row, so the surface always
                 contains every nav item */
              width: dims ? Math.max(dims.w, dockW ?? 0) : dockW ?? "auto",
              height: dims ? dims.h : DOCK_H,
            }}
            transition={SPRING}
            className="flex flex-col items-center overflow-hidden"
            style={
              {
                borderRadius: RADIUS,
                backgroundColor: dockBg,
                "--nav-fg": navFg,
                "--nav-label": navLabel,
              } as React.ComponentProps<typeof motion.div>["style"]
            }
          >
            {/* Persistent dock row — width matches the hero's center column */}
            <div
              ref={rowRef}
              className="flex h-12 shrink-0 items-center justify-center gap-0.5 px-[5px]"
              style={{ width: ROW_W }}
            >
              {NAV.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseEnter={() => {
                    setHovered(item);
                    setActive(item);
                  }}
                  onFocus={() => setHovered(item)}
                  onClick={() => {
                    /* main items navigate to their pages (islands still
                       open on hover); Pricing has no page yet, so it
                       toggles its island */
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
                  className="relative flex h-[38px] items-center gap-1.5 rounded-full px-4 text-[14px] font-medium tracking-[-0.2px] transition-colors duration-150"
                style={{ color: highlight === item ? "#0a0a0a" : "var(--nav-fg)" }}
                >
                  <AnimatePresence>
                    {highlight === item && (
                      <motion.span
                        layoutId="dockHover"
                        className="absolute inset-0 rounded-full bg-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={SPRING}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{item}</span>
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className="relative z-10"
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
            </div>

            {/* Per-item dropdown content */}
            <AnimatePresence mode="popLayout" initial={false}>
              {active && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.25, ease: [0.25, 0.6, 0.2, 1], delay: 0.06 },
                  }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                  style={{ width: PANEL_DIMS[active].w }}
                  className="px-4 pb-4 pt-2"
                >
                  {active === "Product" && <ProductPanel />}
                  {active === "Features" && <SolutionsPanel />}
                  {active === "Pricing" && <PricingPanel />}
                  {active === "Contact" && <ContactPanel />}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.nav>
        )}

        {/* ---- Right: actions ---- */}
        {!collapsed && (
        <motion.div
          ref={chromeRef}
          className="pointer-events-auto hidden shrink-0 items-center gap-2.5 min-[900px]:flex"
          style={
            introChoreo
              ? { opacity: chromeO, y: chromeY, pointerEvents: chromePE }
              : undefined
          }
        >
          <Link
            href="/signup"
            className="group hidden h-11 items-center gap-1.5 rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-transform hover:scale-[1.03] active:scale-[0.97] sm:flex"
          >
            Sign up
            <svg
              width="11"
              height="11"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
            >
              <path
                d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/signup"
            className="flex h-11 items-center rounded-full bg-[#0a0a0a] px-5 text-[13px] font-semibold tracking-[-0.5px] text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Get started
          </Link>
        </motion.div>
        )}

        {/* ---- Collapsed: Menu trigger + dropdown tree ---- */}
        {collapsed && (
          <div className="pointer-events-auto relative">
            {menuOpen && (
              <div
                className="fixed inset-0 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
            )}
            <motion.button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="relative flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-medium"
              style={
                {
                  backgroundColor: dockBg,
                  color: navFg,
                } as React.ComponentProps<typeof motion.button>["style"]
              }
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
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="no-scrollbar absolute right-0 top-[58px] w-[min(340px,calc(100vw-40px))] overflow-y-auto rounded-[24px] p-5"
                  style={
                    {
                      backgroundColor: dockBg,
                      maxHeight: "calc(100vh - 110px)",
                      "--nav-fg": navFg,
                      "--nav-label": navLabel,
                      "--nav-bg": dockBg,
                    } as React.ComponentProps<typeof motion.div>["style"]
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
                          className="text-left text-[20px] font-medium tracking-[-0.5px] [color:var(--nav-fg)]"
                        >
                          {item}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSection((v) => (v === item ? null : item))
                          }
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
                          className="[color:var(--nav-fg)]"
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
                            transition={{
                              duration: 0.25,
                              ease: [0.3, 0.9, 0.3, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <ul className="pb-3 pl-3">
                              {item === "Product" &&
                                PRODUCT_ITEMS.map((f) => (
                                  <li key={f.label}>
                                    <Link
                                      href={f.href}
                                      onClick={() => setMenuOpen(false)}
                                      className="block py-1 text-[15px] [color:var(--nav-fg)] opacity-80 transition-opacity hover:opacity-100"
                                    >
                                      {f.label}
                                    </Link>
                                  </li>
                                ))}
                              {item === "Features" &&
                                SOLUTION_ITEMS.map((f) => (
                                  <li key={f}>
                                    <Link
                                      href="/features"
                                      onClick={() => setMenuOpen(false)}
                                      className="block py-1 text-[15px] [color:var(--nav-fg)] opacity-80 transition-opacity hover:opacity-100"
                                    >
                                      {f}
                                    </Link>
                                  </li>
                                ))}
                              {item === "Pricing" &&
                                PRICING_ITEMS.map((t) => (
                                  <li key={t.title}>
                                    <a
                                      href="#"
                                      className="flex items-baseline justify-between py-1 [color:var(--nav-fg)] opacity-80 transition-opacity hover:opacity-100"
                                    >
                                      <span className="text-[15px]">
                                        {t.title}
                                      </span>
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
                                      className="flex items-baseline justify-between py-1 [color:var(--nav-fg)] opacity-80 transition-opacity hover:opacity-100"
                                    >
                                      <span className="text-[15px]">
                                        {c.title}
                                      </span>
                                      {c.detail && (
                                        <span className="text-[12px]">
                                          {c.detail}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <div className="mt-3 flex flex-col gap-2.5 border-t border-[color:var(--nav-label)] pt-4">
                    <Link
                      href="/signup"
                      className="flex h-11 w-full items-center justify-center rounded-full border border-solid border-black bg-white text-[13px] font-semibold tracking-[-0.5px] text-ink"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/signup"
                      className="flex h-11 w-full items-center justify-center rounded-full text-[13px] font-semibold tracking-[-0.5px]"
                      style={{
                        backgroundColor: "var(--nav-fg)",
                        color: "var(--nav-bg)",
                      }}
                    >
                      Get started
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- Dropdown panels ---------- */

/* Panels styled exactly like the original island menu: small gray section
   label, then big medium-weight links that dim on hover. */

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
          <li key={s}>
            <Link href="/features" className={bigLink}>
              {s}
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
              {c.detail && (
                <span className="text-[13px] [color:var(--nav-fg)] opacity-70">
                  {c.detail}
                </span>
              )}
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
            <a
              href="#"
              className="flex items-baseline justify-between transition-opacity hover:opacity-50"
            >
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
