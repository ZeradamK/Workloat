"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import PurchaseTrackerCard from "@/components/tracker/PurchaseTrackerCard";

/**
 * Cosmos-style split auth flow: white form column left, #EEEEEE showcase
 * right, one question per step. Sign up = email → password → full name,
 * then a Supabase auth user is created and the signup is recorded in
 * `website_signups` for launch emails. Login = email → password.
 */

type Step = "email" | "password" | "name";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* same demo series the hero's tracker card runs */
const TRACKER_DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const TRACKER_X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

const BARS = [
  {
    name: "DoorDash",
    logo: "/logos/doordash.webp",
    amount: "$9.99",
    note: "Being charged tomorrow",
    pos: "left-[14%] top-[26%]",
  },
  {
    name: "Spotify",
    logo: "/logos/spotify.webp",
    amount: "$11.99",
    note: "Renews tomorrow",
    pos: "right-[10%] top-[42%]",
  },
  {
    name: "Netflix",
    logo: "/logos/netflix.webp",
    amount: "$15.49",
    note: "Charged on Friday",
    pos: "left-[20%] top-[58%]",
  },
];

const CAPTIONS: Record<Step, [string, string] | null> = {
  email: null,
  password: null,
  name: ["Your purchases, refunds, and renewals in one place.", "Tracked by Payloat"],
};

