import React, { useState } from "react";
import { useCampaigns } from "../context/CampaignsContext";
import { X, Target, Calendar, Tag, Flag, Clock } from "lucide-react";
import { CampaignPriority } from "../types";

export default function AddCampaignModal({ onClose }: { onClose: () => void }) {
  const { addCampaign } = useCampaigns();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<CampaignPriority>("Medium");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCampaign({
      name,
      description,
      startDate,
      endDate,
      priority,
      tags: tags.split(",").map(t => t.trim()).filter(t => t),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[520px] bg-surface-container-lowest rounded-2xl shadow-2xl animate-scale-in border border-black/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Target size={14} />
            </div>
            <h2 className="font-display font-semibold text-[15px] text-on-surface">Launch Campaign</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-on-surface-variant opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Campaign Name *</label>
              <input 
                type="text" autoFocus required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                placeholder="e.g. Summer Sale 2024"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface h-20 resize-none"
                placeholder="Primary objective and details..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Priority Level</label>
              <div className="relative flex items-center">
                <Flag size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                <select 
                  value={priority} onChange={e => setPriority(e.target.value as CampaignPriority)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low font-body-sm text-[12.5px] text-on-surface appearance-none"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-label-caps text-[9px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Tags (comma separated)</label>
              <div className="relative flex items-center">
                <Tag size={13} className="absolute left-3 text-on-surface-variant opacity-60" />
                <input 
                  type="text" value={tags} onChange={e => setTags(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
                  placeholder="social, influencer..."
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low/50 border border-black/[0.03] space-y-4">
            <h3 className="font-display font-medium text-[12px] text-on-surface opacity-80">Campaign Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">Start Date</label>
                <div className="relative flex items-center">
                   <Calendar size={12} className="absolute left-3 text-on-surface-variant opacity-60" />
                   <input 
                     type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                     className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[11px] text-on-surface"
                   />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-[8.5px] text-on-surface-variant opacity-60 mb-1.5 uppercase tracking-wider">End Date</label>
                <div className="relative flex items-center">
                   <Clock size={12} className="absolute left-3 text-on-surface-variant opacity-60" />
                   <input 
                     type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                     className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[11px] text-on-surface"
                   />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-surface-container-low border-t border-black/[0.04] flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide text-on-surface-variant hover:bg-black/5 transition-colors">CANCEL</button>
          <button 
            type="submit" onClick={handleSubmit} disabled={!name.trim()}
            className="px-6 py-2 rounded-lg font-label-caps text-[10px] font-bold tracking-wide bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all disabled:opacity-50"
          >
            CREATE CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  );
}
