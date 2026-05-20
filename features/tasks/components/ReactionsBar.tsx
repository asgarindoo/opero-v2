"use client";

import { useState } from "react";
import type { Reaction } from "@/features/tasks";

const QUICK_EMOJIS = ["👍", "✅", "🔥", "👀", "❤️", "🎉"];

interface Props {
  reactions: Record<string, Reaction>;
  onToggle: (emoji: string) => void;
}

export default function ReactionsBar({ reactions, onToggle }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const existing = Object.values(reactions);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {existing.map(r => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          title={r.reactors.join(", ")}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] transition-all hover:scale-110"
          style={{
            background: r.reactedByMe ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
            border: r.reactedByMe ? "1px solid rgba(0,0,0,0.18)" : "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <span>{r.emoji}</span>
          <span className="font-label-caps text-[9px] font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>{r.count}</span>
        </button>
      ))}

      {/* Add reaction */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(v => !v)}
          className="flex items-center justify-center w-6 h-6 rounded-full text-[12px] hover:bg-black/[0.06] transition-colors"
          style={{ border: "1px dashed rgba(0,0,0,0.2)" }}
          title="Add reaction"
        >
          😊
        </button>
        {showPicker && (
          <div
            className="absolute bottom-full left-0 mb-1 z-50 flex items-center gap-1 px-2 py-1.5 rounded-[8px] shadow-xl"
            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.1)" }}
          >
            {QUICK_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => { onToggle(e); setShowPicker(false); }}
                className="text-[16px] hover:scale-125 transition-transform p-0.5 rounded"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Helper to toggle a reaction in a record */
export function toggleReaction(
  reactions: Record<string, Reaction>,
  emoji: string,
  myName = "You"
): Record<string, Reaction> {
  const existing = reactions[emoji];
  if (!existing) {
    return { ...reactions, [emoji]: { emoji, count: 1, reactedByMe: true, reactors: [myName] } };
  }
  if (existing.reactedByMe) {
    const count = existing.count - 1;
    if (count <= 0) {
      const next = { ...reactions };
      delete next[emoji];
      return next;
    }
    return { ...reactions, [emoji]: { ...existing, count, reactedByMe: false, reactors: existing.reactors.filter(r => r !== myName) } };
  }
  return { ...reactions, [emoji]: { ...existing, count: existing.count + 1, reactedByMe: true, reactors: [...existing.reactors, myName] } };
}
