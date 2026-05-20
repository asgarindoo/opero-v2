import React, { useState } from "react";
import { useBots } from "../context/BotContext";
import { X, Bot as BotIcon, MessageCircle, Phone, Globe, ChevronRight } from "lucide-react";
import { PlatformType } from "@/features/bots";

export default function AddBotModal({ onClose }: { onClose: () => void }) {
  const { addBot } = useBots();
  const [step, setStep] = useState(1);
  
  const [platform, setPlatform] = useState<PlatformType>("Telegram");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [token, setToken] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && platform) setStep(2);
    else if (step === 2 && name.trim()) setStep(3);
    else if (step === 3) {
       addBot({
         platform,
         name,
         description,
         token,
         status: "Pending Setup"
       });
       onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BotIcon size={14} />
            </div>
            <div>
               <h2 className="font-display font-semibold text-[15px] text-on-surface">Connect New Bot</h2>
               <div className="flex items-center gap-1 mt-1">
                  <div className={`h-1 w-6 rounded-full ${step >= 1 ? "bg-primary" : "bg-black/10"}`} />
                  <div className={`h-1 w-6 rounded-full ${step >= 2 ? "bg-primary" : "bg-black/10"}`} />
                  <div className={`h-1 w-6 rounded-full ${step >= 3 ? "bg-primary" : "bg-black/10"}`} />
               </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
           {step === 1 && (
             <div className="animate-fade-in">
                <h3 className="font-display font-semibold text-[16px] text-on-surface mb-2">Select Platform</h3>
                <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-70 mb-5">Choose the messaging channel you want to automate.</p>
                
                <div className="space-y-3">
                   <button 
                     onClick={() => setPlatform("Telegram")}
                     className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${platform === "Telegram" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-black/10 hover:border-black/20"}`}
                   >
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                         <MessageCircle size={18} className="text-[#229ED9]" />
                      </div>
                      <div className="text-left">
                         <p className="font-display font-semibold text-[14px] text-on-surface">Telegram Bot</p>
                         <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-70 mt-0.5">Connect via BotFather token</p>
                      </div>
                   </button>

                   <button 
                     onClick={() => setPlatform("WhatsApp")}
                     className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${platform === "WhatsApp" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-black/10 hover:border-black/20"}`}
                   >
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                         <Phone size={18} className="text-[#25D366]" />
                      </div>
                      <div className="text-left">
                         <p className="font-display font-semibold text-[14px] text-on-surface">WhatsApp Business</p>
                         <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-70 mt-0.5">Connect via Cloud API</p>
                      </div>
                   </button>
                </div>
             </div>
           )}

           {step === 2 && (
             <form id="bot-form-step-2" onSubmit={handleNext} className="animate-fade-in space-y-5">
                <h3 className="font-display font-semibold text-[16px] text-on-surface mb-1">Bot Details</h3>
                <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-70 mb-5">Give your bot a recognizable name and description.</p>
                
                <div>
                   <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-1.5">Bot Name *</label>
                   <input 
                     autoFocus required
                     value={name} onChange={e => setName(e.target.value)}
                     className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body text-[13px] text-on-surface"
                     placeholder="e.g. Support Notifier"
                   />
                </div>
                <div>
                   <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-1.5">Description</label>
                   <textarea 
                     value={description} onChange={e => setDescription(e.target.value)}
                     className="w-full h-24 px-4 py-3 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body text-[13px] text-on-surface resize-none"
                     placeholder="What does this bot do?"
                   />
                </div>
             </form>
           )}

           {step === 3 && (
             <form id="bot-form-step-3" onSubmit={handleNext} className="animate-fade-in space-y-5">
                <h3 className="font-display font-semibold text-[16px] text-on-surface mb-1">Authentication</h3>
                <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-70 mb-5">Provide the required credentials to connect OPERO to your bot.</p>
                
                <div>
                   <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-1.5">
                      {platform === "Telegram" ? "Bot Token (from BotFather)" : "WhatsApp Access Token"} *
                   </label>
                   <input 
                     type="password" autoFocus required
                     value={token} onChange={e => setToken(e.target.value)}
                     className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body text-[13px] text-on-surface"
                     placeholder="Paste token here..."
                   />
                   <p className="font-body-sm text-[10.5px] text-on-surface-variant opacity-50 mt-2">
                     Tokens are encrypted at rest and never displayed in the UI after setup.
                   </p>
                </div>
             </form>
           )}
        </div>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex items-center justify-between shrink-0">
          {step > 1 ? (
             <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">BACK</button>
          ) : <div />}
          
          <button 
            type={step === 2 || step === 3 ? "submit" : "button"}
            form={step === 2 ? "bot-form-step-2" : step === 3 ? "bot-form-step-3" : undefined}
            onClick={step === 1 ? handleNext : undefined}
            disabled={(step === 2 && !name.trim()) || (step === 3 && !token.trim())}
            className="flex items-center gap-1.5 px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50"
          >
            {step === 3 ? "CONNECT BOT" : "CONTINUE"} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
