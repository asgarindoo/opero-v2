import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { X, Building2, Briefcase, Mail, Phone, Activity as ActivityIcon, Edit3, MessageSquare, DollarSign, Target, User } from "lucide-react";

export default function ContactDrawer({ contactId, onClose }: { contactId: string, onClose: () => void }) {
  const { contacts, addNote } = useContacts();
  const contact = contacts.find(c => c.id === contactId);
  const [newNote, setNewNote] = useState("");

  if (!contact) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNote(contact.id, newNote);
    setNewNote("");
  };

  const isFinancialType = ["Customer", "Reseller", "Distributor", "Affiliate", "Investor", "Supplier", "Vendor"].includes(contact.relationshipType);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-[400px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05]">
        
        {/* Header */}
        <div className="relative px-6 py-8 border-b border-black/[0.04] bg-surface-container-low/30 shrink-0">
           <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-md text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
             <X size={16} />
           </button>
           
           <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-display font-semibold text-[18px] text-primary shrink-0">
                 {contact.initials}
              </div>
              <div>
                 <h2 
                   className="font-display font-semibold text-[18px] text-on-surface leading-tight mb-1 break-words break-all line-clamp-3"
                   title={contact.name}
                 >
                   {contact.name}
                 </h2>
                 <p className="font-body-sm text-[13px] text-on-surface-variant opacity-70">{contact.industry}</p>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="font-label-caps text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-on-surface opacity-80">
                      {contact.relationshipType.toUpperCase()}
                    </span>
                    <span className={`font-label-caps text-[9px] font-bold px-2 py-0.5 rounded-full ${contact.status === "Active" ? "bg-primary/10 text-primary" : "bg-black/5 text-on-surface opacity-70"}`}>
                      {contact.status.toUpperCase()}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
           {/* Context Data */}
           {isFinancialType && Object.keys(contact.contextData).length > 0 && (
              <div className="px-6 py-6 border-b border-black/[0.04]">
                 <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-wider mb-4">Overview</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {contact.contextData.value !== undefined && (
                      <div className="p-3 rounded-xl bg-surface-container-low/50 border border-black/5 min-w-0">
                         <div className="flex items-center gap-1.5 font-body-sm text-[11px] text-on-surface-variant opacity-70 mb-1 shrink-0">
                           <DollarSign size={12} /> Deal Value
                         </div>
                         <p 
                           className="font-display font-semibold text-[14px] text-on-surface truncate"
                           title={new Intl.NumberFormat("en-US", { style: "currency", currency: contact.contextData.currency || "USD" }).format(contact.contextData.value)}
                         >
                           {new Intl.NumberFormat("en-US", { style: "currency", currency: contact.contextData.currency || "USD" }).format(contact.contextData.value)}
                         </p>
                      </div>
                    )}
                    {contact.contextData.stage !== undefined && (
                      <div className="p-3 rounded-xl bg-surface-container-low/50 border border-black/5">
                         <div className="flex items-center gap-1.5 font-body-sm text-[11px] text-on-surface-variant opacity-70 mb-1">
                           <Target size={12} /> Stage
                         </div>
                         <p className="font-display font-semibold text-[14px] text-on-surface">{contact.contextData.stage}</p>
                      </div>
                    )}
                 </div>
              </div>
           )}

           {/* People */}
           <div className="px-6 py-6 border-b border-black/[0.04]">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-wider">Contact Persons</h3>
                 <button className="text-[10px] font-medium text-primary hover:underline">Manage</button>
              </div>
              <div className="space-y-3">
                 {contact.persons.length === 0 ? (
                    <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 italic">No contacts added.</p>
                 ) : (
                    contact.persons.map(p => (
                       <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/30 border border-black/5">
                          <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center font-display font-medium text-[11px] text-on-surface shrink-0">
                             {p.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex items-center justify-between">
                               <p className="font-display font-medium text-[13px] text-on-surface truncate">{p.name}</p>
                               {p.isPrimary && <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">PRIMARY</span>}
                             </div>
                             <p className="font-body-sm text-[11px] text-on-surface-variant opacity-70 truncate">{p.role || "No role"}</p>
                             <div className="mt-2 space-y-1">
                                {p.email && (
                                  <div className="flex items-center gap-1.5 font-body-sm text-[11px] text-on-surface-variant opacity-80">
                                     <Mail size={10} className="opacity-50" /> {p.email}
                                  </div>
                                )}
                                {p.phone && (
                                  <div className="flex items-center gap-1.5 font-body-sm text-[11px] text-on-surface-variant opacity-80">
                                     <Phone size={10} className="opacity-50" /> {p.phone}
                                  </div>
                                )}
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Activity Timeline */}
           <div className="px-6 py-6 pb-24">
              <h3 className="flex items-center gap-1.5 font-label-caps text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-wider mb-6">
                 <ActivityIcon size={12} /> Timeline
              </h3>
              <div className="relative border-l border-black/10 ml-2.5 space-y-6">
                 {contact.activities.length === 0 ? (
                    <p className="pl-5 font-body-sm text-[12px] text-on-surface-variant opacity-60 italic">No activity recorded.</p>
                 ) : (
                    contact.activities.map(a => (
                       <div key={a.id} className="relative pl-5">
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-surface-container-low border-[3px] border-surface-container-lowest ring-1 ring-black/10" />
                          <div className="bg-surface-container-low/50 rounded-xl p-3 border border-black/[0.03]">
                             <p className="font-body-sm text-[12px] text-on-surface leading-snug">{a.description}</p>
                             <div className="flex items-center justify-between mt-2 font-body-sm text-[10px] text-on-surface-variant opacity-60">
                                <span>{a.author}</span>
                                <span>{new Date(a.timestamp).toLocaleString()}</span>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Footer Add Note */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-surface-container-lowest border-t border-black/[0.05] shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
           <form onSubmit={handleAddNote} className="relative flex items-center">
              <input 
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Write a note..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-black/10 focus:bg-surface-container-lowest focus:border-primary/40 outline-none transition-all font-body-sm text-[12.5px] text-on-surface"
              />
              <button 
                type="submit"
                disabled={!newNote.trim()}
                className="absolute right-2 p-1.5 rounded-lg text-primary disabled:text-on-surface-variant disabled:opacity-60 hover:bg-black/5 transition-colors"
              >
                 <MessageSquare size={14} />
              </button>
           </form>
        </div>
        
      </div>
    </div>
  );
}
