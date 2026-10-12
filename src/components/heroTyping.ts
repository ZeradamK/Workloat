/**
 * A person's typing, for the hero's composer: 108 words a minute
 * (72 sped up by 1.5; five characters a word) in zips and pauses. A
 * burst of one to three words goes down quickly, common letter pairs
 * quickest, then a pause before the next burst, longer after a comma or
 * full stop, and now and then a slip to a neighbouring key, noticed and
 * backspaced. The bursts keep their pace; whatever time is left to hit
 * that pace goes to the pauses.
 */

const WPM = 72 * 1.5;
const MS_PER_CHAR = 60000 / (WPM * 5);

const QUICK = new Set(["th", "he", "in", "er", "an", "re", "on", "en", "nd", "st", "es", "ed", "ou", "to", "it", "ea", "ha", "at", "ng", "or", "ti", "is", "le", "ve"]);
const NEAR: Record<string, string> = {
  a: "sq", b: "vn", c: "xv", d: "sf", e: "wr", f: "dg", g: "fh", h: "gj", i: "uo", j: "hk", k: "jl", l: "k",
  m: "n", n: "bm", o: "ip", p: "o", q: "w", r: "et", s: "ad", t: "ry", u: "yi", v: "cb", w: "qe", x: "zc", y: "tu", z: "x",
};
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const isLetter = (c: string | undefined) => !!c && /[a-z]/i.test(c);

/* one keystroke on screen: how long after the last (`zip`, the hand
   moving, plus `pause`, the hand waiting) and the field's text after it */
type Step = { zip: number; pause: number; text: string };

/* the whole line planned up front, so its pauses can be stretched to land
   it at exactly WPM */
export function planTyping(req: string): { ms: number; text: string }[] {
  const steps: Step[] = [];
  let out = "";
  let left = 0; // words left in this burst
  for (let n = 0; n < req.length; n++) {
    const ch = req[n], prev = req[n - 1];
    let zip = rand(65, 105), pause = 0;
    if (isLetter(prev) && isLetter(ch) && QUICK.has((prev + ch).toLowerCase())) zip *= 0.7;
    if (ch !== ch.toLowerCase()) zip += 40; // shift
    if (n === 0) pause = rand(0.6, 0.9);
    else if (prev === " ") {
      // a new word: inside a burst it follows quickly; a new burst waits
      if (left > 0) { left--; zip += rand(40, 90); }
      else { left = Math.floor(rand(0, 3)); pause = rand(1, 1.6); }
      if (req[n - 2] === "," || req[n - 2] === ".") pause += 0.8;
    }
    const near = NEAR[ch.toLowerCase()];
    if (near && n > 8 && Math.random() < 0.02) {
      const slip = near[Math.floor(Math.random() * near.length)];
      steps.push({ zip, pause, text: out + slip });
      steps.push({ zip: rand(170, 300), pause: 0, text: out }); // noticed, backspaced
      zip = rand(80, 130); pause = 0;
    }
    out += ch;
    steps.push({ zip, pause, text: out });
  }
  // the bursts keep their pace; the time left for WPM goes to the
  // pauses in proportion (if the zips alone run long, everything slows)
  const target = req.length * MS_PER_CHAR;
  const zips = steps.reduce((a, s) => a + s.zip, 0);
  const weights = steps.reduce((a, s) => a + s.pause, 0);
  const spare = target - zips;
  const k = spare > 0 && weights > 0 ? spare / weights : 0;
  const slow = spare > 0 ? 1 : target / zips;
  return steps.map((s) => ({ ms: s.zip * slow + s.pause * k, text: s.text }));
}
