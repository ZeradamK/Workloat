import NavDock from "@/components/NavDock";
import HeroShowcase from "@/components/HeroShowcase";
import GoalSection from "@/components/GoalSection";
import StatsStatement from "@/components/StatsStatement";
import FlowHero from "@/components/FlowHero";
import MarketsSection from "@/components/MarketsSection";
import SecuritySection from "@/components/SecuritySection";
import SlackSection from "@/components/SlackSection";
import AgentPromptSection, { AgentLogoStrip } from "@/components/AgentPromptSection";
import FAQSection from "@/components/FAQSection";
import { Compatible, Pricing } from "@/components/EnterpriseBlocks";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#eeeeee" }}>
      <NavDock />

      {/* Pinned hero act: still section, parallaxed middle column
          (tracker → wallet stack → total spending). Dormant sections in
          src/components: IntroZoom + ShaderBackground. */}
      <HeroShowcase />

      {/* Pinned goal act: word-by-word headline fill + charge-notice
          notifications; releases once everything is solid. */}
      <GoalSection />

      {/* the green stats and statement act, shared with the finance
          teams page, easing into black toward the agent act */}
      <StatsStatement
        stats={[
          { label: "Payloat watches agent purchases", value: "24/7" },
          { label: "To match a charge to the task behind it", value: "<1s" },
          { label: "Receipts you chase down by hand", value: "0" },
        ]}
        quote="Agents do not announce what they buy. Payloat Ledger records every purchase the moment it lands, with the task behind it, so you know what was bought and why before the receipt arrives."
        name="Payloat Ledger"
        role="One ledger for every agent's spend"
        to="#0a0a0a"
        ground="#eeeeee"
        ink="dark"
      />

      {/* Agent act on black: the prompt card with the gradient shine,
          vendor logos, and the render band. (Track everything is parked;
          TrackSection.tsx stays in the repo.) */}
      <AgentPromptSection />

      {/* the act's logo strip, on the same black */}
      <div style={{ backgroundColor: "#0a0a0a" }}>
        <AgentLogoStrip />
      </div>

      {/* Slack act on white: the laptop's base tucks under the next
          section */}
      <SlackSection />

      {/* the flow hero, shared with the finance teams page, with the
          ledger's own copy; on white, over the Slack act's foot */}
      <div className="relative z-10">
        <FlowHero
          tone="dark"
          lines={["One ledger", "for every", "dollar your", "agents", "spend."]}
          body="Payloat records every agent purchase the moment it lands, matches it to the task behind it, and keeps every bank and card in one place."
          cta={{ label: "Get started", href: "/signup" }}
          tasks={[
            "API credits",
            "Flight bookings",
            "Grocery reorders",
            "Cloud hosting",
            "Ad spend",
            "Subscription renewals",
            "Research tools",
            "Stock orders",
            "Receipt matching",
            "Refund tracking",
            "Spend by task",
            "Budget caps",
            "Card issuing",
            "Vendor payments",
            "Travel expenses",
            "Software seats",
            "Data purchases",
            "Overspend alerts",
            "Monthly summaries",
            "Bank sync",
          ]}
          from="You"
          agent="Payloat"
          to="Your agents"
          trustedLabel="Works with the banks and cards you already use"
          logos={[
            { src: "/logos/banks/chase.jpg", alt: "Chase", tile: true },
            { src: "/logos/banks/mercury.png", alt: "Mercury", tile: true },
            { src: "/logos/brex.svg", alt: "Brex" },
            { src: "/logos/banks/capitalone.svg", alt: "Capital One" },
            { src: "/logos/banks/citi.png", alt: "Citi" },
            { src: "/logos/banks/wellsfargo.png", alt: "Wells Fargo", tile: true },
          ]}
        />
      </div>

      {/* the compatibility grid and the plans, shared with the enterprise page */}
      <Compatible />
      <Pricing />

      {/* Markets closer: shader card + white $0 on black */}
      <MarketsSection />

      {/* Security trio: live clock, alert toasts, lock toggle */}
      <SecuritySection />

      {/* FAQ accordion */}

      <FAQSection tone="dark" />

      {/* Footer */}
      <div style={{ backgroundColor: "#0a0a0a" }}>
        <FooterSection tone="light" />
      </div>
    </main>
  );
}
