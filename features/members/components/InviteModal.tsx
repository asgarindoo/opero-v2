"use client";

import React, { useState } from "react";
import { Link, Copy, Trash2, Clock, Check, Users, Hash, ShieldCheck } from "lucide-react";
import { useMembers } from "../context/MembersContext";

import { ModalShell } from "@/components/ui/global/modal/ModalShell";
import { ModalHeader } from "@/components/ui/global/modal/ModalHeader";
import { ModalContent } from "@/components/ui/global/modal/ModalContent";
import { ModalFooter } from "@/components/ui/global/modal/ModalFooter";
import Dropdown from "@/components/ui/Dropdown";
import ConfirmationModal from "@/components/common/ConfirmationModal";

function SL({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span
        className="font-label-caps text-[9px] uppercase tracking-[0.12em] font-semibold"
        style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }}
      >
        {children}
      </span>
    </div>
  );
}

function InfoBox({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 items-start p-3 rounded-[8px]"
      style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)", opacity: 0.65 }}>
        {icon}
      </span>
      <p
        className="font-body-md text-[12px] leading-relaxed"
        style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}
      >
        {children}
      </p>
    </div>
  );
}

const EXPIRE_OPTIONS = [
  { value: "1", label: "24 Hours" },
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "never", label: "Never Expires" },
];

export default function InviteModal({ onClose }: { onClose: () => void }) {
  const { inviteLinks, generateInviteLink, revokeInviteLink, tenantCode } = useMembers();

  const [expireDays, setExpireDays] = useState("7");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkToRevoke, setLinkToRevoke] = useState<string | null>(null);

  /* ── copy helper ── */
  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* fallback below */ }
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.focus(); el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch { return false; }
  };

  const handleCopy = async (text: string, id: string) => {
    const ok = await copyText(text);
    if (!ok) return false;
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    return true;
  };

  const handleGenerate = async () => {
    const days = expireDays === "never" ? null : Number(expireDays);
    setIsGenerating(true);
    setError(null);
    try {
      const link = await generateInviteLink(days);
      const ok = await handleCopy(link.url, link.id);
      if (!ok) setError("Invite link created. Copy it from the list below.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invite link");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── footer summary ── */
  const footerSummary = (
    <>
      <span
        className="font-label-caps text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        {EXPIRE_OPTIONS.find(o => o.value === expireDays)?.label}
      </span>
      {inviteLinks.length > 0 && (
        <span
          className="font-label-caps text-[9px] font-semibold"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.45 }}
        >
          {inviteLinks.length} active link{inviteLinks.length !== 1 ? "s" : ""}
        </span>
      )}
    </>
  );

  return (
    <ModalShell onClose={onClose} maxWidth={500}>
      <ModalHeader title="Workspace Access" onClose={onClose} />

      <ModalContent className="db-sidebar space-y-6">

        <div className="space-y-3">
          <SL icon={<Hash size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
            Permanent Workspace Code
          </SL>
          <p
            className="font-body-md text-[12px] leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
          >
            Share this unique code for persistent, direct access to the workspace.
          </p>

          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-[8px]"
            style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.015)" }}
          >
            <span
              className="flex-1 font-display font-bold text-[18px] tracking-[0.22em]"
              style={{ color: "var(--color-on-surface)" }}
            >
              {tenantCode || (
                <span className="inline-block h-5 w-24 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.06)" }} />
              )}
            </span>
            <button
              onClick={() => tenantCode && handleCopy(tenantCode, "tenant-code")}
              disabled={!tenantCode}
              className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-[6px] hover:-translate-y-px transition-all disabled:opacity-40"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              {copiedId === "tenant-code" ? <><Check size={10} strokeWidth={2} /> Copied</> : <><Copy size={10} strokeWidth={2} /> Copy</>}
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

        {/*  Generate Invite Link  */}
        <div className="space-y-3">
          <SL icon={<Link size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
            Generate Invite Link
          </SL>
          <p
            className="font-body-md text-[12px] leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }}
          >
            Create a shareable link with optional expiration. All joins default to <strong style={{ color: "var(--color-on-surface)" }}>Staff</strong>.
          </p>

          <div className="flex items-center gap-2">
            <div className="w-[180px]">
              <Dropdown
                value={expireDays}
                options={EXPIRE_OPTIONS}
                onChange={setExpireDays}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 font-label-caps text-[10px] font-bold uppercase tracking-[0.05em] px-4 py-2 rounded-[6px] hover:-translate-y-px disabled:opacity-30 transition-all"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              {isGenerating ? (
                <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Link size={11} strokeWidth={2} />
              )}
              {isGenerating ? "Generating…" : "Generate"}
            </button>
          </div>

          {error && (
            <p className="font-body-md text-[11px]" style={{ color: "rgba(186,26,26,0.8)" }}>{error}</p>
          )}
        </div>

        {/* Active Links */}
        {inviteLinks.length > 0 && (
          <>
            <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
            <div className="space-y-2">
              <SL icon={<Users size={11} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.38 }} />}>
                Active Links
              </SL>
              <div className="space-y-2">
                {inviteLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[8px]"
                    style={{ border: "1px solid rgba(0,0,0,0.05)", background: "rgba(0,0,0,0.01)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-display text-[12px] truncate mb-0.5"
                        style={{ color: "var(--color-on-surface)", opacity: 0.8 }}
                      >
                        {link.url}
                      </p>
                      <div
                        className="flex items-center gap-3 font-label-caps text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                      >
                        <span className="flex items-center gap-1"><Users size={9} /> {link.uses} uses</span>
                        {link.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock size={9} /> Exp: {new Date(link.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(link.url, link.id)}
                        className="p-1.5 rounded-[5px] hover:bg-black/[0.05] transition-colors"
                        title="Copy link"
                      >
                        {copiedId === link.id
                          ? <Check size={13} strokeWidth={1.75} style={{ color: "var(--color-primary)" }} />
                          : <Copy size={13} strokeWidth={1.75} style={{ color: "var(--color-on-surface-variant)", opacity: 0.55 }} />
                        }
                      </button>
                      <button
                        onClick={() => setLinkToRevoke(link.id)}
                        className="p-1.5 rounded-[5px] hover:bg-red-50 transition-colors"
                        title="Revoke link"
                      >
                        <Trash2 size={13} strokeWidth={1.75} style={{ color: "rgba(186,26,26,0.55)" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Role note  */}
        <InfoBox icon={<ShieldCheck size={14} strokeWidth={1.75} />}>
          All users joining via these methods are automatically assigned the{" "}
          <strong style={{ color: "var(--color-on-surface)" }}>Staff</strong> role.
          Access scope and positions can be modified by an Admin after they join.
        </InfoBox>

      </ModalContent>

      <ModalFooter summary={footerSummary}>
        <button
          onClick={onClose}
          className="font-label-caps text-[10px] uppercase tracking-[0.05em] font-semibold px-3.5 py-2 rounded-[6px] hover:bg-black/[0.05] transition-colors"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.65 }}
        >
          Close
        </button>
      </ModalFooter>

      <ConfirmationModal
        isOpen={!!linkToRevoke}
        onClose={() => setLinkToRevoke(null)}
        onConfirm={() => {
          if (linkToRevoke) revokeInviteLink(linkToRevoke);
          setLinkToRevoke(null);
        }}
        title="Revoke invite link?"
        description="This will permanently disable the invite link. Anyone who tries to use it will be denied access."
        confirmLabel="Revoke Link"
      />
    </ModalShell>
  );
}
