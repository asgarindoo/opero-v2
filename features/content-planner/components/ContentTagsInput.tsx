"use client";

import React, { useState } from "react";
import { Check, X, Plus } from "lucide-react";

export function ContentTagsInput({ tags, setTags, max = 3 }: { tags: string[], setTags: (t: string[]) => void, max?: number }) {
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
