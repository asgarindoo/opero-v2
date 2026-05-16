import React, { useState } from "react";
import { X, ChevronDown, Link, Copy, Trash2, Clock, Check, Users, Hash, Plus, ShieldCheck } from "lucide-react";
import { useMembers } from "../context/MembersContext";
import Button from "../../components/ui/Button";

export default function InviteModal({ onClose }: { onClose: () => void }) {
  const { inviteLinks, generateInviteLink, revokeInviteLink, tenantCode } = useMembers();

  const [expireDays, setExpireDays] = useState<number | "never">(7);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpireDropdownOpen, setIsExpireDropdownOpen] = useState(false);

  const expireOptions = [
    { value: 1, label: "24 Hours" },
    { value: 7, label: "7 Days" },
    { value: 30, label: "30 Days" },
    { value: "never", label: "Never Expires" }
  ];

  const selectedExpireLabel = expireOptions.find(o => o.value === expireDays)?.label;

  const handleGenerateLink = () => {
    const days = expireDays === "never" ? null : expireDays;
    generateInviteLink(days);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[480px] bg-background rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden animate-scale-up flex flex-col max-h-[90vh]"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <h2 className="font-display font-semibold text-[14px] text-on-surface">Workspace Access</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/[0.04] transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-10">
            {/* Permanent Workspace Code Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Permanent Workspace Code</h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 leading-relaxed">
                  Share this unique code for persistent, direct access to the workspace.
                </p>
              </div>

              <div className="flex items-center gap-2 p-1 pl-4 rounded-lg border border-black/[0.06] bg-black/[0.01]">
                <Hash size={14} className="text-on-surface-variant opacity-60" />
                <span className="flex-1 font-display font-bold text-[16px] text-on-surface tracking-[0.2em]">{tenantCode}</span>
                <button
                  onClick={() => handleCopy(tenantCode, 'tenant-code')}
                  className="px-4 py-2 rounded-md bg-white border border-black/[0.06] font-label-caps text-[10px] font-bold text-primary hover:shadow-sm transition-all relative"
                >
                  {copiedId === 'tenant-code' ? 'COPIED' : 'COPY CODE'}
                </button>
              </div>
            </div>

            {/* Invite Link Generation Section */}
            <div className="space-y-4 pt-8 border-t border-black/[0.04]">
              <div>
                <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Generated Invite Link</h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 leading-relaxed">
                  Create a shareable link with optional expiration. All joins default to <strong className="text-on-surface">Staff</strong>.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <button
                    onClick={() => setIsExpireDropdownOpen(!isExpireDropdownOpen)}
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-lg font-body-sm text-[13px] outline-none transition-all border ${isExpireDropdownOpen
                        ? "bg-black/[0.02] border-primary/20"
                        : "bg-black/[0.01] border-black/[0.04] hover:border-black/[0.08]"
                      } text-on-surface`}
                  >
                    <span className="opacity-80">{selectedExpireLabel}</span>
                    <ChevronDown
                      size={14}
                      className={`text-on-surface-variant transition-transform duration-200 ${isExpireDropdownOpen ? "rotate-180" : "opacity-60"}`}
                    />
                  </button>

                  {isExpireDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsExpireDropdownOpen(false)} />
                      <div className="absolute bottom-[calc(100%+4px)] left-0 w-full bg-background rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-20 animate-fade-in origin-bottom">
                        {expireOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setExpireDays(option.value as number | "never");
                              setIsExpireDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 font-body-sm text-[13px] transition-colors flex items-center justify-between ${expireDays === option.value
                                ? "bg-primary/[0.03] text-primary font-semibold"
                                : "text-on-surface hover:bg-black/[0.02]"
                              }`}
                          >
                            {option.label}
                            {expireDays === option.value && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="h-11 px-6 font-bold tracking-wider"
                  icon={Link}
                  onClick={handleGenerateLink}
                >
                  GENERATE
                </Button>
              </div>
            </div>

            {/* Active Links List */}
            {inviteLinks.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.1em]">Shared Access Links</h3>
                <div className="flex flex-col gap-2">
                  {inviteLinks.map(link => (
                    <div key={link.id} className="p-3 pl-4 rounded-lg border border-black/[0.04] bg-black/[0.01] flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-body-sm text-[12px] text-on-surface truncate opacity-80 mb-0.5">
                          {link.url}
                        </div>
                        <div className="flex items-center gap-3 font-body-sm text-[10px] text-on-surface-variant opacity-60 uppercase tracking-wider">
                          <span className="flex items-center gap-1 font-bold"><Users size={10} /> {link.uses} uses</span>
                          {link.expiresAt && (
                             <span className="flex items-center gap-1"><Clock size={10} /> Exp: {new Date(link.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(link.url, link.id)}
                          className="p-2 rounded-md hover:bg-black/[0.04] text-on-surface-variant transition-colors group relative"
                        >
                          {copiedId === link.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="opacity-60 group-hover:opacity-100" />}
                        </button>
                        <button
                          onClick={() => revokeInviteLink(link.id)}
                          className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors opacity-60 hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {/* Automatic Role Note */}
            <div className="p-4 rounded-lg bg-black/[0.02] border border-black/[0.04] flex gap-3 items-start">
               <ShieldCheck size={16} className="text-primary mt-0.5 opacity-60" />
               <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 leading-relaxed">
                 All users joining via these methods are automatically assigned the <strong className="text-on-surface">Staff</strong> role. 
                 Access scope and positions can be modified by an Admin after they join.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
