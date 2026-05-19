import React from "react";
import { useBots } from "../context/BotContext";
import { BotStatus } from "../types";
import { MoreHorizontal, MessageCircle, Phone, Globe, Activity } from "lucide-react";

interface Props {
  filterMode: string;
  searchQuery: string;
  onSelect: (id: string) => void;
}

export default function BotList({ filterMode, searchQuery, onSelect }: Props) {
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
     if (platform === "Telegram") return <MessageCircle size={14} className="text-[#229ED9]" />;
     if (platform === "WhatsApp") return <Phone size={14} className="text-[#25D366]" />;
     return <Globe size={14} className="text-primary" />;
  };

  if (filteredBots.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40">
         <Globe size={24} className="mb-2 opacity-20" />
         <p className="font-display text-[13px]">No bots found</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-left min-w-[800px]">
          <thead className="sticky top-0 z-10 bg-surface-container-low/90 backdrop-blur-md border-b border-black/[0.05]">
            <tr>
              <th className="px-5 py-3 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider w-[35%]">
                Bot Name
              </th>
              <th className="px-4 py-3 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-4 py-3 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider">
                Messages
              </th>
              <th className="px-4 py-3 font-label-caps text-[9px] font-bold text-on-surface-variant opacity-50 uppercase tracking-wider">
                Workflows
              </th>
              <th className="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {filteredBots.map(bot => (
              <tr 
                key={bot.id}
                onClick={() => onSelect(bot.id)}
                className="group hover:bg-black/[0.015] transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-display font-medium text-[13.5px] text-on-surface truncate group-hover:text-primary transition-colors">
                      {bot.name}
                    </p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant opacity-50 truncate mt-0.5">
                      {bot.description || "No description"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded bg-white border border-black/5 flex items-center justify-center shadow-sm">
                       {getPlatformIcon(bot.platform)}
                     </div>
                     <span className="font-body-sm text-[12px] text-on-surface opacity-80">{bot.platform}</span>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span className={`font-label-caps text-[8px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(bot.status)}`}>
                    {bot.status.toUpperCase()}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 font-body-sm text-[12px] text-on-surface opacity-90">
                     <Activity size={12} className="text-on-surface-variant opacity-40" />
                     {bot.metrics.messagesSent.toLocaleString()}
                  </div>
                </td>

                <td className="px-4 py-3.5 font-body-sm text-[12px] text-on-surface opacity-90">
                  {bot.metrics.activeWorkflows}
                </td>

                <td className="px-4 py-3.5 text-right">
                  <button className="p-1.5 rounded-md hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all text-on-surface-variant">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
