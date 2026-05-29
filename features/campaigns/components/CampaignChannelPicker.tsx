import React, { useState } from "react";
import { useSocialChannels } from "@/features/social-channels";
import { Check, Search, X } from "lucide-react";

export function CampaignChannelPicker({
  selected,
  onChange
}: {
  selected: { id: string; name: string; platform: string; username: string }[],
  onChange: (accounts: { id: string; name: string; platform: string; username: string }[]) => void
}) {
  const { channels } = useSocialChannels();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = React.useMemo(() =>
    channels.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.platform.toLowerCase().includes(query.toLowerCase()) ||
      c.username.toLowerCase().includes(query.toLowerCase())
    ), [channels, query]);

  function toggle(channel: { id: string; name: string; platform: string; username: string }) {
    const isSelected = selected.some(s => s.id === channel.id);
    if (isSelected) {
      onChange(selected.filter(s => s.id !== channel.id));
    } else {
      onChange([...selected, channel]);
    }
  }

  function remove(id: string) {
    onChange(selected.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-2 relative">
      {/* Selected avatars */}
      {selected.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {selected.map((m) => (
            <div key={m.id} className="group/av relative flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="w-4 h-4 rounded-full flex items-center justify-center font-display font-bold text-[7px]" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                {m.platform.slice(0, 1).toUpperCase()}
              </div>
              <span className="font-body-sm text-[11px] font-medium" style={{ color: "var(--color-on-surface)" }}>{m.name}</span>
              <button type="button" onClick={() => remove(m.id)} className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity">
                <X size={9} strokeWidth={2.5} style={{ color: "var(--color-on-surface)" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04] transition-colors font-label-caps text-[9px] font-semibold uppercase tracking-[0.08em]"
        style={{ border: "1px dashed rgba(0,0,0,0.18)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}
      >
        {selected.length === 0 ? "+ Add Account" : "+ Add More"}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 w-full min-w-[280px] z-50 mt-1 rounded-[10px] overflow-hidden shadow-xl border" style={{ background: "#fff", borderColor: "rgba(0,0,0,0.1)" }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <Search size={12} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.45, flexShrink: 0 }} />
            <input
              autoFocus
              placeholder="Search campaign accounts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none font-body-md text-[12px]"
              style={{ color: "var(--color-on-surface)" }}
            />
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.map((m) => {
              const isSelected = selected.some((s) => s.id === m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-black/[0.03] transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[9px] shrink-0" style={{ background: isSelected ? "var(--color-primary)" : "rgba(0,0,0,0.08)", color: isSelected ? "var(--color-on-primary)" : "var(--color-on-surface)" }}>
                    {m.platform.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-body-md text-[12px] font-medium" style={{ color: "var(--color-on-surface)" }}>{m.name}</div>
                    <div className="font-body-sm text-[10px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}>{m.platform} • {m.username}</div>
                  </div>
                  {isSelected && <Check size={12} strokeWidth={2.5} style={{ color: "var(--color-primary)", flexShrink: 0 }} />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-6 flex flex-col items-center justify-center text-center">
                <p className="font-display text-[12px] font-medium text-on-surface mb-1">No campaign accounts found</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 max-w-[200px]">
                  Add accounts from the Social Channels module first.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t flex justify-end" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <button type="button" onClick={() => setOpen(false)} className="font-label-caps text-[9px] font-semibold px-2.5 py-1 rounded-[5px] hover:bg-black/[0.05] transition-colors uppercase tracking-[0.06em]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
