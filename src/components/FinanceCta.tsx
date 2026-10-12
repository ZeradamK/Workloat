import Link from "next/link";
import "./FinanceCta.css";

/**
 * The finance teams page's closing call, on Ada's "elevate your customer
 * experience today": a field of grey squares across the page, a few lit
 * in colour, and a square black card in the middle with the line and a
 * beige Book a demo pill (a black circle with a white arrow at its end).
 *
 * The squares are one tile repeated from the section's centre, so the lit
 * ones and the card sit on the same grid at every width: each lit square
 * is placed by its column and row from the centre (`--x`, `--y`). The lit
 * ones fade in and out slowly; with reduced motion they hold still.
 */

/* lit squares: column and row from the centre, and a colour from the site */
const LIT: { x: number; y: number; c: string; d: number }[] = [
  { x: -14, y: -10, c: "#f2b8c6", d: 0 },
  { x: -13, y: -7, c: "#d4581a", d: 1.6 },
  { x: -9, y: -2, c: "#b9d1ec", d: 3.1 },
  { x: -15, y: 5, c: "#0a0a0a", d: 2.2 },
  { x: -12, y: 4, c: "#163300", d: 4.4 },
  { x: 4, y: -11, c: "#f2b8c6", d: 0.8 },
  { x: 14, y: -6, c: "#f2b8c6", d: 3.6 },
  { x: 6, y: -3, c: "#e3641f", d: 2.6 },
  { x: 11, y: 0, c: "#1e1e1e", d: 1.2 },
  { x: 14, y: 3, c: "#e3641f", d: 4 },
  { x: 1, y: 8, c: "#163300", d: 3.3 },
  { x: 11, y: 9, c: "#f1d79a", d: 0.4 },
  { x: 15, y: 10, c: "#f2b8c6", d: 2 },
];

export default function FinanceCta() {
  return (
    <section className="fcta" aria-labelledby="fcta-title">
      <div className="fcta-field" aria-hidden>
        {LIT.map((s, i) => (
          <i key={i} style={{ "--x": s.x, "--y": s.y, "--c": s.c, "--d": `${s.d}s` } as React.CSSProperties} />
        ))}
      </div>
      <div className="fcta-card">
        <h2 id="fcta-title">Put your finance Loat to work today</h2>
        <Link href="/contact#sales" className="fcta-btn">
          Book a demo
          <span className="fcta-btn__arrow" aria-hidden>
            <svg viewBox="0 0 340.034 340.034"><polygon fill="currentColor" points="222.814,52.783 200.902,74.686 280.748,154.528 0,154.528 0,185.513 280.748,185.513 200.902,265.353 222.814,287.252 340.034,170.023" /></svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
