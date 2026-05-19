"use client";

import React, { useState } from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { X, Clock, User, CheckCircle2, ListTodo, Trash2, Calendar, Share2, Mail, Globe, Activity, ExternalLink } from "lucide-react";

export default function CampaignDrawer({ campaignId, onClose }: { campaignId: string, onClose: () => void }) {
  const { campaigns, deleteCampaigns } = useCampaigns();
  const [activeTab, setActiveTab] = useState<"details" | "activities">("details");
  const campaign = campaigns.find(c => c.id === campaignId);

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[560px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-white z-10 sticky top-0 border-b border-black/[0.02]">
          <div className="flex items-center gap-2">
             <div className="px-2 py-0.5 rounded font-label-caps text-[9px] font-bold border text-on-surface-variant bg-black/[0.04] border-black/[0.06] opacity-70">
               {campaign.priority.toUpperCase()} PRIORITY
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { if(confirm("Delete campaign?")) { deleteCampaigns([campaign.id]); onClose(); } }}
              className="p-1.5 rounded-md text-on-surface-variant opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-black/[0.03] bg-black/[0.01]">
           <button 
             onClick={() => setActiveTab("details")}
             className={`px-6 py-3 font-label-caps text-[9px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-on-surface-variant opacity-60 hover:opacity-100'}`}
           >
              Campaign Details
           </button>
           <button 
             onClick={() => setActiveTab("activities")}
             className={`px-6 py-3 font-label-caps text-[9px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'activities' ? 'border-black text-black' : 'border-transparent text-on-surface-variant opacity-60 hover:opacity-100'}`}
           >
              Marketing Activities
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-6">
          
          {activeTab === "details" && (
            <div className="animate-in fade-in duration-300">
               <div className="mb-10">
                 <div className="flex items-center gap-2 mb-3">
                   <span className={`font-label-caps text-[9px] font-bold px-2 py-0.5 rounded bg-black/5 border border-black/[0.03] text-on-surface opacity-60 uppercase tracking-widest`}>
                     {campaign.status.toUpperCase()}
                   </span>
                   <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                 </div>
                 <h3 className="font-display font-bold text-[24px] text-on-surface leading-tight mb-3">{campaign.name}</h3>
                 <p className="font-body-sm text-[12.5px] text-on-surface-variant opacity-70 leading-relaxed mb-6">
                   {campaign.description || "No description provided."}
                 </p>
 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-black/[0.01] border border-black/[0.04]">
                       <p className="font-label-caps text-[8.5px] text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5">Owner</p>
                       <div className="flex items-center gap-2 font-display font-bold text-[13px] text-on-surface opacity-80">
                          <User size={13} className="opacity-60" /> {campaign.owner}
                       </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/[0.01] border border-black/[0.04]">
                       <p className="font-label-caps text-[8.5px] text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5">Linked Tasks</p>
                       <div className="flex items-center gap-2 font-display font-bold text-[13px] text-on-surface opacity-80">
                          <ListTodo size={13} className="opacity-60" /> {campaign.linkedTasks} tasks
                       </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/[0.01] border border-black/[0.04]">
                       <p className="font-label-caps text-[8.5px] text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5">Start Date</p>
                       <div className="flex items-center gap-2 font-display font-bold text-[13px] text-on-surface opacity-80">
                          <Calendar size={13} className="opacity-60" /> {new Date(campaign.startDate).toLocaleDateString()}
                       </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/[0.01] border border-black/[0.04]">
                       <p className="font-label-caps text-[8.5px] text-on-surface-variant opacity-60 uppercase tracking-widest mb-1.5">End Date</p>
                       <div className="flex items-center gap-2 font-display font-bold text-[13px] text-on-surface opacity-80">
                          <Clock size={13} className="opacity-60" /> {new Date(campaign.endDate).toLocaleDateString()}
                       </div>
                    </div>
                 </div>
               </div>

               <section className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider">Campaign Goals</h4>
                     <button className="text-[10px] font-bold text-black border-b border-black/20 hover:border-black transition-all">+ ADD GOAL</button>
                  </div>
                  <div className="space-y-2">
                     {campaign.goals.map(goal => (
                       <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.01] border border-black/[0.03]">
                         <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${goal.isCompleted ? "bg-black border-black text-white" : "border-black/10 text-transparent"}`}>
                            <CheckCircle2 size={11} />
                         </div>
                         <span className={`font-body-sm text-[12px] flex-1 ${goal.isCompleted ? "text-on-surface-variant opacity-60 line-through" : "text-on-surface opacity-80 font-medium"}`}>
                            {goal.description}
                         </span>
                       </div>
                     ))}
                  </div>
               </section>

               <section className="mb-10">
                  <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-4">Assigned Team</h4>
                  <div className="flex flex-wrap gap-3">
                     {campaign.assignedStaff.map((staff, i) => (
                       <div key={i} className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.04]">
                         <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-bold text-[8px]">
                           {staff.charAt(0)}
                         </div>
                         <span className="font-body-sm text-[11px] font-bold text-on-surface opacity-70">{staff}</span>
                       </div>
                     ))}
                     <button className="w-8 h-8 rounded-full border border-dashed border-black/20 flex items-center justify-center text-on-surface-variant opacity-60 hover:opacity-100 transition-all">+</button>
                  </div>
               </section>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="animate-in fade-in duration-300 space-y-6">
               <div className="flex items-center justify-between mb-2">
                  <h4 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">Operational Execution</h4>
                  <button className="text-[10px] font-bold text-black border border-black/10 px-3 py-1.5 rounded-[6px] hover:bg-black/[0.03] transition-all">LINK ACTIVITY</button>
               </div>
               
               <div className="space-y-4">
                  {[
                    { title: "Summer Launch Broadcast", type: "Broadcast", platform: "Email", status: "Sent", icon: Mail },
                    { title: "Brand Refresh Instagram Post", type: "Social", platform: "Instagram", status: "Scheduled", icon: Share2 },
                    { title: "Technical Architecture Blog", type: "Content", platform: "Web", status: "Draft", icon: Globe },
                  ].map((act, i) => (
                    <div key={i} className="group p-4 rounded-xl bg-black/[0.01] border border-black/[0.04] hover:border-black/[0.1] transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center">
                                <act.icon size={14} className="text-black/60" />
                             </div>
                             <div>
                                <h5 className="font-display text-[13.5px] font-bold text-on-surface leading-none group-hover:text-primary transition-colors">{act.title}</h5>
                                <p className="font-body-sm text-[11px] text-on-surface-variant opacity-40 mt-1">{act.type} • {act.platform}</p>
                             </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded font-label-caps text-[8px] font-bold uppercase tracking-widest ${act.status === 'Sent' ? 'bg-black text-white' : 'bg-black/[0.06] text-on-surface-variant'}`}>
                             {act.status}
                          </span>
                       </div>
                       <button className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant opacity-60 group-hover:opacity-100 transition-opacity">
                          View Workspace <ExternalLink size={10} />
                       </button>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-black/[0.04]">
                  <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-4">Execution History</h4>
                  <div className="space-y-4 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-black/[0.04]">
                    {campaign.activities.map(activity => (
                      <div key={activity.id} className="flex gap-4 relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-black/[0.1] z-10 mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-display font-semibold text-[12px] text-on-surface opacity-90">{activity.description}</p>
                            <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60">{new Date(activity.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60">by {activity.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
          
        </div>
      </div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
