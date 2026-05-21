"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export function ModalContent({ children, className = "", padding = "px-5 py-4" }: Props) {
  return (
    <div className={`flex-1 overflow-y-auto ${padding} ${className}`}>
      {children}
    </div>
  );
}
