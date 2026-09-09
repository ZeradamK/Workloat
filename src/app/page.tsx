import NavDock from "@/components/NavDock";
import HeroShowcase from "@/components/HeroShowcase";
import GoalSection from "@/components/GoalSection";
import MarketsSection from "@/components/MarketsSection";
import SecuritySection from "@/components/SecuritySection";
import SlackSection from "@/components/SlackSection";
import TravelSection from "@/components/TravelSection";
import EverydaySection from "@/components/EverydaySection";
import PayrollSection from "@/components/PayrollSection";
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

      {/* Travel act: cycling photo card + trip spend bars */}
      <TravelSection />

      {/* Markets closer: shader card + white $0 on black */}
      <MarketsSection />

      {/* Payloat Payroll for small businesses */}
      <PayrollSection />

      {/* Security trio: live clock, alert toasts, lock toggle */}
      <SecuritySection />

      {/* Everyday money inbox teaser, deep-links into the features act */}
      <EverydaySection />

      {/* FAQ accordion */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}
