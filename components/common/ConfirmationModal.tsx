"use client";

import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false
}: ConfirmationModalProps) {
  const isDanger = variant === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-start pt-2">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isDanger ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary"
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-body-md text-[13.5px] leading-relaxed text-on-surface opacity-70">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-black/[0.04]">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="h-9 px-4 text-[11px] font-bold tracking-widest opacity-40 hover:opacity-100"
          >
            {cancelLabel}
          </Button>
          <Button 
            variant={isDanger ? "danger" : "primary"} 
            onClick={onConfirm}
            isLoading={isLoading}
            className="h-9 px-6 text-[11px] font-bold tracking-widest"
          >
            {confirmLabel.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
