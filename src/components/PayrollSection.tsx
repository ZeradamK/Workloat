import ShaderBackground from "./ShaderBackground";

/**
 * Payloat Payroll for small businesses (Deel payroll-hero anatomy): dark
 * rounded container, eyebrow + big headline left, supporting copy right,
 * then a tall media canvas riding the ShaderGradient with floating
 * payroll UI in our notification-bar design.
 */

/* initials on brand-toned circles: no real-person likenesses on marketing */
const EMPLOYEE_AVATARS = [
  { initials: "KM", color: "#d6f251" },
  { initials: "AR", color: "#bcd1f7" },
  { initials: "TO", color: "#f5c6a5" },
];
const CONTRACTOR_AVATARS = [
  { initials: "LS", color: "#e8b8d0" },
  { initials: "JB", color: "#c9e4c5" },
  { initials: "NP", color: "#f5e7a0" },
];

export default function PayrollSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-28 pt-6">
      <div
        className="rounded-[32px] p-8 min-[900px]:p-12"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        {/* header row */}
        <div className="grid gap-8 min-[900px]:grid-cols-2">
          <div>
            <h2 className="text-[clamp(30px,3.4vw,48px)] font-medium leading-[1.1] tracking-[-1.5px] text-white">
              Every agent&apos;s spend
              <br />
              in one ledger, company wide
            </h2>
          </div>
          <div className="flex items-start min-[900px]:justify-end">
            <p className="max-w-[420px] text-[17px] leading-[1.5] text-white/75 min-[900px]:mt-2">
              Procurement, software seats, travel, supplies. Every agent that
              spends for the company writes to the same ledger, so the owner
              sees one picture and each agent can check its own work.
            </p>
          </div>
        </div>

        {/* media canvas: the shader with floating payroll UI */}
        <div className="relative mt-12 flex h-[560px] flex-col items-center justify-center gap-4 overflow-hidden rounded-[20px] px-5 min-[640px]:block">
          <ShaderBackground />

          {/* Employees */}
          <div className="relative flex items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-3 min-[640px]:absolute min-[640px]:right-[8%] min-[640px]:top-[16%]">
            <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[11px] bg-[#eeeeee]">
              <PeopleIcon />
            </span>
            <span className="text-[16px] font-semibold text-ink">
              Procurement
            </span>
            <Chevron />
            <AvatarCluster faces={EMPLOYEE_AVATARS} count="+98" />
          </div>

          {/* Contractors */}
          <div className="relative flex items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-3 min-[640px]:absolute min-[640px]:right-[20%] min-[640px]:top-[34%]">
            <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[11px] bg-[#eeeeee]">
              <GlobeIcon />
            </span>
            <span className="text-[16px] font-semibold text-ink">
              Software &amp; seats
            </span>
            <Chevron />
            <AvatarCluster faces={CONTRACTOR_AVATARS} count="+46" />
          </div>

          {/* Payroll complete */}
          <div className="relative rounded-[18px] bg-white px-5 py-4 min-[640px]:absolute min-[640px]:right-[13%] min-[640px]:top-[52%]">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">
                This month, all agents
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1e9e56]">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="m5 12.5 4.5 4.5L19 7.5"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
            <p className="font-numeral mt-2 border-t border-black/10 pt-2 text-[38px] font-bold tracking-[-1px] text-ink">
              $22,500
            </p>
          </div>

          {/* flags */}
          <div className="relative flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[20px] leading-none min-[640px]:absolute min-[640px]:right-[22%] min-[640px]:top-[76%]">
            <span>🇺🇸</span>
            <span>🇧🇷</span>
            <span>🇸🇪</span>
            <span>🇮🇹</span>
            <span>🇦🇷</span>
            <span>🇲🇽</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AvatarCluster({
  faces,
  count,
}: {
  faces: { initials: string; color: string }[];
  count: string;
}) {
  return (
    <span className="flex items-center">
      {faces.map((f, i) => (
        <span
          key={f.initials}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-ink/80"
          style={{ marginLeft: i === 0 ? 0 : -8, backgroundColor: f.color }}
        >
          {f.initials}
        </span>
      ))}
      <span className="ml-[-8px] flex h-[26px] min-w-[26px] items-center justify-center rounded-full border-2 border-white bg-[#f5e7a0] px-1 text-[10px] font-semibold text-ink">
        {count}
      </span>
    </span>
  );
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 5.5 8 10.5l5-5"
        stroke="#706e68"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0a0a0a"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c1.2-2.8 3.3-4.2 5.5-4.2s4.3 1.4 5.5 4.2" />
      <circle cx="16.8" cy="9" r="2.4" />
      <path d="M16.2 14.6c1.9.2 3.5 1.5 4.3 3.6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0a0a0a"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}
