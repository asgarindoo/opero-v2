"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  summary?: React.ReactNode;
}

export function ModalFooter({ children, summary }: Props) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t shrink-0" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {summary}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
      </div>
    </div>
  );
}
