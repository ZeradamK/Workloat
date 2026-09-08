"use client";

import PurchaseTrackerCard from "./tracker/PurchaseTrackerCard";
import SubscriptionTrackerCard from "./tracker/SubscriptionTrackerCard";

/**
 * The iOS app's home screen recreated for the intro phone mock: status bar
 * (12:00, full signal, 5G, full battery), avatar top-left, the action chips
 * row (exact HomeView.swift values), the Purchase Tracker card, then the
 * Subscriptions card frosting away under the app's floating tab bar (the
 * same bottom edge-glass veil the app draws).
 *
 * Laid out at the app's native 393pt design width, then scaled to the
 * mock's screen width so proportions match the real app 1:1. Values are
 * showcase numbers for the marketing mock only.
 */

const DESIGN_W = 393;
const DESIGN_H = 852;

const SHOWCASE_DAILY = [
  0, 45, 45, 129, 129, 129, 254, 254, 310, 310, 415, 415, 415, 552, 552, 610,
  610, 745, 812,
];
const SHOWCASE_SUB_DAILY = [
  0, 0, 9.99, 9.99, 9.99, 25.98, 25.98, 25.98, 25.98, 41.97, 41.97, 41.97,
  41.97, 41.97, 56.96, 56.96, 56.96, 56.96, 62.95,
];
const SHOWCASE_X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 19"];

const INK = "#0a0a0a";

export default function HomeScreenMock({
  screenWidth,
}: {
  screenWidth: number;
}) {
  const s = screenWidth / DESIGN_W;

  return (
    <div className="h-full w-full overflow-hidden">
      <div
        className="relative overflow-hidden"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${s})`,
          transformOrigin: "top left",
        }}
      >
        {/* ---- status bar: time left, signal + 5G + battery right ---- */}
        <div className="absolute inset-x-0 top-0 flex h-[56px] items-center justify-between px-9">
          <span className="text-[17px] font-semibold tracking-[-0.2px] text-ink tabular-nums">
            12:00
          </span>
          <div className="flex items-center gap-[7px]">
            {/* full cellular bars */}
            <svg width="19" height="12" viewBox="0 0 19 12" aria-hidden>
              <rect x="0" y="7.5" width="3.4" height="4.5" rx="1" fill={INK} />
              <rect x="5" y="5" width="3.4" height="7" rx="1" fill={INK} />
              <rect x="10" y="2.5" width="3.4" height="9.5" rx="1" fill={INK} />
              <rect x="15" y="0" width="3.4" height="12" rx="1" fill={INK} />
            </svg>
            <span className="text-[15px] font-semibold text-ink">5G</span>
            {/* full battery */}
            <svg width="28" height="13" viewBox="0 0 28 13" aria-hidden>
              <rect
                x="0.5"
                y="0.5"
                width="24"
                height="12"
                rx="3.8"
                fill="none"
                stroke={INK}
                strokeOpacity="0.35"
              />
              <rect x="2" y="2" width="21" height="9" rx="2.4" fill={INK} />
              <path
                d="M26.2 4.5v4a2.2 2.2 0 0 0 0-4Z"
                fill={INK}
                fillOpacity="0.4"
              />
            </svg>
          </div>
        </div>

        {/* ---- scrollable content ---- */}
        <div className="px-5 pt-[64px]">
          {/* avatar, top-left (UserOutline-style person in a mist circle) */}
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-mist">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={INK}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="8" r="3.6" />
              <path d="M5 20c1.4-3.2 4-4.8 7-4.8s5.6 1.6 7 4.8" />
            </svg>
          </div>

          {/* action chips — HomeView.swift spec */}
          <div className="mt-3 flex gap-[10px]">
            <span className="whitespace-nowrap rounded-full bg-pine px-4 py-3 text-[15px] font-semibold leading-none text-white">
              Add purchase
            </span>
            <span className="whitespace-nowrap rounded-full bg-mist px-4 py-3 text-[15px] font-semibold leading-none text-ink">
              Scan receipt
            </span>
            <span className="whitespace-nowrap rounded-full bg-mist px-4 py-3 text-[15px] font-semibold leading-none text-ink">
              Activity
            </span>
          </div>

          {/* Purchase Tracker */}
          <div className="mt-[18px]">
            <PurchaseTrackerCard
              purchases={32}
              spend={1104.41}
              purchasesChange={12}
              spendChange={-8}
              daily={SHOWCASE_DAILY}
              xLabels={SHOWCASE_X_LABELS}
            />
          </div>

          {/* Subscriptions, running under the bottom veil */}
          <div className="mt-6">
            <SubscriptionTrackerCard
              spend={62.95}
              daily={SHOWCASE_SUB_DAILY}
              xLabels={SHOWCASE_X_LABELS}
            />
          </div>
        </div>

        {/* ---- bottom edge-glass veil (the app's liquid-glass scroll edge):
             content frosts away beneath the floating tab bar ---- */}
        <div
          className="absolute inset-x-0 bottom-0 h-[130px]"
          style={{
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            maskImage:
              "linear-gradient(to top, black 55%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 55%, transparent 100%)",
            background:
              "linear-gradient(to top, rgba(253,253,253,0.6), rgba(253,253,253,0))",
          }}
        />

        {/* ---- floating tab bar (PayloatTabBar): compact gray capsule,
             icon-only, white pill behind the active Home tab ---- */}
        <div
          className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-[24px] px-[18px] py-[11px]"
          style={{ backgroundColor: "#f8f8f8" }}
        >
          {/* Home — active, white pill */}
          <span
            className="flex h-9 w-9 items-center justify-center rounded-[19px] bg-white"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
          >
            <TabIcon kind="house" active />
          </span>
          <span className="flex h-9 w-9 items-center justify-center">
            <TabIcon kind="card" />
          </span>
          <span className="flex h-9 w-9 items-center justify-center">
            <TabIcon kind="clock" />
          </span>
          <span className="flex h-9 w-9 items-center justify-center">
            <TabIcon kind="person" />
          </span>
        </div>
      </div>
    </div>
  );
}

function TabIcon({
  kind,
  active = false,
}: {
  kind: "house" | "card" | "clock" | "person";
  active?: boolean;
}) {
  const color = INK;
  const opacity = active ? 1 : 0.42;
  switch (kind) {
    case "house":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M3.8 10.6 12 3.6l8.2 7v8.9a1.6 1.6 0 0 1-1.6 1.6h-4.1v-5.6a2.5 2.5 0 0 0-5 0v5.6H5.4a1.6 1.6 0 0 1-1.6-1.6v-8.9Z"
            fill={color}
            fillOpacity={opacity}
          />
        </svg>
      );
    case "card":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
          <rect
            x="2.5"
            y="5"
            width="19"
            height="14"
            rx="3"
            fill={color}
            fillOpacity={opacity}
          />
          <rect x="2.5" y="8.4" width="19" height="2.6" fill="#fff" />
        </svg>
      );
    case "clock":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9.2" fill={color} fillOpacity={opacity} />
          <path
            d="M12 6.8V12l3.6 2.2"
            stroke="#fff"
            strokeWidth="1.9"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    case "person":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="8" r="4" fill={color} fillOpacity={opacity} />
          <path
            d="M4.5 20.5c1.6-3.6 4.4-5.4 7.5-5.4s5.9 1.8 7.5 5.4Z"
            fill={color}
            fillOpacity={opacity}
          />
        </svg>
      );
  }
}
