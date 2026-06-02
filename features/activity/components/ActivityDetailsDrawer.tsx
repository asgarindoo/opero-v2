import React from "react";
import { useActivity } from "../context/ActivityContext";
import { X, Hash, Box, Calendar, ArrowRight } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName } from "@/lib/user-identity";

export default function ActivityDetailsDrawer({ activityId, onClose }: { activityId: string, onClose: () => void }) {
  const { activities } = useActivity();
  const activity = activities.find(a => a.id === activityId);

  if (!activity) return null;
  const userName = getUserDisplayName(activity.user, "Workspace");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-110 h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/3 shrink-0">
           <h2 className="font-display font-semibold text-[15px] text-on-surface tracking-tight">Activity Detail</h2>
           <button onClick={onClose} className="p-2 rounded-lg text-on-surface-variant opacity-30 hover:opacity-100 hover:bg-black/5 transition-all">
             <X size={16} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12">
           
           {/* Actor Hero */}
           <section className="text-center pb-8 border-b border-black/3">
              <UserAvatar user={activity.user} size="xl" className="mx-auto mb-4 bg-primary/5 text-primary" />
              <h3 className="font-display font-semibold text-[18px] text-on-surface mb-1">{userName}</h3>
              <p className="font-body-sm text-[12px] text-on-surface-variant opacity-50 uppercase tracking-widest">{activity.user.role}</p>
           </section>

           {/* Event Data */}
           <section className="space-y-8">
              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant opacity-40 shrink-0">
                    <Hash size={14} />
                 </div>
                 <div>
                    <p className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] mb-1">EVENT DESCRIPTION</p>
                    <p className="font-body text-[13.5px] text-on-surface leading-relaxed">
                       {activity.description || `${userName} ${activity.action.toLowerCase()} ${activity.entityType.toLowerCase()} ${activity.entityName}`}
                    </p>
                 </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant opacity-40 shrink-0">
                    <Box size={14} />
                 </div>
                 <div>
                    <p className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] mb-1">RELATED ENTITY</p>
                    <div className="flex items-center gap-2 group cursor-pointer">
                       <span className="font-display text-[13.5px] font-semibold text-on-surface group-hover:text-primary transition-colors">{activity.entityName}</span>
                       <span className="font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">({activity.entityType})</span>
                       <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                    </div>
                 </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant opacity-40 shrink-0">
                    <Calendar size={14} />
                 </div>
                 <div>
                    <p className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em] mb-1">TIMESTAMP</p>
                    <p className="font-display text-[13.5px] text-on-surface">
                       {new Date(activity.timestamp).toLocaleString("en-US", { 
                         month: 'long', 
                         day: 'numeric', 
                         year: 'numeric', 
                         hour: '2-digit', 
                         minute: '2-digit',
                         second: '2-digit'
                       })}
                    </p>
                 </div>
              </div>
           </section>

        </div>
      </div>
    </div>
  );
}
