"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { useChat } from "../context/ChatContext";

const MAX_CHARS = 4000;
const WARN_THRESHOLD = 3600; // 90% — start showing counter

export default function MessageComposer({ channelId }: { channelId: string }) {
  const { sendMessage } = useChat();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount >= WARN_THRESHOLD && !isOverLimit;
  const showCounter = charCount >= WARN_THRESHOLD;
  const remaining = MAX_CHARS - charCount;

  const handleSend = async () => {
    if (!content.trim() || isSending || isOverLimit) return;
    const nextContent = content.trim();
    setIsSending(true);
    setErrorMsg(null);
    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      await sendMessage(channelId, nextContent);
    } catch (err) {
      setContent(nextContent);
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Auto-dismiss send error after 4s
  useEffect(() => {
    if (!errorMsg) return;
    const t = window.setTimeout(() => setErrorMsg(null), 4000);
    return () => window.clearTimeout(t);
  }, [errorMsg]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [content]);

  return (
    <div className="px-4 pb-4 pt-2 bg-white shrink-0">
      <div className="bg-white border border-black/[0.06] rounded-xl transition-all overflow-hidden shadow-sm focus-within:border-black/25 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrorMsg(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full bg-transparent px-4 py-3 outline-none resize-none font-aspekta text-[12.5px] text-black placeholder:text-black/35 min-h-[44px] max-h-[140px] leading-relaxed"
          rows={1}
        />

        {/* Footer bar inside composer */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0.5 gap-2">
          {/* Left: error or char limit info */}
          <div className="flex-1 min-w-0">
            {errorMsg ? (
              <div className="flex items-center gap-1.5 animate-fade-in-up">
                <AlertTriangle size={11} className="text-red-500 shrink-0" />
                <span className="font-aspekta text-[11px] text-red-600 truncate">{errorMsg}</span>
              </div>
            ) : isOverLimit ? (
              <div className="flex items-center gap-2 animate-fade-in-up">
                <AlertTriangle size={11} className="text-red-500 shrink-0" />
                <span className="font-aspekta text-[11px] text-red-600 tabular-nums">
                  Too long — remove <strong>{Math.abs(remaining)}</strong> chars
                </span>
                <div className="h-1 w-12 rounded-full bg-red-100 overflow-hidden ml-1 shrink-0">
                  <div className="h-full w-full rounded-full bg-red-500" />
                </div>
              </div>
            ) : showCounter ? (
              <div className="flex items-center gap-2 animate-fade-in-up">
                <div className="h-1 w-12 rounded-full bg-black/8 overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-150"
                    style={{ width: `${(charCount / MAX_CHARS) * 100}%` }}
                  />
                </div>
                <span className={`font-aspekta text-[10.5px] tabular-nums font-medium ${
                  isNearLimit ? "text-amber-600" : "text-black/40"
                }`}>
                  {remaining} left
                </span>
              </div>
            ) : (
              <span className="font-aspekta text-[10px] text-black/30 select-none">
                ↵ send · ⇧↵ newline
              </span>
            )}
          </div>

          {/* Right: send button */}
          <button
            onClick={() => void handleSend()}
            disabled={!content.trim() || isSending || isOverLimit}
            className={`p-1.5 rounded-lg transition-all shrink-0 ${
              content.trim() && !isSending && !isOverLimit
                ? "bg-[#18181b] text-white hover:bg-black/90 active:scale-[0.98]"
                : "bg-transparent text-black/20 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <Send size={13} className={content.trim() && !isOverLimit ? "translate-x-[0.5px]" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
