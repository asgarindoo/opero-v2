import { TrendingUp, ShoppingCart } from "lucide-react";

const PIPELINE_STAGES = [
  { label: "Leads",     count: 34, value: "$84,200",  pct: 100, color: "rgba(0,0,0,0.12)" },
  { label: "Qualified", count: 19, value: "$61,500",  pct: 73,  color: "rgba(0,0,0,0.25)" },
  { label: "Proposal",  count: 11, value: "$43,800",  pct: 52,  color: "rgba(0,0,0,0.45)" },
  { label: "Closing",   count: 5,  value: "$29,100",  pct: 35,  color: "rgba(0,0,0,0.68)" },
  { label: "Won",       count: 3,  value: "$18,600",  pct: 22,  color: "var(--color-primary)" },
];

const RECENT_DEALS = [
  { name: "Acme Corp",      stage: "Closing",   value: "$12,400", ago: "2h ago" },
  { name: "BrightPath Ltd", stage: "Proposal",  value: "$8,750",  ago: "5h ago" },
  { name: "Nova Systems",   stage: "Qualified",  value: "$5,200",  ago: "1d ago" },
  { name: "Summit Co.",     stage: "Won",        value: "$18,600", ago: "2d ago" },
];

const STAGE_COLOR: Record<string, { bg: string; text: string }> = {
  Leads:     { bg: "rgba(0,0,0,0.05)",  text: "var(--color-on-surface-variant)" },
  Qualified: { bg: "rgba(0,0,0,0.06)",  text: "var(--color-on-surface-variant)" },
  Proposal:  { bg: "rgba(0,0,0,0.07)",  text: "var(--color-on-surface-variant)" },
  Closing:   { bg: "rgba(0,0,0,0.08)",  text: "var(--color-on-surface)" },
  Won:       { bg: "var(--color-primary)", text: "var(--color-on-primary)" },
};

export default function SalesOverviewWidget() {
  return (
    <div
      className="db-widget rounded-[10px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }} />
          <span className="font-h3 text-[13px] font-semibold text-on-surface">Sales Overview</span>
          <span
            className="font-label-caps text-[8px] font-bold px-1.5 py-[3px] rounded-full"
            style={{ background: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)" }}
          >
            5 deals closing
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }} />
          <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>
            +14% MoM
          </span>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="px-4 pt-3 pb-2">
        <div className="font-label-caps text-[9px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
          Pipeline
        </div>
        <div className="space-y-1.5">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.label} className="flex items-center gap-2.5">
              <div className="w-[68px] shrink-0">
                <span className="font-body-sm text-[11px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                  {stage.label}
                </span>
              </div>
              {/* Bar */}
              <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stage.pct}%`, background: stage.color }}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 w-[90px] justify-end">
                <span className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>
                  {stage.count}
                </span>
                <span className="font-body-sm text-[11px] font-semibold text-on-surface">
                  {stage.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "4px 0" }} />

      {/* Recent deals */}
      <div className="px-4 pb-3 pt-2">
        <div className="font-label-caps text-[9px] uppercase tracking-[0.1em] font-semibold mb-2" style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }}>
          Recent Deals
        </div>
        <div className="space-y-1">
          {RECENT_DEALS.map((deal) => {
            const sc = STAGE_COLOR[deal.stage] ?? STAGE_COLOR.Leads;
            return (
              <div
                key={deal.name}
                className="flex items-center gap-3 px-2.5 py-2 rounded-[6px] hover:bg-black/[0.02] transition-colors cursor-pointer"
                style={{ border: "1px solid rgba(0,0,0,0.04)" }}
              >
                {/* Avatar */}
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-display font-bold text-[8px] shrink-0"
                  style={{ background: "rgba(0,0,0,0.08)", color: "var(--color-on-surface-variant)" }}
                >
                  {deal.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-body-md text-[12px] font-semibold text-on-surface truncate block">
                    {deal.name}
                  </span>
                </div>
                <span
                  className="font-label-caps text-[8px] font-bold px-[6px] py-[3px] rounded shrink-0"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {deal.stage}
                </span>
                <div className="text-right shrink-0">
                  <div className="font-body-md text-[12px] font-semibold text-on-surface">{deal.value}</div>
                  <div className="font-body-sm text-[9px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}>{deal.ago}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-3">
        <button
          className="w-full font-label-caps text-[10px] uppercase tracking-[0.06em] font-semibold py-2 rounded-[6px] transition-colors hover:bg-black/[0.03]"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
        >
          View All Deals →
        </button>
      </div>
    </div>
  );
}
