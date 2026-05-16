"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Hash, User as UserIcon, X } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function ChatSearchModal({ onClose }: { onClose: () => void }) {
  const { channels, users } = useChat();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Mock search results with explicit type to fix TS error
  const results: Array<{ type: string, icon: any, title: string, subtitle: string }> = [];
  
  if (query.trim()) {
    const q = query.toLowerCase();
    channels.forEach(c => {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ type: "channel", icon: Hash, title: c.name, subtitle: "Channel" });
      }
    });
    Object.values(users).forEach(u => {
      if (u.name.toLowerCase().includes(q)) {
        results.push({ type: "user", icon: UserIcon, title: u.name, subtitle: "Team Member" });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-outline-variant/30 overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-outline-variant/30">
          <Search size={18} className="text-on-surface-variant opacity-50 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages, channels, or people..."
            className="flex-1 bg-transparent border-none outline-none font-body-md text-[15px] text-on-surface placeholder:text-on-surface-variant/40"
          />
          <button onClick={onClose} className="p-1 rounded-md text-on-surface-variant/50 hover:bg-surface-container-low hover:text-on-surface transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-2 max-h-[400px] overflow-y-auto">
          {!query.trim() ? (
            <div className="py-8 text-center">
              <p className="font-body-sm text-on-surface-variant/60">Type to start searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((r, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-surface-container text-on-surface-variant/70 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <r.icon size={14} />
                    </div>
                    <div>
                      <div className="font-body-md font-medium text-on-surface group-hover:text-primary transition-colors">{r.title}</div>
                      <div className="font-label-caps text-[9px] text-on-surface-variant/50 mt-0.5">{r.subtitle}</div>
                    </div>
                  </div>
                  <span className="font-label-caps text-[9px] text-on-surface-variant/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    Jump to
                  </span>
                </button>
              ))}
            </div>
          ) : (
             <div className="py-8 text-center">
              <p className="font-body-sm text-on-surface-variant/60">No results found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
