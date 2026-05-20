"use client";

import { useState } from "react";
import { Link, ExternalLink as ExternalLinkIcon, Trash2, Plus } from "lucide-react";
import type { ExternalLink } from "@/features/tasks";

interface Props {
  links: ExternalLink[];
  onChange: (links: ExternalLink[]) => void;
}

function getFavicon(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=16`;
  } catch { return null; }
}

export default function ExternalLinksPanel({ links, onChange }: Props) {
  const [adding,    setAdding]   = useState(false);
  const [newUrl,    setNewUrl]   = useState("");
  const [newTitle,  setNewTitle] = useState("");

  function addLink() {
    const url = newUrl.trim();
    if (!url) return;
    onChange([...links, { id: `lk${Date.now()}`, url, title: newTitle.trim() || url }]);
    setNewUrl(""); setNewTitle(""); setAdding(false);
  }

  return (
    <div className="space-y-2">
      {links.map(l => (
        <div key={l.id} className="group flex items-center gap-2.5 px-2.5 py-2 rounded-[7px]" style={{ border: "1px solid rgba(0,0,0,0.07)", background: "rgba(0,0,0,0.015)" }}>
          <div className="w-5 h-5 rounded-[4px] flex items-center justify-center overflow-hidden shrink-0" style={{ background: "rgba(0,0,0,0.04)" }}>
            {getFavicon(l.url) && (
              <img src={getFavicon(l.url)!} alt="" width={14} height={14} onError={e => (e.currentTarget.style.display = "none")} />
            )}
            <Link size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.4 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-md text-[12px] font-medium truncate" style={{ color: "var(--color-on-surface)" }}>{l.title}</p>
            <p className="font-body-sm text-[10px] truncate" style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}>{l.url}</p>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-[4px] hover:bg-black/[0.06]">
              <ExternalLinkIcon size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 } as React.CSSProperties} />
            </a>
            <button onClick={() => onChange(links.filter(x => x.id !== l.id))} className="p-1 rounded-[4px] hover:bg-red-50">
              <Trash2 size={11} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="rounded-[8px] p-3 space-y-2" style={{ border: "1px solid rgba(0,0,0,0.09)", background: "rgba(0,0,0,0.015)" }}>
          <input autoFocus placeholder="https://…" value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && addLink()}
            className="w-full bg-transparent outline-none font-body-md text-[12px] border-b pb-1" style={{ borderColor: "rgba(0,0,0,0.1)", color: "var(--color-on-surface)" }} />
          <input placeholder="Link title (optional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && addLink()}
            className="w-full bg-transparent outline-none font-body-sm text-[11.5px]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.8 }} />
          <div className="flex items-center gap-2 pt-1">
            <button onClick={addLink} className="font-label-caps text-[9px] font-semibold px-2.5 py-1 rounded-[5px]" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>Add Link</button>
            <button onClick={() => { setAdding(false); setNewUrl(""); setNewTitle(""); }} className="font-label-caps text-[9px] font-semibold px-2 py-1 rounded-[5px] hover:bg-black/[0.05]" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] hover:bg-black/[0.04] font-label-caps text-[9px] font-semibold uppercase tracking-[0.08em]"
          style={{ border: "1px dashed rgba(0,0,0,0.18)", color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
          <Plus size={9} strokeWidth={2.5} /> Add Link
        </button>
      )}
    </div>
  );
}
