"use client";

import React, { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
}

export function ModalShell({ children, onClose, maxWidth = 600 }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <div
          className="flex flex-col w-full overflow-hidden"
          style={{
            maxWidth, maxHeight: "94vh",
            background: "#fff", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.09)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
            animation: "modalPop 0.18s cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </>
  );
}
