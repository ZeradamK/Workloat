import Link from "next/link";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";

/**
 * The 404, on Harvey's anatomy: a full-bleed film with the headline set
 * left over it, a short line under it, and an outlined return. The film
 * carries a note on the television set in shot, lying on the glass at
 * the screen's own angle.
 *
 * The nav and the footer keep the page's #eeeeee, so the film reads as
 * one framed act between them rather than running under the bar.
 */

/* The footage. Drop the file at public/404/tv.mp4 (and optionally a
   .webm beside it, plus a first-frame still as tv-poster.jpg). Until
   then the act falls back to its ink ground and everything else on the
   page is unaffected. */
const FILM = "/404/tv.mp4";
const FILM_WEBM = "/404/tv.webm";
const POSTER = "/404/tv-poster.jpg";

/* Where the note sits on the television in the frame, and how it lies
   on the glass. These five values are the whole calibration: read the
   screen's centre off the footage as a percentage of the frame, set the
   width to the screen's width, then turn the note until its edges run
   parallel to the screen's. */
const TV = {
  left: "63%",
  top: "44%",
  width: "clamp(140px, 15vw, 280px)",
  rotate: "perspective(900px) rotateY(-15deg) rotateX(4deg) rotate(-1.5deg)",
  glow: "0 0 34px rgba(255,255,255,0.28)",
};

export default function NotFound() {
  return (
    <main className="bg-[#eeeeee]">
      {/* pinned light: the film would otherwise flip the bar dark as
          it scrolls under it */}
      <NavDock skin="light" />

      {/* the act, below the bar so the bar keeps the page's ground */}
      <section className="px-[clamp(0px,1.7vw,32px)] pt-[76px]">
        <div className="relative mx-auto w-full max-w-[1860px] overflow-hidden">
          <div className="relative h-[clamp(520px,78vh,860px)] w-full bg-[#0a0a0a]">
            {/* the film, looping silently */}
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={POSTER}
              aria-hidden
            >
              <source src={FILM_WEBM} type="video/webm" />
              <source src={FILM} type="video/mp4" />
            </video>

            {/* the wash: #eeeeee at 20% across the whole film */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(238,238,238,0.2)" }}
              aria-hidden
            />
            {/* a scrim under the type only, so the headline holds its
                contrast whatever the frame behind it is doing */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(10,10,10,0.72), rgba(10,10,10,0.38) 42%, rgba(10,10,10,0) 68%)",
              }}
              aria-hidden
            />

            {/* the note on the television */}
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: TV.left, top: TV.top, width: TV.width, transform: `translate(-50%,-50%) ${TV.rotate}` }}
              aria-hidden
            >
              <p
                className="text-center font-numeral text-[clamp(11px,1.15vw,20px)] font-semibold uppercase leading-[1.25] tracking-[0.16em] text-white"
                style={{ textShadow: TV.glow }}
              >
                404
                <br />
                page not found
              </p>
            </div>

            {/* the headline, set left over the film */}
            <div className="relative flex h-full items-center">
              <div className="px-[clamp(24px,5vw,96px)]">
                <h1 className="max-w-[16ch] text-[clamp(40px,5.6vw,104px)] font-medium leading-[0.98] tracking-[-3px] text-white">
                  This page is not available.
                </h1>
                <p className="mt-[clamp(20px,2vw,34px)] max-w-[42ch] text-[clamp(15px,1.1vw,20px)] leading-[1.45] text-white/80">
                  The page you are looking for has moved, or it never
                  existed. Everything your agents spent is still where you
                  left it.
                </p>
                <Link
                  href="/"
                  className="mt-[clamp(28px,3vw,52px)] inline-flex h-[52px] items-center border border-solid border-white/45 px-8 text-[14px] font-semibold tracking-[-0.3px] text-white transition-colors hover:border-white hover:bg-white hover:text-ink"
                >
                  Return to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection tone="dark" />
    </main>
  );
}
