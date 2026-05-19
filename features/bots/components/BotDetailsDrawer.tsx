import React, { useState } from "react";
import { useBots } from "../context/BotContext";
import { X, Bot as BotIcon, MessageCircle, Phone, Globe, Activity, ToggleLeft, ToggleRight, Hash, PlaySquare, Trash2, PowerOff, Power } from "lucide-react";
import { BotStatus } from "../types";

export default function BotDetailsDrawer({ botId, onClose }: { botId: string, onClose: () => void }) {
  const { bots, updateBot, updateStatus, deleteBot } = useBots();
  const bot = bots.find(b => b.id === botId);

  const [activeTab, setActiveTab] = useState<"overview" | "automations" | "commands">("overview");

  if (!bot) return null;

  const getStatusColor = (status: BotStatus) => {
    switch(status) {
      case "Active": return "bg-[#10B981]/10 text-[#10B981]";
      case "Pending Setup": return "bg-[#F59E0B]/10 text-[#F59E0B]";
      case "Disabled": return "bg-black/5 text-on-surface opacity-70";
      case "Archived": return "bg-black/5 text-on-surface opacity-40";
      default: return "bg-black/5 text-on-surface opacity-60";
    }
  };

  const getPlatformIcon = (platform: string) => {
     if (platform === "Telegram") return <MessageCircle size={18} className="text-[#229ED9]" />;
     if (platform === "WhatsApp") return <Phone size={18} className="text-[#25D366]" />;
     return <Globe size={18} className="text-primary" />;
  };

  const toggleAutomation = (key: keyof typeof bot.automations) => {
     updateBot(bot.id, {
        automations: {
           ...bot.automations,
           [key]: !bot.automations[key]
        }
     });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[480px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04] bg-surface-container-low shrink-0">
           <div className="flex items-center gap-3">
              {bot.status === "Active" ? (
                 <button 
                   onClick={() => updateStatus(bot.id, "Disabled")}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-caps text-[9px] font-bold text-on-surface-variant hover:bg-black/5 transition-all"
                 >
                   <PowerOff size={12} /> DISABLE BOT
                 </button>
              ) : bot.status === "Disabled" || bot.status === "Pending Setup" ? (
                 <button 
                   onClick={() => updateStatus(bot.id, "Active")}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-caps text-[9px] font-bold text-[#10B981] hover:bg-black/5 transition-all"
                 >
                   <Power size={12} /> ACTIVATE BOT
                 </button>
              ) : null}
           </div>
           <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-50 hover:opacity-100 hover:bg-black/5 transition-colors">
             <X size={16} />
           </button>
        </div>

        {/* Header Info */}
        <div className="px-6 py-6 border-b border-black/[0.04] bg-surface-container-lowest shrink-0">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
                 {getPlatformIcon(bot.platform)}
              </div>
              <span className={`font-label-caps text-[9px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(bot.status)}`}>
                {bot.status.toUpperCase()}
              </span>
           </div>
           <h2 className="font-display font-semibold text-[20px] text-on-surface leading-tight mb-2">{bot.name}</h2>
           <p className="font-body-sm text-[13px] text-on-surface-variant opacity-80 leading-relaxed">{bot.description}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-black/[0.04] flex gap-6 shrink-0 bg-surface-container-low/30">
           {(["overview", "automations", "commands"] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 font-display text-[12px] font-medium transition-all ${activeTab === tab ? "text-primary" : "text-on-surface-variant opacity-60 hover:opacity-100"}`}
              >
                 <span className="capitalize">{tab}</span>
                 {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-md bg-primary" />}
              </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
           {activeTab === "overview" && (
              <div className="p-6 space-y-6">
                 {/* Metrics */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-container-low border border-black/[0.04]">
                       <div className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-wider mb-2">
                         <Activity size={12} /> Messages Sent
                       </div>
                       <p className="font-display font-medium text-[24px] text-on-surface">{bot.metrics.messagesSent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low border border-black/[0.04]">
                       <div className="flex items-center gap-1.5 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-60 uppercase tracking-wider mb-2">
                         <PlaySquare size={12} /> Active Workflows
                       </div>
                       <p className="font-display font-medium text-[24px] text-on-surface">{bot.metrics.activeWorkflows}</p>
                    </div>
                 </div>

                 {/* Credentials Info */}
                 <div>
                    <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider mb-3">Connection Details</h3>
                    <div className="space-y-3">
                       <div>
                          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 mb-1">Webhook URL</p>
                          <div className="px-3 py-2 rounded-lg bg-surface-container-low font-mono text-[11px] text-on-surface opacity-80 break-all">
                             {bot.webhookUrl || "Not configured"}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Activity Log */}
                 <div>
                    <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider mb-4">Activity Log</h3>
                    <div className="relative border-l border-black/10 ml-2.5 space-y-5 pb-4">
                       {bot.activities.slice().reverse().map(a => (
                          <div key={a.id} className="relative pl-5">
                             <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-surface-container-lowest border-[2.5px] border-primary/40 ring-2 ring-surface-container-lowest" />
                             <div>
                                <p className="font-body-sm text-[12px] text-on-surface">
                                  {a.description}
                                </p>
                                <p className="font-body-sm text-[10.5px] text-on-surface-variant opacity-50 mt-0.5">
                                   {new Date(a.timestamp).toLocaleString()} by {a.author}
                                </p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {activeTab === "automations" && (
              <div className="p-6 space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-black/[0.04]">
                    <div>
                       <h4 className="font-display font-medium text-[13.5px] text-on-surface">Auto-Reply</h4>
                       <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-60 mt-0.5">Automatically reply to standard queries.</p>
                    </div>
                    <button onClick={() => toggleAutomation("autoReplyEnabled")} className={`transition-colors ${bot.automations.autoReplyEnabled ? "text-primary" : "text-on-surface-variant opacity-40"}`}>
                       {bot.automations.autoReplyEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-black/[0.04]">
                    <div>
                       <h4 className="font-display font-medium text-[13.5px] text-on-surface">Welcome Message</h4>
                       <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-60 mt-0.5">Send a greeting to new users/contacts.</p>
                    </div>
                    <button onClick={() => toggleAutomation("welcomeMessageEnabled")} className={`transition-colors ${bot.automations.welcomeMessageEnabled ? "text-primary" : "text-on-surface-variant opacity-40"}`}>
                       {bot.automations.welcomeMessageEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-black/[0.04]">
                    <div>
                       <h4 className="font-display font-medium text-[13.5px] text-on-surface">Default Fallback</h4>
                       <p className="font-body-sm text-[11.5px] text-on-surface-variant opacity-60 mt-0.5">Message sent when a command is not recognized.</p>
                    </div>
                    <button onClick={() => toggleAutomation("defaultFallbackEnabled")} className={`transition-colors ${bot.automations.defaultFallbackEnabled ? "text-primary" : "text-on-surface-variant opacity-40"}`}>
                       {bot.automations.defaultFallbackEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>
              </div>
           )}

           {activeTab === "commands" && (
              <div className="p-6">
                 {bot.commands.length === 0 ? (
                    <div className="text-center py-8">
                       <Hash size={24} className="mx-auto text-on-surface-variant opacity-20 mb-2" />
                       <p className="font-body-sm text-[13px] text-on-surface-variant opacity-50">No custom commands configured.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {bot.commands.map(cmd => (
                          <div key={cmd.id} className="p-4 rounded-xl bg-surface-container-low border border-black/[0.04] flex flex-col">
                             <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-[12px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">{cmd.command}</span>
                                <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 bg-black/5 px-2 py-0.5 rounded">{cmd.actionType.toUpperCase()}</span>
                             </div>
                             <p className="font-body-sm text-[12.5px] text-on-surface opacity-80">{cmd.description}</p>
                          </div>
                       ))}
                    </div>
                 )}
                 <button className="w-full py-3 mt-4 rounded-xl border border-dashed border-black/10 text-primary font-label-caps text-[10px] font-bold hover:bg-surface-container-low/50 transition-colors">
                    + ADD COMMAND
                 </button>
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-lowest border-t border-black/[0.05] shrink-0">
           <button 
             onClick={() => { deleteBot(bot.id); onClose(); }}
             className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[#ef4444] hover:bg-[#ef4444]/5 transition-colors font-label-caps text-[10px] font-bold"
           >
              <Trash2 size={12} /> DELETE BOT
           </button>
        </div>
      </div>
    </div>
  );
}
