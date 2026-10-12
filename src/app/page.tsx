import NavDock from "@/components/NavDock";
import HeroShowcase from "@/components/HeroShowcase";
import GoalSection from "@/components/GoalSection";
import HeroTabs from "@/components/HeroTabs";
import StatsStatement from "@/components/StatsStatement";
import SlackSection from "@/components/SlackSection";
import WhereverYouWork from "@/components/WhereverYouWork";
import AgentPromptSection from "@/components/AgentPromptSection";
import FAQSection from "@/components/FAQSection";
import { Compatible } from "@/components/EnterpriseBlocks";
import FinanceSplits from "@/components/FinanceSplits";
import IntegrationHead from "@/components/IntegrationHead";
import EnterpriseNative from "@/components/EnterpriseNative";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main className="bg-[#eeeeee]">
      <NavDock />

      {/* Pinned hero act: still section, parallaxed middle column
          (tracker → wallet stack → total spending). Dormant sections in
          src/components: IntroZoom + ShaderBackground. */}
      <HeroShowcase />

      {/* Pinned goal act: word-by-word headline fill + charge-notice
          notifications; releases once everything is solid. */}
      <GoalSection />

      {/* the product tour: chat, inbox, approvals and the record, in tabs */}
      <HeroTabs />

      {/* How Loats work: four cards wired to the brick grid around the tile */}

      {/* the green stats and statement act, shared with the finance
          teams page, easing into black toward the agent act */}
      <StatsStatement
        stats={[
          { label: "Your financial manager Loat watches every account", value: "24/7" },
          { label: "Place for every team's spending", value: "1" },
          { label: "Budgets that run out without a warning", value: "0" },
        ]}
        quote="Every team spends a little every day, and nobody adds it up until the month closes. I keep the running total for the whole company, tell you before a budget runs low, and ask before anything goes over."
        name="Sona"
        role="Financial manager Loat on Workloat"
        to="#0a0a0a"
        ground="#eeeeee"
        ink="dark"
        clearNav
      />

      {/* Agent act on black: the prompt card with the gradient shine. (Track everything is parked;
          TrackSection.tsx stays in the repo.) */}
      <AgentPromptSection />

      {/* Slack act on white: the laptop's base tucks under the next
          section */}
      <SlackSection />

      {/* Wherever your team works: the Slack window, then the web app,
          email and meetings cards */}
      <WhereverYouWork />

      {/* a head on Ada's anatomy (the tools Sona works in), then the two
          cards from the finance teams page: approvals with the evidence,
          and budgets by team */}
      <IntegrationHead />
      <FinanceSplits />

      {/* Loats built into the infrastructure an enterprise already runs,
          on Vercel's "infrastructure that thinks like them" */}
      <EnterpriseNative />

      {/* the compatibility grid, shared with the enterprise page. The plans
          (Pricing, in EnterpriseBlocks) are off the home page and wait for
          the pricing page. */}
      <Compatible />

      {/* FAQ accordion */}

      <FAQSection tone="dark" />

      {/* Footer */}
      <div style={{ backgroundColor: "#0a0a0a" }}>
        <FooterSection tone="light" />
      </div>
    </main>
  );
}
