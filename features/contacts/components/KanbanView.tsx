import React from "react";
import { useContacts } from "../context/ContactsContext";
import { ContactStatus, RelationshipType } from "@/features/contacts";
import { MoreHorizontal, Briefcase, Mail, Clock, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useState } from "react";

interface Props {
  filterMode: string;
  searchQuery: string;
  onSelectContact: (id: string) => void;
  onAddNew?: () => void;
}

export default function KanbanView({ filterMode, searchQuery, onSelectContact, onAddNew }: Props) {
  const { contacts, deleteContacts } = useContacts();
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "customers") return matchesSearch && (c.relationshipType === "Customer" || c.relationshipType === "Client");
    if (filterMode === "partners") return matchesSearch && (c.relationshipType === "Partner" || c.relationshipType === "Investor");
    if (filterMode === "suppliers") return matchesSearch && (c.relationshipType === "Vendor" || c.relationshipType === "Freelancer");
    
    return matchesSearch;
  });

  const getStatusColor = (status: ContactStatus | string) => {
    switch(status) {
      case "Active": return "bg-emerald-500/10 text-emerald-700";
      case "New": return "bg-blue-500/10 text-blue-700";
      case "Lead": return "bg-blue-500/10 text-blue-700";
      case "Pending": return "bg-amber-500/10 text-amber-700";
      case "Inactive": return "bg-red-500/10 text-red-700";
      case "Archived": return "bg-slate-500/10 text-slate-700";
      default: return "bg-black/[0.04] text-on-surface opacity-70";
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max bg-[#faf8f6]">
      {filteredContacts.map(contact => {
         const primaryPerson = contact.persons.find(p => p.isPrimary) || contact.persons[0];

         return (
           <div 
             key={contact.id}
             onClick={() => onSelectContact(contact.id)}
             className="group relative bg-white rounded-2xl border border-black/[0.04] p-5 cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 flex flex-col"
           >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-black/[0.03] border border-black/[0.04] flex items-center justify-center font-display font-semibold text-[13px] text-on-surface">
                  {contact.initials}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteContactId(contact.id);
                  }}
                  className="p-1.5 rounded-md text-on-surface-variant opacity-40 hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mb-4 flex-1">
                 <h3 className="font-display font-semibold text-[14px] text-on-surface group-hover:text-primary transition-colors line-clamp-1">{contact.name}</h3>
                 <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 line-clamp-1">{contact.industry}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                 <span className={`font-label-caps text-[8px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(contact.status)}`}>
                   {contact.status.toUpperCase()}
                 </span>
                 <span className="font-body-sm text-[11px] text-on-surface opacity-70 px-2 py-0.5 rounded-full bg-black/5">
                   {contact.relationshipType}
                 </span>
              </div>

              <div className="pt-4 border-t border-black/[0.04] mt-auto">
                 {primaryPerson ? (
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center font-display font-medium text-[9px] text-on-surface shrink-0">
                         {primaryPerson.name.charAt(0)}
                       </div>
                       <p className="font-body-sm text-[11px] text-on-surface opacity-80 line-clamp-1">{primaryPerson.name}</p>
                    </div>
                 ) : (
                    <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 italic">No primary contact</p>
                 )}
              </div>
           </div>
         );
      })}

      {onAddNew && (
        <div 
          onClick={onAddNew}
          className="rounded-2xl border border-dashed border-black/10 bg-white hover:bg-black/[0.02] transition-colors cursor-pointer flex flex-col items-center justify-center p-6 text-center min-h-[220px]"
        >
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Briefcase size={16} />
           </div>
           <p className="font-display font-medium text-[13px] text-on-surface">Add New Contact</p>
           <p className="font-body-sm text-[11px] text-on-surface-variant opacity-60 mt-1">Create a new relationship record</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteContactId !== null}
        onClose={() => setDeleteContactId(null)}
        onConfirm={() => {
          if (deleteContactId) {
            deleteContacts([deleteContactId]);
            setDeleteContactId(null);
          }
        }}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
