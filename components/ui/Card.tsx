"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = ""
}: CardProps) {
  return (
    <div className={`
      bg-white border border-black/[0.04] rounded-[10px] 
      shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden
      ${className}
    `}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-black/[0.04] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h4 className="font-display text-[13.5px] font-semibold text-on-surface">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex items-center">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 px-6 py-5">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-black/[0.04] bg-black/[0.01]">
          {footer}
        </div>
      )}
    </div>
  );
}
