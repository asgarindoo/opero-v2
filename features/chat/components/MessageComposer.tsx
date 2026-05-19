"use client";

import React, { useState, useRef, useEffect } from "react";
import { SmilePlus, Paperclip, Send } from "lucide-react";
import { useChat } from "../context/ChatContext";

export default function MessageComposer({ channelId }: { channelId: string }) {
  const { sendMessage } = useChat();
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    sendMessage(channelId, content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  return (
    <div className="p-4 bg-surface/80 backdrop-blur-md relative">
      {/* Mock Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-6 mb-2 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)] rounded-full p-1.5 flex gap-1 animate-fade-in-up z-20">
          {['😀', '👍', '❤️', '🔥', '🚀', '👀'].map(emoji => (
            <button
              key={emoji}
              onClick={() => { setContent(prev => prev + emoji); setShowEmojiPicker(false); }}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full text-[16px] transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={() => alert("File attachment simulated.")} />

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
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-surface-container-high rounded-full transition-colors" 
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-surface-container-high rounded-full transition-colors" 
              title="Add emoji"
            >
              <SmilePlus size={18} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!content.trim()}
            className={`p-2 rounded-full transition-all duration-200 ${
              content.trim() 
                ? "bg-primary text-white hover:scale-105 shadow-md hover:shadow-lg" 
                : "bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed"
            }`}
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
