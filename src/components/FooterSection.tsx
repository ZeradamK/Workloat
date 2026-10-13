import Image from "next/image";
import Link from "next/link";

/**
 * Footer on the site's ruled grid: a framed column with the mark in its
 * own cell, four ruled link columns, and the copyright in the foot. Links wire up
 * as their destinations ship; the rest hold "#".
 */

const COLS: { label: string; links: { label: string; href: string }[] }[] = [
  {
    label: "Features",
    links: [
      { label: "Teams", href: "/finance-teams" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/#faq" },
      { label: "Privacy and data", href: "/privacy.html" },
    ],
  },
  {
    label: "Get started",
    links: [
      { label: "Sign up", href: "/signup" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/107224097/" },
      { label: "Mail", href: "mailto:zeradamkifle@workloat.com" },
    ],
  },
];

export default function FooterSection({ tone = "dark" }: { /** "light" sets white type and the white mark, for a dark or colored ground */ tone?: "dark" | "light" }) {
  const light = tone === "light";
  const ink = light ? "text-white" : "text-ink";
  const sub = light ? "text-white/70" : "text-sub";
  const rail = light ? "border-white/10" : "border-black/[0.08]";
  const line = light ? "bg-white/10" : "bg-black/[0.08]";
  const cross = light ? "bg-white/50" : "bg-black/40";
  return (
    <footer className="overflow-x-clip px-6 pb-10 pt-[clamp(96px,15.6vw,300px)]">
      {/* the grid: a framed column of ruled cells, rules running past the
          rails with crosshairs at the corners */}
      <div className={`relative mx-auto max-w-[1200px] border-x ${rail}`}>
        <span className={`pointer-events-none absolute -left-6 -right-6 top-0 h-px ${line}`} />
        <span className={`pointer-events-none absolute -left-6 -right-6 bottom-0 h-px ${line}`} />
        <Cross at="top-left" color={cross} />
        <Cross at="bottom-right" color={cross} />

        {/* the mark, centered in its own cell */}
        <div className="flex justify-center py-[clamp(40px,4.5vw,72px)]">
          <Image
            src={light ? "/brand/workloat-wordmark-white.png" : "/brand/workloat-wordmark-dark.png"}
            alt="Workloat"
            width={936}
            height={111}
            className="h-[clamp(26px,2.4vw,38px)] w-auto"
          />
        </div>

        {/* four ruled columns */}
        <div className={`grid border-t ${rail} min-[800px]:grid-cols-3`}>
          {COLS.map((col, i) => (
            <div
              key={col.label}
              className={`px-6 py-8 ${rail} ${i > 0 ? "border-t min-[800px]:border-l min-[800px]:border-t-0" : ""}`}
            >
              <p className={`text-[13px] uppercase tracking-[0.02em] ${sub}`}>
                {col.label}
              </p>
              <ul className="mt-7 space-y-[4px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className={`text-[15px] uppercase tracking-[0.02em] ${ink} transition-opacity hover:opacity-60`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className={`text-[15px] uppercase tracking-[0.02em] ${ink} transition-opacity hover:opacity-60`}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* the foot: note and copyright */}
        <div className={`flex flex-col gap-2 border-t px-6 py-6 ${rail} min-[800px]:flex-row min-[800px]:items-baseline min-[800px]:justify-between`}>
          <p className={`text-[14px] ${ink}`}>© 2026 Workloat. All rights reserved.</p>
          <p className={`text-[13px] ${sub}`}>Product imagery and numbers shown are illustrative.</p>
        </div>
      </div>
    </footer>
  );
}

/* the grid's small crosshair where a rule meets a rail */
function Cross({ at, color }: { at: "top-left" | "bottom-right"; color: string }) {
  const pos = at === "top-left" ? "-left-[7px] -top-[6px]" : "-bottom-[6px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${pos}`} aria-hidden>
      <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${color}`} />
      <span className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 ${color}`} />
    </span>
  );
}
