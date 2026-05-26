import React, { useState } from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { Target, Tag, Flag, Calendar as CalendarIcon, Clock, CreditCard, Share2, Activity, Plus, X, Check, Trash2, Search } from "lucide-react";
import { CampaignPriority, CampaignStatus } from "@/features/campaigns";
import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";
import { useTenant } from "@/components/providers/TenantProvider";
import { useSocialChannels } from "@/features/social-channels";

/* ── Section label ───────────────────────────────────────────────────────── */
function SL({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
        {children}
      </span>
    </div>
  );
}

/* ── Campaign Tags Input ─────────────────────────────────────────────────── */
function CampaignTagsInput({ tags, setTags, max = 3 }: { tags: string[], setTags: (t: string[]) => void, max?: number }) {
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function confirmCreate() {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < max) {
      setTags([...tags, trimmed]);
    }
    setNewTag("");
    setCreating(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); confirmCreate(); }
    if (e.key === "Escape") { setCreating(false); setNewTag(""); }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(t => (
        <div key={t} className="relative group flex items-center">
          <div className="flex items-center gap-1 font-label-caps text-[9px] font-bold px-2.5 py-1 rounded-full transition-all max-w-full border bg-zinc-900 text-white border-transparent shadow-sm cursor-default">
            <Check size={8} strokeWidth={3} className="shrink-0" />
            <span className="truncate max-w-[100px] tracking-wide">{t}</span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeTag(t); }}
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all z-10 shadow-sm opacity-100 hover:scale-110 bg-zinc-700 text-zinc-300 hover:bg-red-500 hover:text-white"
          >
            <X size={7} strokeWidth={3} />
          </button>
        </div>
      ))}

      {creating ? (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ border: "1.5px solid var(--color-primary)", background: "rgba(0,0,0,0.02)" }}
        >
          <input
            ref={inputRef}
            maxLength={10}
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={confirmCreate}
            placeholder="Tag name…"
            className="bg-transparent outline-none font-label-caps text-[9px] font-semibold"
            style={{ color: "var(--color-on-surface)", width: 80 }}
          />
          <button onClick={confirmCreate}>
            <Check size={9} strokeWidth={3} style={{ color: "var(--color-primary)" }} />
          </button>
        </div>
      ) : tags.length < max && (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 font-label-caps text-[9px] font-semibold px-2.5 py-1 rounded-full transition-all hover:bg-black/[0.06]"
          style={{ border: "1.5px dashed rgba(0,0,0,0.2)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}
        >
          <Plus size={9} strokeWidth={2.5} />
          New Tag
        </button>
      )}
    </div>
  );
}

/* ── Campaign Channel Picker ─────────────────────────────────────────────── */
function CampaignChannelPicker({
  selected,
  onChange
}: {
  selected: { id: string; name: string; platform: string; username: string }[],
  onChange: (accounts: { id: string; name: string; platform: string; username: string }[]) => void
}) {
  const { channels, addChannel } = useSocialChannels();
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

export default function AddCampaignModal({ onClose }: { onClose: () => void }) {
  const { addCampaign } = useCampaigns();
  const { user } = useTenant();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<CampaignPriority>("Medium");
  const [status, setStatus] = useState<CampaignStatus>("Planning");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [campaignAccounts, setCampaignAccounts] = useState<{ id: string; name: string; platform: string; username: string }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = name.trim() !== "" && description.trim() !== "" && startDate !== "" && endDate !== "";

  const handleSubmit = () => {
    setError(null);
    if (!name.trim()) { setError("Campaign name is required."); return; }
    if (!description.trim()) { setError("Objective/Description is required."); return; }
    if (!startDate) { setError("Start Date is required."); return; }
    if (!endDate) { setError("End Date is required."); return; }
    if (new Date(endDate) < new Date(startDate)) { setError("End Date cannot be before Start Date."); return; }
    const budgetNum = parseFloat(budget);
    if (budget && isNaN(budgetNum)) { setError("Budget must be a valid number."); return; }
    if (budgetNum < 0) { setError("Budget cannot be negative."); return; }

    addCampaign({
      name,
      description,
      startDate,
      endDate,
      priority,
      status,
      owner: user?.name || "System",
      linkedTasks: [],
      campaignAccounts,
      budget: budgetNum || 0,
      currency,
      tags: tags,
    });
    onClose();
  };

  return (
    <ModalShell onClose={onClose} maxWidth={560}>
      <ModalHeader title="Launch Campaign" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <GlobalInput
            autoFocus
            required
            maxLength={60}
            placeholder="Campaign name (e.g. Summer Sale 2026)…"
            value={name}
            onChange={e => { setName(e.target.value); setError(null); }}
            onKeyDown={e => e.key === "Enter" && isFormValid && handleSubmit()}
            className="font-display font-semibold"
            style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
          />

          <GlobalTextarea
            rows={3}
            maxLength={300}
            placeholder="Campaign goal, strategy, execution notes (e.g. Increase social engagement and promote new seasonal products)…"
            value={description}
            onChange={e => { setDescription(e.target.value); setError(null); }}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <SL icon={<CalendarIcon size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Start Date *</SL>
              <DatePicker
                value={startDate || null}
                onChange={val => { setStartDate(val || ""); setError(null); }}
                placeholder="Select start date"
              />
            </div>
            <div>
              <SL icon={<Clock size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>End Date *</SL>
              <DatePicker
                value={endDate || null}
                onChange={val => { setEndDate(val || ""); setError(null); }}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <SL icon={<Activity size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Status</SL>
            <Dropdown
              value={status}
              onChange={(val) => setStatus(val as CampaignStatus)}
              options={[
                { value: "Planning", label: "Planning" },
                { value: "Active", label: "Active" },
                { value: "Paused", label: "Paused" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </div>
          <div>
            <SL icon={<Flag size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Priority</SL>
            <Dropdown
              value={priority}
              onChange={(val) => setPriority(val as CampaignPriority)}
              options={[
                { value: "Low", label: "Low Priority" },
                { value: "Medium", label: "Medium Priority" },
                { value: "High", label: "High Priority" },
                { value: "Critical", label: "Critical Priority" },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <SL icon={<CreditCard size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Currency</SL>
              <Dropdown
                value={currency}
                onChange={val => setCurrency(val as string)}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                  { value: "IDR", label: "IDR" },
                  { value: "GBP", label: "GBP" },
                ]}
              />
            </div>
            <div>
              <SL>Budget (Optional)</SL>
              <GlobalInput
                type="number"
                placeholder="0.00"
                value={budget}
                onChange={e => { setBudget(e.target.value); setError(null); }}
              />
            </div>
          </div>
          <div>
            <SL icon={<Tag size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Tags</SL>
            <div className="pt-1.5">
              <CampaignTagsInput tags={tags} setTags={setTags} max={8} />
            </div>
          </div>
        </div>

        <div>
          <SL icon={<Share2 size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>Campaign Accounts</SL>
          <div className="mt-2">
            <CampaignChannelPicker selected={campaignAccounts} onChange={setCampaignAccounts} />
          </div>
        </div>
      </ModalContent>

      <ModalFooter summary={error}>
        <button onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!isFormValid} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Launch Campaign
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
