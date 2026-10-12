"use client";

import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import OwnYourLoats from "@/components/OwnYourLoats";
import EnterpriseNative from "@/components/EnterpriseNative";
import EnterpriseFlow from "@/components/EnterpriseFlow";

/**
 * Enterprise page:
 *   1. Loats native to the enterprise (EnterpriseNative, shared with the
 *      home page), opening the page: the headline, the company cycle.
 *   2. Build, launch, iterate (EnterpriseFlow), on Voiceflow's panels.
 *   3. Own your Loats (OwnYourLoats), on Zaro's cards: your model, your
 *      infrastructure, your data.
 *   4. Footer, light: white ground, black type, the black mark and
 *      dark rules.
 *
 * Taken off on 2026-10-09: the hero ("Every agent, one ledger", in
 * design-archive/enterprise-hero.tsx.txt), the black Stages act (in
 * design-archive/enterprise-stages.tsx.txt), the compatibility grid and
 * the plans (both still in EnterpriseBlocks).
 */

export default function EnterprisePage() {
  return (
    <main className="bg-[#eeeeee]">
      <NavDock forceDark />
      <EnterpriseNative lead />
      <EnterpriseFlow />
      <OwnYourLoats />
      <div style={{ backgroundColor: "#ffffff" }}>
        <FooterSection tone="dark" />
      </div>
    </main>
  );
}
