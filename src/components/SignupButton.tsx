import Link from "next/link";
import BrickMorph from "./BrickMorph";
import { mono } from "./monoFont";

/**
 * The sign-up button from the "Workloat sign up button" design: black,
 * 54px tall, a 44px framed tile on the left where bricks walk through
 * W O R K L O A T, then the label in Geist Mono, uppercase and tracked.
 */

export default function SignupButton({ href = "/signup", label = "Sign up now" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className={`${mono.className} group inline-flex h-[54px] items-center gap-[14px] rounded-[7px] border border-solid border-black bg-black py-[5px] pl-[5px] pr-5 text-[12px] font-medium uppercase leading-none tracking-[0.09em] text-white no-underline transition-[background-color,border-color,transform] duration-150 hover:border-[#2a2a2a] hover:bg-[#121212] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white focus-visible:shadow-[0_0_0_5px_#000]`}
    >
      {/* the tile, with a hairline ring drawn above the animation like a framed thumbnail */}
      <span className="relative h-[44px] w-[44px] flex-none overflow-hidden rounded-[5px] bg-black after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] after:content-['']">
        <BrickMorph size={44} fill={0.78} theme="dark" />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
