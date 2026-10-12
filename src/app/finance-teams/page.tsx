"use client";

import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import FinanceHero from "@/components/FinanceHero";
import FinanceSplits from "@/components/FinanceSplits";
import FinanceRows from "@/components/FinanceRows";
import FinanceReach from "@/components/FinanceReach";
import FinanceProcedures from "@/components/FinanceProcedures";
import FinanceCta from "@/components/FinanceCta";

/**
 * Financial teams page, with Workloat's type and palette:
 *
 *   1. Hero (FinanceHero): "Meet your finance Loat wherever you work",
 *      on Intercom's omnichannel hero, Sona's mailbox and your phone
 *      overlapping on a painted sky.
 *   2. Two feature cards (FinanceSplits), on Intercom's paired cards:
 *      approvals with the evidence, and budgets by team.
 *   3. Three stacked panels (FinanceRows), on Intercom's "across every
 *      channel" section: ask Sona anywhere, a live record for every
 *      vendor, apps and integrations.
 *   4. Reach your Loats from everywhere (FinanceReach), on Intercom's
 *      "integrates with your entire tech stack": copy left, and a 15
 *      second loop of the five ways in on the right.
 *   5. Procedures (FinanceProcedures), on Intercom's "trained to
 *      understand your business deeply": a procedure card with Sona's
 *      chat over it. Marked coming soon.
 *   6. The closing call (FinanceCta), on Ada's square field: a black card,
 *      Book a demo.
 *   7. Footer, light, on the same #eeeeee as the sections above it.
 *
 * Taken off on 2026-10-07 and kept: the opening "Built for how your team
 * spends" act, the flow act (FlowHero, still in src/components), the
 * stats band on the green (StatsStatement, shared with the home page),
 * the workflows carousel, and everything below it (the playbook,
 * security, set up, guides and the CTA card). The archived ones are in
 * design-archive (see its README).
 */

export default function FinanceTeamsPage() {
  return (
    <main className="overflow-x-clip bg-[#eeeeee]">
      <NavDock forceDark />

      <FinanceHero />
      <FinanceSplits />
      <FinanceRows />
      <FinanceReach />
      <FinanceProcedures />
      <FinanceCta />

      {/* the footer in its light skin: black type and the black mark,
          on the page's own ground */}
      <FooterSection tone="dark" />
    </main>
  );
}
