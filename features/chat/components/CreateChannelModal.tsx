"use client";

import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useRouter } from "next/navigation";
import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import { GlobalTextarea } from "@/components/ui/global/form/GlobalTextarea";

export default function CreateChannelModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createChannel } = useChat();
  const router = useRouter();

  const isFormValid = name.trim() !== "";

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const newId = await createChannel(name, description);
      onClose();
      router.push(`/dashboard/chat/${newId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose} maxWidth={500}>
      <ModalHeader title="New Channel" onClose={onClose} />
      
      <ModalContent className="db-sidebar space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Channel Name
              </span>
            </div>
            <GlobalInput
              autoFocus
              required
              maxLength={30}
              placeholder="e.g. engineering"
              value={name}
              onChange={e => {
                 setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                 setError(null);
              }}
              onKeyDown={e => e.key === "Enter" && isFormValid && handleSubmit()}
              className="font-display font-semibold"
              style={{ fontSize: "16px", background: "transparent", border: "none", padding: "0" }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}>
                Description (Optional)
              </span>
            </div>
            <GlobalTextarea
              rows={3}
              maxLength={50}
              placeholder="What is this channel about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>
      </ModalContent>

      <ModalFooter summary={error}>
        <button onClick={onClose} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors" style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!isFormValid || loading} className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-4 py-2 rounded-[6px] disabled:opacity-30 hover:-translate-y-px transition-all" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          {loading ? "Creating..." : "Create Channel"}
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
