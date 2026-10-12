# design-archive

Superseded designs, parked whole so a rollback is a copy rather than an
archaeology dig. Files here carry a `.txt` extension so nothing in the
build, the type checker or the linter picks them up.

## NavDock-liquid-glass-bar.tsx.txt

The floating liquid-glass nav: a 64px bar 1200px wide at 1920, centred
under a 16-20px top gap, 5px rounded, filled #E5EEE4 at 70% over a
blur, with a white Sign up box. Replaced by the full-bleed Mews-anatomy
bar flush at top 0.

To roll back:

```sh
cp design-archive/NavDock-liquid-glass-bar.tsx.txt src/components/NavDock.tsx
```

then delete the four-line archive header at the top of the file. The
page heroes were tuned for that bar's 80-84px of occupied height and
were left untouched, so nothing else needs reverting.

## home-flow-hero.tsx.txt

The home page's "One Loat / for every / task your / team / repeats." act
on black: the paragraph and Get started button on the left, the YOU ›
YOUR LOAT › list › BACK TO YOU flow card on the right cycling through 23
workflows (hiring, invoices, month-end close, spend and budgets, travel,
meeting follow-ups, contract renewals and the everyday email work), and
the bank logo strip under it. Taken off the home page on 2026-10-06.

To bring it back, paste the import and the JSX from the file into
`src/app/page.tsx` after `<WhereverYouWork />`. The component and its
`longTasks` option are still in `src/components/FlowHero.tsx`.

## home-markets-section.tsx.txt

The home page's "Get answers from your agents fast" closer, from the
Payloat ledger days: the ALERTS card ("Get a ping when an agent goes past
its cap") over a shader backdrop with the price and volume chart (Jan 2025
to May 2026), and the AGENTS card ("Agents write to the ledger at no cost
per event"). It sat between the compatibility grid and the security trio.
Taken off the home page on 2026-10-06.

To bring it back, paste the import and the JSX from the file into
`src/app/page.tsx` after `<Compatible />`. The component is still in
`src/components/MarketsSection.tsx`.

## Security trio (home)

The home page's "Agent spend tracking built for security" act, with the
Learn about security button and the three cells (24/7 ledger monitoring
with the live clock, real-time purchase alerts, pause any agent). It sat
between the compatibility grid and the FAQ. Taken off the home page on
2026-10-07, at every screen size.

To bring it back, import `SecuritySection` from
`@/components/SecuritySection` in `src/app/page.tsx` and render
`<SecuritySection />` after `<Compatible />`. The component is unchanged.

## finance-teams-built-for.tsx.txt

The finance teams page's opening act: "Built for how your team spends /
A financial manager for your budgets, vendors, and agents.", the Define,
Connect and Report tab rail with the animated agent scenes, an Explore
the platform button, and three ruled stats. Replaced on 2026-10-07 by
FinanceHero (src/components/FinanceHero.tsx), Intercom's omnichannel hero
with Maya's mailbox and the phone.

To bring it back, paste the block into src/app/finance-teams/page.tsx with
its import, and render `<BuiltFor />` where `<FinanceHero />` is.

## finance-teams-lower-acts.tsx.txt

Everything on the finance teams page below the workflows carousel: "The
Payle playbook" on black (Live budgets, Approvals in Slack, Supervised
close, with the Slack exchange), "Enterprise-grade security meets
seamless integration" with the logo strip, "Set up in days, not quarters"
with its three steps and the bank strip, "Guides for finance teams" with
three cards, and the closing "The financial manager your agents report
to." card. Taken off on 2026-10-07.

To bring any back, paste its function (and the consts it reads) into
src/app/finance-teams/page.tsx and render it after `<Workflows />`.

## finance-teams-workflows.tsx.txt

The finance teams page's "Workflows built for finance teams." carousel:
tall canvases for Budgeting, Approvals and Month-end close with pill
labels, arrows, and the "Run a workflow we have not listed?" note. Taken
off on 2026-10-07, with a copy of the page helpers it read. To bring it
back, paste it into src/app/finance-teams/page.tsx with its imports and
render `<Workflows />` after `<FinanceSplits />`.

## enterprise-stages.tsx.txt

The enterprise page's black act: Midday's list of five stages with a
ledger panel playing each in turn. Taken off on 2026-10-09 along with the
compatibility grid and the plans (Compatible and Pricing are still exported
from src/components/EnterpriseBlocks.tsx). The page now runs hero, then
OwnYourLoats, then the footer.

## enterprise-hero.tsx.txt

The enterprise page's hero, "Every agent, one ledger", with the four
colour bar, Get started for free and the photo in a ruled cell. Taken off
on 2026-10-09; the page now opens on the Own your Loats cards.
