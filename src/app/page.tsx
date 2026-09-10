import NavDock from "@/components/NavDock";
import HeroShowcase from "@/components/HeroShowcase";
import GoalSection from "@/components/GoalSection";
import MarketsSection from "@/components/MarketsSection";
import SecuritySection from "@/components/SecuritySection";
import SlackSection from "@/components/SlackSection";
import ControlSection from "@/components/ControlSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <NavDock />

      {/* Pinned hero act: still section, parallaxed middle column
          (tracker → wallet stack → total spending). Dormant sections in
          src/components: IntroZoom + ShaderBackground. */}
      <HeroShowcase />

      {/* Pinned goal act: word-by-word headline fill + charge-notice
          notifications; releases once everything is solid. */}
      <GoalSection />

      {/* Slack act: tilted monitor, @Payloat answers a spend question */}
      <SlackSection />

      {/* Markets closer: shader card + white $0 on black */}
      <MarketsSection />

      {/* Founder pitch: control who spends with agents, the spend controls screen */}
      <ControlSection />

      {/* Security trio: live clock, alert toasts, lock toggle */}
      <SecuritySection />

      {/* FAQ accordion */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}
