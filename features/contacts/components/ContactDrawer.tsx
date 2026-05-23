import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { X, Building2, Briefcase, Mail, Phone, Activity as ActivityIcon, Edit3, MessageSquare, DollarSign, Target, User, Trash2, Clock } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useTenant } from "@/components/providers/TenantProvider";
import { ContactStatus } from "@/features/contacts";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";

function Section({ label, icon, count, children, defaultOpen = true }: { label: string; icon?: React.ReactNode; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 group w-full">
        <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.15em] flex-1 text-left">
          {label} {count !== undefined && `(${count})`}
        </span>
        <div className="h-px flex-1 bg-black/[0.03]" />
      </button>
      {open && children}
    </div>
  );
}

export default function ContactDrawer({ contactId, onClose }: { contactId: string, onClose: () => void }) {
  const { user } = useTenant();
  const { contacts, addNote, updateContact } = useContacts();
  const contact = contacts.find(c => c.id === contactId);
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [newNote, setNewNote] = useState("");

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("");

  if (!contact) return null;

  const submitComment = () => {
    if (!newNote.trim()) return;
    addNote(contact.id, newNote);
    setNewNote("");
  };

  const submitAddPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson = {
      id: "p" + Date.now(),
      name: newPersonName.trim(),
      email: newPersonEmail.trim(),
      role: newPersonRole.trim() || "Contact Person",
      isPrimary: false
    };
    updateContact(contact.id, {
      persons: [...(contact.persons || []), newPerson]
    });
    setNewPersonName("");
    setNewPersonEmail("");
    setNewPersonRole("");
    setShowAddPerson(false);
  };

  const isFinancialType = ["Lead", "Customer", "Client", "Vendor", "Partner", "Investor"].includes(contact.relationshipType);

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title="Contact Details"
      size="sm"
      footer={(
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] font-bold text-on-surface-variant opacity-50 uppercase">Status:</span>
            <div className="w-32">
              <Dropdown 
                value={contact.status}
                options={[
                  { value: "New", label: "New" },
                  { value: "Active", label: "Active" },
                  { value: "Pending", label: "Pending" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Archived", label: "Archived" }
                ]}
                onChange={(v) => updateContact(contact.id, { status: v as ContactStatus })}
                variant="minimal"
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>CLOSE</Button>
        </div>
      )}
    >
      <div className="space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1
            className="font-display text-[22px] font-bold text-on-surface tracking-tight break-words break-all line-clamp-3"
            title={contact.name}
          >
            {contact.name}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={contact.status === "Active" ? "success" : contact.status === "Pending" ? "warning" : (contact.status === "New" || (contact.status as string) === "Lead") ? "info" : contact.status === "Inactive" ? "error" : contact.status === "Archived" ? "slate" : "neutral"}>
              {contact.status}
            </Badge>
            <Badge variant="neutral">{contact.relationshipType}</Badge>
            {contact.industry && <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-30">{contact.industry}</span>}
          </div>
        </div>

        {/* Tabs for Details/Activity */}
        <div className="flex gap-6 border-b border-black/[0.04]">
          {(["details", "activity"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all relative ${tab === t ? 'text-primary' : 'text-on-surface-variant opacity-30 hover:opacity-100'}`}
            >
              {t}
              {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-fade-in" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {tab === "details" && (
            <div className="space-y-8">
               {/* Context Data */}
               {isFinancialType && Object.keys(contact.contextData).length > 0 && (
                 <Section label="Overview">
                   <div className="flex flex-col gap-3">
                     {contact.contextData.value !== undefined && (
                        <div className="space-y-1">
                          <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Deal Value</span>
                          <p className="font-display text-[13.5px] font-semibold text-on-surface">
                            {contact.contextData.currency || "USD"} {new Intl.NumberFormat("en-US", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(contact.contextData.value)}
                          </p>
                        </div>
                     )}
                     {contact.contextData.stage !== undefined && (
                        <div className="space-y-1">
                          <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Stage</span>
                          <p className="font-display text-[13.5px] font-semibold text-on-surface">
                            {contact.contextData.stage}
                          </p>
                        </div>
                     )}
                   </div>
                 </Section>
               )}

               {/* Persons */}
               <Section label="Contact Persons" count={contact.persons?.length || 0}>
                  <div className="space-y-3">
                     {!(contact.persons && contact.persons.length > 0) ? (
                        <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 italic">No contacts added.</p>
                     ) : (
                        (contact.persons || []).map(p => (
                           <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
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
                   {(contact.persons || []).length < 5 && (
                      <div className="mt-3">
                        {showAddPerson ? (
                          <div className="p-4 rounded-xl bg-surface-container-low border border-black/10 space-y-4">
                            <GlobalInput 
                              label="Name"
                              placeholder="e.g. John Doe" 
                              value={newPersonName} 
                              onChange={e => setNewPersonName(e.target.value)}
                            />
                            <GlobalInput 
                              label="Email Address"
                              type="email" 
                              placeholder="e.g. john@example.com" 
                              value={newPersonEmail} 
                              onChange={e => setNewPersonEmail(e.target.value)}
                            />
                            <div className="flex gap-2 pt-2">
                              <Button variant="primary" size="sm" className="flex-1" onClick={submitAddPerson} disabled={!newPersonName.trim()}>Save Person</Button>
                              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowAddPerson(false)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setShowAddPerson(true)}
                            className="w-full py-2.5 rounded-xl border border-dashed border-black/20 font-label-caps text-[10px] font-bold text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/[0.02] transition-all opacity-70 hover:opacity-100 flex items-center justify-center gap-1.5"
                          >
                            <span className="text-[14px] leading-none">+</span> ADD PERSON
                          </button>
                        )}
                      </div>
                   )}
                </Section>

               {/* Notes Input styled like TaskDrawer */}
               <Section label="Notes" count={(contact.activities || []).filter(a => a.type === 'note' || !a.type).length}>
                 <div className="space-y-6">
                   {/* Display Notes (currently they are all activities) */}
                   {(contact.activities || []).filter(a => a.type === 'note' || !a.type).map(c => (
                     <div key={c.id} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-black/[0.04] border border-black/[0.04] flex items-center justify-center font-bold text-[10px] text-on-surface-variant shrink-0">
                           {c.author.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                             <span className="font-display text-[13px] font-bold">{c.author}</span>
                             <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(c.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.description}</p>
                        </div>
                     </div>
                   ))}

                   {/* Add Note Input */}
                   <div className="pt-4 border-t border-black/[0.04]">
                     <div className="flex gap-4">
                       {user?.image ? (
                         <img src={user.image} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-[10px] text-on-primary shrink-0">
                           {(user?.name || "U").substring(0, 2).toUpperCase()}
                         </div>
                       )}
                       <div className="flex-1 space-y-2">
                         <textarea
                           rows={2}
                           placeholder="Add a note, update, or log activity..."
                           value={newNote}
                           onChange={e => setNewNote(e.target.value)}
                           onKeyDown={e => {
                             if (e.key === "Enter" && !e.shiftKey) {
                               e.preventDefault();
                               submitComment();
                             }
                           }}
                           className="w-full bg-black/[0.02] border border-black/[0.06] rounded-[8px] p-3 font-display text-[13px] outline-none focus:bg-white focus:border-primary/30 transition-all"
                         />
                         <div className="flex items-center justify-end">
                           <Button
                             variant="primary"
                             size="sm"
                             disabled={!newNote.trim()}
                             onClick={submitComment}
                           >
                             POST NOTE
                           </Button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </Section>
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-6 relative pl-4">
              <div className="absolute left-[3px] top-2 bottom-2 w-px bg-black/[0.04]" />
              {[...(contact.activities || [])].reverse().map(a => (
                <div key={a.id} className="relative flex items-start gap-4">
                  <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-black/[0.1] border-2 border-white" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-display text-[12.5px] text-on-surface-variant/80">
                      <span className="font-bold text-on-surface">{a.author}</span> {a.type === 'note' ? 'added a note.' : 'logged an activity.'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="opacity-20" />
                      <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!(contact.activities && contact.activities.length > 0) && (
                <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 italic">No activity recorded.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
