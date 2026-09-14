import Image from "next/image";
import Link from "next/link";

/**
 * Footer (Sigma anatomy): centered black mark up top, four sparse columns
 * of uppercase links, copyright bottom-left. Quiet and airy. Links wire up
 * as their destinations ship; the rest hold "#".
 */

const COLS: { label: string; links: { label: string; href: string }[] }[] = [
  {
    label: "Information",
    links: [
      { label: "How it works", href: "/product" },
      { label: "Features", href: "/features" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    label: "Customer service",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/product#security" },
      { label: "Privacy and data", href: "/product#privacy-and-data" },
    ],
  },
  {
    label: "Policies",
    links: [{ label: "Privacy Policy", href: "/privacy.html" }],
  },
  {
    label: "Follow Payloat",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/107224097/",
      },
      { label: "Mail", href: "mailto:hello@payloat.com" },
    ],
  },
];

export default function FooterSection({ tone = "dark" }: { /** "light" sets white type and the white mark, for a dark or colored ground */ tone?: "dark" | "light" }) {
  const light = tone === "light";
  const ink = light ? "text-white" : "text-ink";
  const sub = light ? "text-white/70" : "text-sub";
  return (
    <footer className="px-8 pb-10 pt-24">
      {/* centered mark */}
      <div className="flex justify-center">
        <Image
          src="/payloat-icon-dark.svg"
          alt="Payloat"
          width={90}
          height={90}
          className="h-[90px] w-[90px]"
          style={light ? { filter: "invert(1)" } : undefined}
        />
      </div>

      {/* columns */}
      <div className="mt-36 grid gap-12 min-[800px]:grid-cols-4">
        {COLS.map((col) => (
          <div key={col.label}>
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

      {/* copyright */}
      <p className={`mt-40 text-[13px] ${sub}`}>
        Product imagery and numbers shown are illustrative.
      </p>
      <p className={`mt-2 text-[14px] ${ink}`}>
        © 2026 Payloat. All rights reserved.
      </p>
    </footer>
  );
}
