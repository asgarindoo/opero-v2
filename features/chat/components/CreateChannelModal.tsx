"use client";

import React, { useState } from "react";
import { Hash, X } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useRouter } from "next/navigation";

export default function CreateChannelModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createChannel } = useChat();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newId = createChannel(name, description);
    onClose();
    router.push(`/dashboard/chat/${newId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border border-black/10 animate-fade-in-up">
        <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between">
          <h2 className="font-display font-bold text-[16px] text-primary">Create Channel</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-md text-on-surface-variant transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block font-label-caps text-[10px] text-on-surface-variant mb-1.5">Channel Name</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. engineering"
                className="w-full pl-9 pr-3 py-2 bg-surface-container border border-black/10 rounded-lg text-[13px] focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block font-label-caps text-[10px] text-on-surface-variant mb-1.5">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3 py-2 bg-surface-container border border-black/10 rounded-lg text-[13px] focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-display font-semibold text-[13px] text-on-surface hover:bg-black/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-primary text-white font-display font-semibold text-[13px] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
