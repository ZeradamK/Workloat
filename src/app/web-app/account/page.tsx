"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { useWebApp } from "../shell";
import { CARD } from "../pieces";

/**
 * The web-app's account surface (Cash App profile anatomy, Mobbin refs):
 * avatar circle with the user's initial, name + email, joined date, an
 * "Account & settings" icon-row list, and the red Sign out. Rendered inside
 * the persistent shell — the sidebar rail stays put. The auth gate and the
 * shared data load live in the shell too.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function AccountPage() {
  const router = useRouter();
  const { user, beginSignOut } = useWebApp();
  const [updatesOn, setUpdatesOn] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  /* the user's own signup row (RLS limits the read to their user id) */
  useEffect(() => {
    supabase
      .from("website_signups")
      .select("marketing_consent")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setUpdatesOn(data ? data.marketing_consent : false));
  }, [user.id]);

  const signOut = async () => {
    setSigningOut(true);
    beginSignOut();
    await supabase.auth.signOut();
    router.push("/");
  };

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Your account";
  const initial = name.charAt(0).toUpperCase();
  const joined = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mx-auto max-w-[640px] px-6 pb-24 pt-8 min-[900px]:pt-14">
      {/* mobile: way back to the radar (desktop keeps the sidebar) */}
      <Link
        href="/web-app"
        className="mb-8 flex items-center gap-2 text-[13px] font-semibold text-ink transition-opacity hover:opacity-60 min-[900px]:hidden"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M19 12H5m0 0 6.5 6.5M5 12l6.5-6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to radar
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* profile header */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#d6f251]">
          <span className="text-[40px] font-semibold text-ink">{initial}</span>
        </div>
        <h1 className="mt-6 text-[clamp(28px,3.4vw,38px)] font-semibold tracking-[-1px] text-ink">
          {name}
        </h1>
        <p className="mt-1 text-[15px] text-sub">{user.email}</p>
        <p className="mt-4 flex items-center gap-2 text-[14px] text-sub">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="4" y="5" width="16" height="15" rx="2.5" />
            <path d="M4 10h16M9 3v4M15 3v4" />
          </svg>
          Joined {joined}
        </p>
      </motion.div>

      {/* account & settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
      >
        <h2 className="mt-14 text-[20px] font-semibold tracking-[-0.4px] text-ink">
          Account &amp; settings
        </h2>
        <div className={`${CARD} mt-3 divide-y divide-black/5 px-5`}>
          <Row
            icon={
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c1.4-3.3 4-5 7-5s5.6 1.7 7 5" />
            }
            label="Personal information"
            value={name}
          />
          <Row
            icon={
              <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Zm-4.5 9a1.8 1.8 0 0 1-3 0" />
            }
            label="Launch updates"
            value={updatesOn === null ? "…" : updatesOn ? "On" : "Off"}
          />
          <Row
            icon={
              <path d="M12 4 5 6.5v4.5c0 4.6 2.9 8.2 7 9.8 4.1-1.6 7-5.2 7-9.8V6.5L12 4Z" />
            }
            label="Security"
            href="/security"
          />
          <Row
            icon={
              <>
                <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
                <circle cx="12" cy="12" r="2.6" />
              </>
            }
            label="Privacy and data"
            href="/privacy.html"
          />
          <Row
            icon={
              <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
            }
            label="Support"
            href="/contact"
          />
        </div>

        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="mt-12 text-[15px] font-semibold text-[#e5484d] transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          {signingOut ? "Signing out" : "Sign out"}
        </button>
      </motion.div>
    </section>
  );
}

/* a Cash App settings row: icon, label, trailing value or chevron */
function Row({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
}) {
  const inner = (
    <>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="shrink-0"
      >
        {icon}
      </svg>
      <span className="flex-1 text-[16px] font-medium text-ink">{label}</span>
      {value !== undefined && (
        <span className="text-[14px] text-sub">{value}</span>
      )}
      {href && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="text-sub"
        >
          <path
            d="m6 3.5 5 4.5-5 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
  return href ? (
    <Link href={href} className="flex items-center gap-4 py-4 transition-opacity hover:opacity-60">
      {inner}
    </Link>
  ) : (
    <div className="flex items-center gap-4 py-4">{inner}</div>
  );
}
