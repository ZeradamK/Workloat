import { geist, lato, mono, roboto } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./WhereverYouWork.css";

/**
 * Wherever your team works: Slack, the phone and the three cards (web
 * app, email, meetings), drawn as one piece in the design file of that
 * name and carried over unchanged, markup and all. Its stylesheet is
 * scoped under .wtw; its fonts come from next/font and reach the
 * stylesheet as variables.
 */
export default function WhereverYouWork() {
  return (
    <div
      className="wtw"
      style={
        {
          "--wtw-geist": geist.style.fontFamily,
          "--wtw-mono": mono.style.fontFamily,
          "--wtw-lato": lato.style.fontFamily,
          "--wtw-roboto": roboto.style.fontFamily,
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: WHEREVER_HTML }}
    />
  );
}
