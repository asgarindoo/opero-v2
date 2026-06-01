import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { X, Building2, Briefcase, Mail, Phone, Activity as ActivityIcon, Edit3, MessageSquare, DollarSign, Target, User, Trash2, Clock } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useTenant } from "@/components/providers/TenantProvider";
import { ContactStatus, Contact } from "@/features/contacts";
import { GlobalInput } from "@/components/ui/global/form/GlobalInput";
import Dropdown from "@/components/ui/Dropdown";
import ReactionsBar, { toggleReaction } from "@/features/tasks/components/ReactionsBar";
import UserAvatar from "@/components/common/UserAvatar";
import { getUserDisplayName, getUserInitials } from "@/lib/user-identity";
import ConfirmationModal from "@/components/common/ConfirmationModal";

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
  const { contacts, addNote, updateContact, deleteContacts } = useContacts();
  const contact = contacts.find(c => c.id === contactId);
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [newNote, setNewNote] = useState("");

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("");
  const [personToRemove, setPersonToRemove] = useState<{id: string, name: string} | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  if (!contact) return null;
  const contextData = contact.contextData && typeof contact.contextData === "object" && !Array.isArray(contact.contextData) ? contact.contextData : {};

  const handleUpdate = (patch: Partial<Contact>, description?: string) => {
    if (description) {
      const newActivity = {
        id: `a${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: "system" as const,
        description,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        author: getUserDisplayName(user, "System"),
        email: user?.email ?? undefined,
        avatar: user?.image ?? null,
        initials: getUserInitials(user)
      };
      patch.activities = [newActivity, ...(contact.activities || [])];
      patch.lastContacted = newActivity.timestamp;
    }
    updateContact(contact.id, patch);
  };

  const submitComment = () => {
    if (!newNote.trim()) return;
    const author = getUserDisplayName(user, "Current User");
    const newActivity = {
      id: "a" + Date.now(),
      type: "note" as const,
      description: newNote.trim(),
      timestamp: new Date().toISOString(),
      userId: user?.id,
      author,
      email: user?.email ?? undefined,
      avatar: user?.image,
      initials: getUserInitials(user),
    };

    updateContact(contact.id, {
      activities: [newActivity, ...(contact.activities || [])],
      lastContacted: newActivity.timestamp
    });
    setNewNote("");
  };

  const handleNoteReaction = (activityId: string, emoji: string) => {
    const activities = contact.activities?.map(a => {
      if (a.id !== activityId) return a;
      return { ...a, reactions: toggleReaction(a.reactions ?? {}, emoji) };
    });
    updateContact(contact.id, { activities });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submitAddPerson = () => {
    if (!newPersonName.trim() || !validateEmail(newPersonEmail.trim())) return;
    const newPerson = {
      id: "p" + Date.now(),
      name: newPersonName.trim(),
      email: newPersonEmail.trim(),
      role: newPersonRole.trim() || "Contact Person",
      isPrimary: false
    };
    handleUpdate({
      persons: [...(contact.persons || []), newPerson]
    }, `added contact person: ${newPerson.name}`);
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
              {/* Properties */}
              <Section label="Properties">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Status</span>
                    <Dropdown
                      value={contact.status}
                      options={[
                        { value: "New", label: "New" },
                        { value: "Active", label: "Active" },
                        { value: "Pending", label: "Pending" },
                        { value: "Inactive", label: "Inactive" },
                        { value: "Archived", label: "Archived" }
                      ]}
                      onChange={(v) => handleUpdate({ status: v as ContactStatus }, `changed status to ${v}`)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-label-caps text-[9px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Relationship</span>
                    <Dropdown
                      value={contact.relationshipType}
                      options={[
                        { value: "Lead", label: "Lead" },
                        { value: "Customer", label: "Customer" },
                        { value: "Client", label: "Client" },
                        { value: "Vendor", label: "Vendor" },
                        { value: "Partner", label: "Partner" },
                        { value: "Freelancer", label: "Freelancer" },
                        { value: "Investor", label: "Investor" },
                        { value: "Internal", label: "Internal" },
                        { value: "Other", label: "Other" },
                      ]}
                      onChange={(v) => handleUpdate({ relationshipType: v as any }, `changed relationship to ${v}`)}
                    />
                  </div>
                </div>
              </Section>

              {/* Context Data */}
              {isFinancialType && Object.keys(contextData).length > 0 && (
                <Section label="Overview">
                  <div className="flex flex-col gap-3">
                    {contextData.value !== undefined && (
                      <div className="space-y-1">
                        <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Deal Value</span>
                        <p className="font-display text-[13.5px] font-semibold text-on-surface">
                          {contextData.currency || "USD"} {new Intl.NumberFormat("en-US", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(contextData.value)}
                        </p>
                      </div>
                    )}
                    {contextData.stage !== undefined && (
                      <div className="space-y-1">
                        <span className="font-label-caps text-[8px] font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">Stage</span>
                        <p className="font-display text-[13.5px] font-semibold text-on-surface">
                          {contextData.stage}
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
                      <div key={p.id} className="relative flex flex-col p-3 rounded-xl bg-black/[0.02] border border-black/[0.04] group">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-display font-medium text-[13px] text-on-surface truncate">{p.name}</p>
                              {p.isPrimary && <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">PRIMARY</span>}
                            </div>
                            <p className="font-body-sm text-[11px] text-on-surface-variant opacity-70 truncate">{p.role || "No role"}</p>
                          </div>
                          <button
                            onClick={() => setPersonToRemove(p)}
                            className="p-1.5 text-red-200 rounded-md transition-all ml-2"
                            title="Remove person"
                          >
                            <Trash2 size={13} strokeWidth={2} />
                          </button>
                        </div>
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
                    ))
                  )}
                </div>
                {(contact.persons || []).length < 5 && (
                  <div className="mt-3">
                    {showAddPerson ? (
                      <div className="pt-2 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <GlobalInput
                              autoFocus
                              maxLength={40}
                              placeholder="Person Name"
                              value={newPersonName}
                              onChange={e => setNewPersonName(e.target.value)}
                            />
                          </div>
                          <div className="flex-1">
                            <GlobalInput
                              type="email"
                              placeholder="Email Address"
                              value={newPersonEmail}
                              onChange={e => setNewPersonEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="primary" size="sm" onClick={submitAddPerson} disabled={!newPersonName.trim() || !validateEmail(newPersonEmail.trim())}>Add</Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowAddPerson(false)}>Cancel</Button>
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
                      <UserAvatar
                        user={c.userId === user?.id ? user : { name: c.author, email: c.email, image: c.avatar, initials: c.initials }}
                        size="lg"
                      />
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-[13px] font-bold">
                              {c.userId === user?.id ? getUserDisplayName(user, c.author) : getUserDisplayName({ name: c.author, email: c.email }, "User")}
                            </span>
                            <span className="text-[10px] text-on-surface-variant opacity-30">{new Date(c.timestamp).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => setNoteToDelete(c.id)}
                            className="text-red-500 opacity-20 hover:opacity-100 hover:bg-red-50 p-1 rounded transition-all"
                            title="Delete note"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="font-display text-[13px] text-on-surface-variant/80 leading-relaxed break-words break-all whitespace-pre-wrap">{c.description}</p>
                        <ReactionsBar reactions={c.reactions ?? {}} onToggle={e => handleNoteReaction(c.id, e)} />
                      </div>
                    </div>
                  ))}

                  {/* Add Note Input */}
                  <div className="pt-4 border-t border-black/[0.04]">
                    <div className="flex gap-4">
                      <UserAvatar user={user} size="lg" className="bg-primary text-on-primary" />
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
                      <span className="font-bold text-on-surface">
                        {a.userId === user?.id ? getUserDisplayName(user, a.author) : getUserDisplayName({ name: a.author, email: a.email }, "System")}
                      </span>
                      {' '}
                      {a.type === 'note' ? (
                        <>
                          added a note:{" "}
                          <span className="whitespace-pre-wrap font-normal opacity-90 text-on-surface">
                            "{a.description}"
                          </span>
                        </>
                      ) : (
                        <>{a.description}</>
                      )}
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
      
      <ConfirmationModal
        isOpen={!!personToRemove}
        onClose={() => setPersonToRemove(null)}
        onConfirm={() => {
          if (personToRemove) {
            handleUpdate(
              { persons: contact.persons?.filter(person => person.id !== personToRemove.id) },
              `removed contact person ${personToRemove.name}`
            );
            setPersonToRemove(null);
          }
        }}
        title="Remove person?"
        description={`This action removes ${personToRemove?.name} from this contact. This action cannot be undone.`}
        confirmLabel="Remove Person"
      />
      
      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            updateContact(contact.id, { activities: (contact.activities || []).filter(a => a.id !== noteToDelete) });
            setNoteToDelete(null);
          }
        }}
        title="Delete note?"
        description="This action permanently removes this note. This action cannot be undone."
        confirmLabel="Delete Note"
      />
    </Drawer>
  );
}
