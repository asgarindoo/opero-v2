import React from "react";
import { useBots } from "../context/BotContext";
import { BotStatus } from "../types";
import { Bot as BotIcon, MessageCircle, Phone, Globe, Activity, CheckCircle2, AlertCircle, PlaySquare, Plus } from "lucide-react";

interface Props {
  filterMode: string;
  searchQuery: string;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

export default function BotGrid({ filterMode, searchQuery, onSelect, onAddNew }: Props) {
  const { bots } = useBots();

  const filteredBots = bots.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch && b.status !== "Archived";
    if (filterMode === "telegram") return matchesSearch && b.platform === "Telegram" && b.status !== "Archived";
    if (filterMode === "whatsapp") return matchesSearch && b.platform === "WhatsApp" && b.status !== "Archived";
    if (filterMode === "web") return matchesSearch && b.platform === "Web" && b.status !== "Archived";
    
    return matchesSearch && b.status !== "Archived";
  });

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
     if (platform === "Telegram") return <MessageCircle size={16} className="text-[#229ED9]" />;
     if (platform === "WhatsApp") return <Phone size={16} className="text-[#25D366]" />;
     return <Globe size={16} className="text-primary" />;
  };

  return (
    <div className="p-6 overflow-y-auto h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max bg-surface-container-lowest">
      {filteredBots.map(bot => (
         <div 
           key={bot.id}
           onClick={() => onSelect(bot.id)}
           className="group bg-surface-container-low rounded-2xl border border-black/[0.04] p-5 cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 flex flex-col"
         >
            <div className="flex items-start justify-between mb-4">
               <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
                  {getPlatformIcon(bot.platform)}
               </div>
               <span className={`font-label-caps text-[8.5px] font-bold px-2 py-1 rounded-full ${getStatusColor(bot.status)}`}>
                  {bot.status.toUpperCase()}
               </span>
            </div>

            <div className="mb-5 flex-1">
               <h3 className="font-display font-semibold text-[15px] text-on-surface group-hover:text-primary transition-colors line-clamp-1">{bot.name}</h3>
               <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-70 line-clamp-2 mt-1">{bot.description || "No description provided."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/[0.04]">
               <div>
                  <div className="flex items-center gap-1.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">
                    <Activity size={10} /> Messages
                  </div>
                  <p className="font-display font-medium text-[13px] text-on-surface">{bot.metrics.messagesSent.toLocaleString()}</p>
               </div>
               <div>
                  <div className="flex items-center gap-1.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider mb-1">
                    <PlaySquare size={10} /> Workflows
                  </div>
                  <p className="font-display font-medium text-[13px] text-on-surface">{bot.metrics.activeWorkflows}</p>
               </div>
            </div>
         </div>
      ))}

      <div 
        onClick={onAddNew}
        className="rounded-2xl border border-dashed border-black/10 bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 text-center min-h-[200px]"
      >
         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Plus size={16} />
         </div>
         <p className="font-display font-medium text-[13px] text-on-surface">Connect New Bot</p>
         <p className="font-body-sm text-[11px] text-on-surface-variant opacity-50 mt-1">Setup Telegram or WhatsApp integration</p>
      </div>
    </div>
  );
}