export default function SignupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [routing, setRouting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "signup" | "signup-live" | "login">(
    null,
  );
  const [consent, setConsent] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const checkSeq = useRef(0);
  const oauthHandled = useRef(false);
  const redirectTimer = useRef<number | null>(null);

  /* leaving the page cancels any scheduled redirect home */
  useEffect(
    () => () => {
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    },
    [],
  );

  const busy = routing || submitting || done !== null;

  /* already signed in? OAuth return lands here too */
  useEffect(() => {
    const fromGoogle =
      new URLSearchParams(window.location.search).get("from") === "google";
    const settleOAuth = (session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } }) => {
      if (oauthHandled.current) return;
      oauthHandled.current = true;
      let consented = false;
      try {
        consented = localStorage.getItem("payloat.consent") === "1";
        localStorage.removeItem("payloat.consent");
      } catch {}
      const u = session.user;
      if (u.email) {
        void supabase.from("website_signups").insert({
          email: u.email.toLowerCase(),
          full_name:
            (u.user_metadata?.full_name as string | undefined) ?? null,
          source: "google",
          marketing_consent: consented,
          user_id: u.id,
        });
      }
      setDone("login");
      redirectTimer.current = window.setTimeout(
        () => router.push("/web-app"),
        2000,
      );
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      if (fromGoogle) settleOAuth(data.session);
      else router.replace("/web-app");
    });
    if (fromGoogle) {
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session) settleOAuth(session);
      });
      return () => sub.subscription.unsubscribe();
    }
  }, [router]);

  /* real-time duplicate check while the visitor types */
  useEffect(() => {
    setEmailTaken(false);
    if (mode !== "signup" || step !== "email") return;
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) return;
    const id = window.setTimeout(async () => {
      const seq = ++checkSeq.current;
      const { data } = await supabase.rpc("email_exists", {
        check_email: value,
      });
      if (seq === checkSeq.current) setEmailTaken(data === true);
    }, 450);
    return () => window.clearTimeout(id);
  }, [email, mode, step]);

  const googleSignIn = async () => {
    if (mode === "signup" && !consent) return;
    try {
      localStorage.setItem("payloat.consent", consent ? "1" : "0");
    } catch {}
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/signup?from=google` },
    });
  };

  /* brief loader spin between steps, so moving through the flow reads as
     routing the way the reference does */
  const goTo = (next: Step) => {
    setError(null);
    setRouting(true);
    window.setTimeout(() => {
      setRouting(false);
      setStep(next);
    }, 420);
  };

  const back = () => {
    setError(null);
    if (step === "name") goTo("password");
    else if (step === "password") goTo("email");
    else router.push("/");
  };

  const finishSignup = async () => {
    setSubmitting(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const { data: signUpData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (authErr) {
      setSubmitting(false);
      if (/already/i.test(authErr.message)) {
        /* the live check missed it (race): back to the email step with the
           account-exists notice instead of a false success */
        setStep("email");
        setEmailTaken(true);
        return;
      }
      setError(authErr.message);
      return;
    }

    /* marketing capture: best-effort, a duplicate email is fine. With a live
       session the row carries user_id (ownership key); pre-confirmation there
       is no uid yet, so the anon insert-only path applies. */
    const newUserId = signUpData?.session?.user.id ?? null;
    const { error: rowErr } = await supabase
      .from("website_signups")
      .insert({
        email: cleanEmail,
        full_name: name.trim(),
        source: "website",
        marketing_consent: true,
        ...(newUserId ? { user_id: newUserId } : {}),
      });
    if (rowErr && rowErr.code !== "23505") {
      console.warn("website_signups insert failed:", rowErr.message);
    }

    /* the keep-you-in-the-loop moment, then home */
    setSubmitting(false);
    setDone(signUpData?.session ? "signup-live" : "signup");
    /* a live session opens the web-app; confirm-first accounts go home */
    const dest = signUpData?.session ? "/web-app" : "/";
    redirectTimer.current = window.setTimeout(() => router.push(dest), 3200);
  };

  const finishLogin = async () => {
    setSubmitting(true);
    setError(null);
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (authErr) {
      setError(
        /invalid login credentials/i.test(authErr.message)
          ? "That password doesn't match. If you joined with Google, use Continue with Google instead."
          : /email not confirmed/i.test(authErr.message)
            ? "Confirm your email first. Check your inbox for the link."
            : authErr.message,
      );
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setDone("login");
    redirectTimer.current = window.setTimeout(
      () => router.push("/web-app"),
      2000,
    );
  };

  const submitStep = () => {
    if (busy) return;
    if (
      step === "email" &&
      EMAIL_RE.test(email.trim()) &&
      (mode === "login" || (consent && !emailTaken))
    ) {
      goTo("password");
    } else if (step === "password" && password.length >= 8) {
      if (mode === "login") void finishLogin();
      else goTo("name");
    } else if (step === "name" && name.trim().length > 1) {
      void finishSignup();
    }
  };

  const valid =
    step === "email"
      ? EMAIL_RE.test(email.trim()) &&
        (mode === "login" || (consent && !emailTaken))
      : step === "password"
        ? password.length >= 8
        : name.trim().length > 1;

  const heading =
    step === "email"
      ? { title: "Email address", sub: null }
      : step === "password"
        ? mode === "login"
          ? { title: "Enter your password", sub: "Welcome back" }
          : { title: "Choose a password", sub: "Keep your account secure" }
        : { title: "What's your full name?", sub: "Let's get to know you" };

  return (
    <main className="grid min-h-screen bg-white min-[900px]:grid-cols-2">
      {/* ---- Left: the form column ---- */}
      <div className="relative flex flex-col items-center px-6">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className="absolute left-6 top-7 p-2 text-ink transition-opacity hover:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M19 12H5m0 0 6.5 6.5M5 12l6.5-6.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="mt-[60px]">
          <DotSpinner spinning={busy} />
        </div>

        <div className="flex w-[min(440px,100%)] flex-1 flex-col justify-center pb-24">
          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.6, 0.2, 1] }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e9e56]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="m5 12.5 4.5 4.5L19 7.5"
                    stroke="#fff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h1 className="mt-6 text-[24px] font-semibold tracking-[-0.4px] text-ink">
                {done === "signup" ? "You're all set" : "You're signed in"}
              </h1>
              <p className="mt-2 max-w-[320px] text-[15px] leading-[1.5] text-sub">
                {done === "signup"
                  ? "Confirm your email from your inbox. We'll keep you in the loop."
                  : done === "signup-live"
                    ? "We'll keep you in the loop."
                    : "Welcome back."}
              </p>
              <p className="mt-6 text-[13px] text-sub">
                {done === "signup" ? "Taking you home" : "Opening your dashboard"}
              </p>
            </motion.div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.25, 0.6, 0.2, 1] }}
            >
              <h1 className="text-center text-[24px] font-semibold tracking-[-0.4px] text-ink">
                {heading.title}
              </h1>
              <p className="mt-1.5 text-center text-[16px] text-sub">
                {step === "email" ? (
                  mode === "signup" ? (
                    <>
                      Get started or{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-ink transition-opacity hover:opacity-60"
                      >
                        login
                      </button>
                    </>
                  ) : (
                    <>
                      Login or{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-ink transition-opacity hover:opacity-60"
                      >
                        get started
                      </button>
                    </>
                  )
                ) : (
                  heading.sub
                )}
              </p>

              <form
                className="mt-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitStep();
                }}
              >
                {step === "email" && (
                  <>
                    <input
                      type="email"
                      autoFocus
                      placeholder="Email"
                      aria-label="Email address"
                      aria-describedby={
                        mode === "signup" && emailTaken
                          ? "email-taken-note"
                          : undefined
                      }
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-[16px] border border-solid border-black/10 bg-white px-6 py-[17px] text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
                    />
                    {mode === "signup" && emailTaken && (
                      <div
                        id="email-taken-note"
                        className="mt-3 flex items-center justify-between gap-3 rounded-[14px] bg-[#fdf2f1] px-4 py-3"
                      >
                        <p className="text-[13px] leading-snug text-[#c2402a]">
                          There is an account with this email.
                        </p>
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="shrink-0 text-[13px] font-semibold text-ink underline underline-offset-2 transition-opacity hover:opacity-60"
                        >
                          Log in instead
                        </button>
                      </div>
                    )}
                    {mode === "signup" && (
                      <label className="mt-4 flex cursor-pointer select-none items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="peer sr-only"
                        />
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-solid border-black/25 bg-white transition-colors peer-checked:border-[#0a0a0a] peer-checked:bg-[#0a0a0a]">
                          {consent && (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="m5 12.5 4.5 4.5L19 7.5"
                                stroke="#fff"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="text-[13px] leading-[1.45] text-sub">
                          I agree to the{" "}
                          <a
                            href="/privacy.html"
                            target="_blank"
                            rel="noopener"
                            className="font-medium text-ink underline underline-offset-2"
                          >
                            Privacy Policy
                          </a>{" "}
                          and to receive launch news and updates from Payloat.
                        </span>
                      </label>
                    )}
                  </>
                )}
                {step === "password" && (
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      autoFocus
                      placeholder="Password"
                      aria-label="Password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-[16px] border border-solid border-black/10 bg-white py-[17px] pl-6 pr-14 text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-sub transition-opacity hover:opacity-60"
                    >
                      <EyeIcon off={!showPw} />
                    </button>
                  </div>
                )}
                {step === "name" && (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Full name"
                    aria-label="Full name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[16px] border border-solid border-black/10 bg-white px-6 py-[17px] text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
                  />
                )}

                <button
                  type="submit"
                  disabled={!valid || busy}
                  className={`mt-4 h-[56px] w-full rounded-full text-[16px] font-medium transition-colors duration-200 ${
                    valid && !busy
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-[#f1f0ee] text-[#b3b1ac]"
                  }`}
                >
                  {step === "name" || (mode === "login" && step === "password")
                    ? submitting
                      ? "One moment"
                      : mode === "login"
                        ? "Login"
                        : "Next"
                    : "Next"}
                </button>

                {step === "email" && (
                  <>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-px flex-1 bg-black/10" />
                      <span className="text-[13px] text-sub">or</span>
                      <span className="h-px flex-1 bg-black/10" />
                    </div>
                    <button
                      type="button"
                      onClick={googleSignIn}
                      disabled={mode === "signup" && !consent}
                      className="mt-5 flex h-[56px] w-full items-center justify-center gap-3 rounded-full border border-solid border-black/15 bg-white text-[16px] font-medium text-ink transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                    >
                      <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden>
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.5 17.7 9.5 24 9.5Z"
                        />
                        <path
                          fill="#4285F4"
                          d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h13.2c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.4-4.1 7.6-10.2 7.6-17.7Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.5 28.6a14.4 14.4 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2Z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.2 0 11.4-2 15.2-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.6 2.3-6.3 0-11.6-4-13.5-9.6l-7.9 6.2C6.5 42.6 14.6 48 24 48Z"
                        />
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}
                {error && (
                  <p className="mt-3 text-center text-[13px] text-[#c2402a]">
                    {error}
                  </p>
                )}
                {mode === "signup" && step === "name" && (
                  <p className="mt-4 text-center text-[12px] leading-[1.5] text-sub">
                    By signing up you agree to receive launch news and product
                    updates from Payloat. You can unsubscribe at any time.
                  </p>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
          )}
        </div>

        <div className="absolute bottom-9">
          <Image
            src="/payloat-logo-dark.svg"
            alt="Payloat"
            width={132}
            height={26}
            className="h-[22px] w-auto"
          />
        </div>
      </div>

      {/* ---- Right: living shader showcase, one scene per step ---- */}
      <aside className="hidden p-[20px] min-[900px]:block">
        <div className="relative h-full w-full overflow-hidden rounded-[20px]">
        <GlareBackdrop />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {step === "email" &&
              BARS.map((n) => (
                <div key={n.name} className={`absolute ${n.pos}`}>
                  <NotifBar {...n} />
                </div>
              ))}

            {step === "password" && (
              <div className="absolute left-1/2 top-[32%] flex h-[220px] w-[300px] -translate-x-1/2 items-center justify-center rounded-[28px] bg-white">
                <LockIcon />
              </div>
            )}

            {step === "name" && (
              <div className="absolute left-1/2 top-[24%] w-[300px] -translate-x-1/2">
                <PurchaseTrackerCard
                  countUp
                  tone="dark"
                  purchases={42}
                  spend={2350}
                  purchasesChange={8}
                  spendChange={14}
                  daily={TRACKER_DAILY}
                  xLabels={TRACKER_X_LABELS}
                />
              </div>
            )}

            {CAPTIONS[step] && (
              <p className="absolute bottom-8 left-8 text-[12px] leading-[1.5]">
                <span className="block text-ink">{CAPTIONS[step]![0]}</span>
                <span className="block text-ink/50">{CAPTIONS[step]![1]}</span>
              </p>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </aside>
    </main>
  );
}

/* ---------- pieces ---------- */

/** The blue gradient still, with soft light roaming over it the way the
    living shader moved. Two counter-drifting glare blobs on screen blend. */
function GlareBackdrop() {
  return (
    <div className="absolute inset-0 bg-[#0a1a8a]">
      <Image
        src="/signup-gradient.jpg"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <motion.div
        className="pointer-events-none absolute left-0 top-0 h-[75%] w-[75%] mix-blend-screen blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.5), rgba(150,180,255,0.16) 55%, transparent 72%)",
        }}
        animate={{ x: ["-15%", "70%", "45%", "-15%"], y: ["70%", "-10%", "55%", "70%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-0 top-0 h-[55%] w-[55%] mix-blend-screen blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(120,160,255,0.35), transparent 70%)",
        }}
        animate={{ x: ["85%", "5%", "60%", "85%"], y: ["5%", "65%", "85%", "5%"] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/** Cosmos-style flower loader: still while idle, spins while working. */
function DotSpinner({ spinning }: { spinning: boolean }) {
  const dots = ["#0a0a0a", "#0a0a0a", "#cfcdc8", "#cfcdc8", "#cfcdc8", "#0a0a0a"];
  return (
    <motion.div
      className="relative h-8 w-8"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={
        spinning
          ? { repeat: Infinity, ease: "linear", duration: 0.9 }
          : { duration: 0.3 }
      }
    >
      {dots.map((c, i) => {
        const a = (i * Math.PI) / 3;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-[7px] w-[7px] rounded-full"
            style={{
              backgroundColor: c,
              transform: `translate(calc(-50% + ${Math.sin(a) * 11}px), calc(-50% + ${-Math.cos(a) * 11}px))`,
            }}
          />
        );
      })}
      <span className="absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a]" />
    </motion.div>
  );
}

function NotifBar({
  name,
  logo,
  amount,
  note,
}: {
  name: string;
  logo: string;
  amount: string;
  note: string;
}) {
  return (
    <div className="flex w-[320px] items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-2.5">
      <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-[#eeeeee]">
        <Image
          src={logo}
          alt={name}
          width={54}
          height={54}
          className="h-[27px] w-[27px] rounded-[5px] object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold text-ink">{name}</span>
        <span className="block text-[13px] leading-snug text-sub">{note}</span>
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.43px] text-ink">
        {amount}
      </span>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="m6 3.5 5 4.5-5 4.5"
          stroke="#b3b1ac"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0a0a0a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      <circle cx="12" cy="15.5" r="1.4" fill="#0a0a0a" stroke="none" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  );
}
