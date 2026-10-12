"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/lib/supabase";

/* Where every finished sign-in and sign-up lands now the web app is
   parked. The address rides along so the page can show the person which
   one it recorded, and `state` says whether they still owe us a click
   in their inbox. */
function confirmedHref(
  email?: string | null,
  state: "live" | "confirm" | "login" = "live",
) {
  const q = new URLSearchParams({ state });
  if (email) q.set("email", email.trim().toLowerCase());
  return `/signup/confirmed?${q.toString()}`;
}
import AuthScenes from "@/components/AuthScenes";

/**
 * Cosmos-style split auth flow: white form column left, and on large
 * screens five scenes from the site fading one into the next on the right
 * (AuthScenes), one question per step. Sign up = email → password → full name,
 * then a Supabase auth user is created and the signup is recorded in
 * `website_signups` for launch emails. Login = email → password.
 */

type Step = "email" | "password" | "name";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  /* the nav's Log-in lands here as /signup?mode=login */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "login") setMode("login");
  }, []);
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
        consented = localStorage.getItem("workloat.consent") === "1";
        localStorage.removeItem("workloat.consent");
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
        () => router.push(confirmedHref(u.email)),
        2000,
      );
    };
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      if (fromGoogle) settleOAuth(data.session);
      else router.replace(confirmedHref(data.session.user.email));
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
      localStorage.setItem("workloat.consent", consent ? "1" : "0");
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

    /* the keep-you-in-the-loop moment, then the confirmation */
    setSubmitting(false);
    setDone(signUpData?.session ? "signup-live" : "signup");
    redirectTimer.current = window.setTimeout(
      () => router.push(confirmedHref(email, signUpData?.session ? "live" : "confirm")),
      3200,
    );
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
      () => router.push(confirmedHref(email, "login")),
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
                      className="w-full border border-solid border-black/[0.12] bg-white px-6 py-[17px] text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
                    />
                    {mode === "signup" && emailTaken && (
                      <div
                        id="email-taken-note"
                        className="mt-3 flex items-center justify-between gap-3 border border-solid border-black/[0.12] bg-[#fdf2f1] px-4 py-3"
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
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-solid border-black/25 bg-white transition-colors peer-checked:border-[#0a0a0a] peer-checked:bg-[#0a0a0a]">
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
                          and to receive launch news and updates from Workloat.
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
                      className="w-full border border-solid border-black/[0.12] bg-white py-[17px] pl-6 pr-14 text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
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
                    className="w-full border border-solid border-black/[0.12] bg-white px-6 py-[17px] text-[16px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
                  />
                )}

                <button
                  type="submit"
                  disabled={!valid || busy}
                  className={`mt-4 h-[56px] w-full text-[16px] font-medium transition-colors duration-200 ${
                    valid && !busy
                      ? "bg-[#1e1e1e] text-white"
                      : "bg-[#e2e2e0] text-[#a8a6a1]"
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
                      className="mt-5 flex h-[56px] w-full items-center justify-center gap-3 border border-solid border-black/[0.12] bg-white text-[16px] font-medium text-ink transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
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
                    updates from Workloat. You can unsubscribe at any time.
                  </p>
                )}
              </form>
            </motion.div>
          </AnimatePresence>
          )}
        </div>

        <div className="absolute bottom-9">
          <Image
            src="/brand/workloat-wordmark-dark.png"
            alt="Workloat"
            width={936}
            height={111}
            className="h-[15px] w-auto"
          />
        </div>
      </div>

      {/* ---- Right: five scenes from the site, fading one into the next
          (AuthScenes); large screens only ---- */}
      <aside className="hidden p-[20px] min-[900px]:block">
        <div className="relative h-full w-full overflow-hidden rounded-[10px]">
          <AuthScenes />
        </div>
      </aside>
    </main>
  );
}

/* ---------- pieces ---------- */

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
