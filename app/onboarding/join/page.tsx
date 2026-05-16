"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Key, Link as LinkIcon, ArrowRight, ArrowLeft, Clipboard, AlertCircle } from "lucide-react";
import Button from "../../dashboard/components/ui/Button";

export default function JoinTenantPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text.trim().toUpperCase());
    } catch {
      /* permission denied — ignore */
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setIsLoading(true);
    // Simulate validation
    setTimeout(() => {
      if (code.trim().toLowerCase() === "invalid") {
        setError("This invite code is invalid or has expired.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    }, 1200);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-[400px] animate-fade-in">
        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/[0.04] text-primary mb-6">
            <Key size={20} />
          </div>
          <h1 className="font-display text-[28px] font-bold text-on-surface tracking-tight mb-3">
            Join Workspace
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant opacity-70">
            Enter your 6–8 character invite code to gain access.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label htmlFor="invite-code" className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-60">
                Invite Code
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity"
              >
                <Clipboard size={10} />
                Paste
              </button>
            </div>
            
            <div className="relative group">
              <Key size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused ? "text-primary" : "text-on-surface-variant opacity-40"}`} />
              <input
                id="invite-code"
                type="text"
                required
                placeholder="OP-XXXXX"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                spellCheck={false}
                autoComplete="off"
                className={`w-full pl-11 pr-4 py-3.5 rounded-lg border bg-black/[0.01] text-on-surface font-display text-[15px] font-semibold tracking-[0.1em] placeholder:text-on-surface-variant/20 placeholder:tracking-normal outline-none transition-all ${
                  error ? "border-red-500/50 shadow-[0_0_0_4px_rgba(239,68,68,0.05)]" : 
                  focused ? "border-primary/50 shadow-[0_0_0_4px_rgba(0,0,0,0.03)]" : 
                  "border-black/[0.06] hover:border-black/[0.12]"
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-1 text-red-600 animate-fade-in">
                <AlertCircle size={12} />
                <p className="font-body-sm text-[12px] font-medium">{error}</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-12 text-[12px] font-bold tracking-wider"
            isLoading={isLoading}
            disabled={!code.trim()}
            icon={ArrowRight}
            iconPosition="right"
          >
            JOIN WORKSPACE
          </Button>
        </form>

        {/* Info Card */}
        <div className="mt-10 p-5 rounded-lg border border-black/[0.04] bg-black/[0.01] flex gap-4 items-start">
          <div className="w-8 h-8 rounded bg-background border border-black/[0.04] flex items-center justify-center shrink-0 mt-0.5 text-on-surface-variant opacity-40">
            <LinkIcon size={14} />
          </div>
          <div>
            <p className="font-display text-[13px] font-semibold text-on-surface mb-1">Have an invite link?</p>
            <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 leading-relaxed">
              Open the link directly from your email. It will authorize your access automatically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
             <Link
              href="/onboarding"
              className="flex items-center gap-2 font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft size={12} />
              Go Back
            </Link>
            <div className="w-px h-3 bg-black/[0.06]" />
            <Link
              href="/onboarding/create"
              className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity"
            >
              Create Workspace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


