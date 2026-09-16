import NavDock from "@/components/NavDock";
import HeroShowcase from "@/components/HeroShowcase";
import GoalSection from "@/components/GoalSection";
import StatsStatement from "@/components/StatsStatement";
import MarketsSection from "@/components/MarketsSection";
import SecuritySection from "@/components/SecuritySection";
import SlackSection from "@/components/SlackSection";
import TrackSection from "@/components/TrackSection";
import SpendMixSection from "@/components/SpendMixSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <NavDock
        heroSurface={{ bg: "#ffffff", fg: "#0a0a0a", pill: "#eeeeee" }}
      />

      {/* Pinned hero act: still section, parallaxed middle column
          (tracker → wallet stack → total spending). Dormant sections in
          src/components: IntroZoom + ShaderBackground. */}
      <HeroShowcase />

      {/* Pinned goal act: word-by-word headline fill + charge-notice
          notifications; releases once everything is solid. */}
      <GoalSection />

      {/* the green stats and statement act, shared with the finance
          teams page, easing into white before the Slack act */}
      <StatsStatement
        stats={[
          { label: "Payloat watches agent purchases", value: "24/7" },
          { label: "To match a charge to the task behind it", value: "<1s" },
          { label: "Receipts you chase down by hand", value: "0" },
        ]}
        quote="Agents do not announce what they buy. Payloat Ledger records every purchase the moment it lands, with the task behind it, so you know what was bought and why before the receipt arrives."
        name="Payloat Ledger"
        role="One ledger for every agent's spend"
      />

      {/* Slack act: tilted monitor, @Payloat answers a spend question */}
      <SlackSection />

      {/* Track everything: the pinned mocks, spend by day and upcoming charges */}
      <TrackSection />

      {/* Markets closer: shader card + white $0 on black */}
      <MarketsSection />

      {/* Spend mix: banks and agents in one place, three bars filling in */}
      <SpendMixSection />

      {/* Security trio: live clock, alert toasts, lock toggle */}
      <SecuritySection />

      {/* FAQ accordion */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}
