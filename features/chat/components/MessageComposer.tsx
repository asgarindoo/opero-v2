"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function MessageComposer({ channelId }: { channelId: string }) {
  const { sendMessage } = useChat();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;
    const nextContent = content.trim();
    setIsSending(true);
    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      await sendMessage(channelId, nextContent);
    } catch {
      setContent(nextContent);
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  return (
    <div className="p-4 bg-white border-t border-black/5 relative">
      <div className="bg-white border border-black/[0.06] rounded-xl transition-all focus-within:border-black/25 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden shadow-sm">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full bg-transparent px-4 py-3 outline-none resize-none font-aspekta text-[12.5px] text-black placeholder:text-black/35 min-h-[44px] max-h-[140px] leading-relaxed"
          rows={1}
        />
        <div className="flex items-center justify-end px-3 pb-2">
          <button
            onClick={() => void handleSend()}
            disabled={!content.trim() || isSending}
            className={`p-1.5 rounded-lg transition-all ${content.trim() && !isSending
                ? "bg-[#18181b] text-white hover:bg-black/90 active:scale-[0.98]"
                : "bg-transparent text-black/20 cursor-not-allowed"
              }`}
            title="Send message"
          >
            <Send size={13} className={content.trim() ? "translate-x-[0.5px]" : ""} />
          </button>
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-black/35 font-aspekta select-none">
        Press <kbd className="font-semibold bg-black/5 px-1 py-0.5 rounded text-[9px]">Return</kbd> to send, <kbd className="font-semibold bg-black/5 px-1 py-0.5 rounded text-[9px]">Shift + Return</kbd> for a new line
      </div>
    </div>
  );
}
