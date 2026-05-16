"use client";

import { useChat } from "./context/ChatContext";
import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatEmptyState() {
  const { channels } = useChat();
  const router = useRouter();

  // Redirect to first channel if exists
  useEffect(() => {
    if (channels.length > 0) {
      router.replace(`/dashboard/chat/${channels[0].id}`);
    }
  }, [channels, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface">
      <div className="w-14 h-14 rounded-full bg-surface-container-low border border-outline-variant/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center mb-5">
        <MessageSquarePlus size={22} className="text-on-surface-variant opacity-50" />
      </div>
      <h2 className="font-display font-semibold text-[18px] text-primary mb-1.5">Welcome to Team Chat</h2>
      <p className="font-body-sm text-[13px] text-on-surface-variant max-w-sm mb-6 leading-relaxed opacity-70">
        Select an active channel from the sidebar or start a new one to begin collaborating seamlessly.
      </p>
    </div>
  );
}
