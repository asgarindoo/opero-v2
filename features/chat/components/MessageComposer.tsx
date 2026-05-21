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
    <div className="p-4 bg-surface/80 backdrop-blur-md relative">
      <div className="bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="w-full bg-transparent px-5 py-4 outline-none resize-none font-body-md text-[14.5px] text-on-surface placeholder:text-on-surface-variant/50 min-h-[56px] max-h-[160px]"
          rows={1}
        />
        <div className="flex items-center justify-end px-3 pb-3">
          <button
            onClick={() => void handleSend()}
            disabled={!content.trim() || isSending}
            className={`p-2 rounded-full transition-all duration-200 ${
              content.trim() && !isSending
                ? "bg-primary text-white hover:scale-105 shadow-md hover:shadow-lg"
                : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <Send size={16} className={content.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
          </button>
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-on-surface-variant opacity-50 font-medium">
        <strong>Return</strong> to send, <strong>Shift + Return</strong> for new line
      </div>
    </div>
  );
}
