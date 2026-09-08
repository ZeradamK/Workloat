# payloat-ledger

The Payloat Ledger web app: a copy of `payloat-web` re-aimed at agent spend
visibility. See `../THIS-WEEK-PLAN.md` for scope and `../payloat-backend` for
the schema (`0010_agent_ledger.sql`) and the agent write endpoint
(`dashboard-deploy/ledger-record.ts`).

Marketing routes are still the consumer site's and are not part of this
week's work. The product lives under `/web-app`.

```
pnpm dev        # http://localhost:3000/web-app
pnpm build
```
