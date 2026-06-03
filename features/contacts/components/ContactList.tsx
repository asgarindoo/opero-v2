"use client";

import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { ContactStatus } from "@/features/contacts";
import { 
  ChevronRight,
  Search,
  Building2,
  Trash2
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ListFooter from "@/components/common/ListFooter";
import SelectionBar from "@/components/common/SelectionBar";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { EmptyState } from "@/components/common/DataState";

interface Props {
  filterMode: string;
  searchQuery: string;
  onSelectContact: (id: string) => void;
  canDelete: boolean;
}

export default function ContactList({ filterMode, searchQuery, onSelectContact, canDelete }: Props) {
  const { contacts, deleteContacts, loading } = useContacts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch;
    if (filterMode === "customers") return matchesSearch && (c.relationshipType === "Customer" || c.relationshipType === "Client");
    if (filterMode === "partners") return matchesSearch && (c.relationshipType === "Partner" || c.relationshipType === "Investor");
    if (filterMode === "suppliers") return matchesSearch && (c.relationshipType === "Vendor" || c.relationshipType === "Freelancer");
    
    return matchesSearch;
  });



  const getStatusVariant = (status: ContactStatus | string): any => {
    switch (status) {
      case "Active": return "success";
      case "New": return "info";
      case "Lead": return "info";
      case "Pending": return "warning";
      case "Inactive": return "error";
      case "Archived": return "slate";
      default: return "neutral";
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!canDelete) return;
    setContactToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!canDelete) return;
    if (contactToDelete) {
      deleteContacts([contactToDelete]);
      setContactToDelete(null);
    } else {
      deleteContacts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (!loading && filteredContacts.length === 0) {
     return (
       <EmptyState
         icon="contacts"
         title="No contacts found"
         description="Add a contact to get started with your customer relationships."
       />
     );
  }

  return (
    <div className="flex flex-col h-full bg-background relative min-w-0">
      <div className="flex-1 overflow-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-[#fbf5f5]">
            <TableRow className="h-10">
              {canDelete && (
              <TableHead className="w-10 px-4">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size > 0 && selectedIds.size === filteredContacts.length}
                    onChange={toggleAll}
                    className="w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              )}
              <TableHead className="w-[35%] px-4">Contact / Company</TableHead>
              <TableHead className="w-[25%] px-4">Primary Contact</TableHead>
              <TableHead className="w-[15%] px-4">Relationship</TableHead>
              <TableHead className="w-[15%] px-4">Status</TableHead>
              <TableHead className="w-[10%] px-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-12 hover:bg-black/[0.015] transition-colors">
                  <TableCell className="px-4">
                    <div className="w-3 h-3 rounded-[3px] bg-black/[0.04] animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3.5 w-32 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2 w-20 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3 w-24 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-2.5 w-32 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="h-3 w-16 bg-black/[0.04] rounded animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="h-4.5 w-12 bg-black/[0.04] rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell className="px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 bg-black/[0.04] rounded animate-pulse" />
                      <div className="h-4 w-4 bg-black/[0.04] rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredContacts.map((contact) => {
                const primaryPerson = (contact.persons || []).find(p => p.isPrimary) || (contact.persons || [])[0];
                const isSelected = selectedIds.has(contact.id);
                
                return (
                  <TableRow 
                    key={contact.id}
                    onClick={() => onSelectContact(contact.id)}
                    className={`group h-12 hover:bg-black/[0.015] cursor-pointer transition-colors ${isSelected ? "bg-primary/[0.02]" : ""}`}
                  >
                    {canDelete && (
                    <TableCell className="px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => toggleOne(contact.id, e as any)}
                          className={`w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                        />
                      </div>
                    </TableCell>
                    )}
                    <TableCell className="px-4 whitespace-nowrap">
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span 
                          className="font-display font-semibold text-[12px] text-on-surface opacity-90 group-hover:text-primary transition-colors leading-tight truncate block max-w-[100px] md:max-w-[150px] lg:max-w-[200px] xl:max-w-[280px]"
                          title={contact.name}
                        >
                          {contact.name}
                        </span>
                        <p className="font-body-sm text-[7px] text-on-surface-variant opacity-60 truncate uppercase font-bold tracking-[0.2em] leading-none mt-1">
                          {contact.industry}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      {primaryPerson ? (
                        <div className="flex flex-col min-w-0 gap-0.5">
                          <span className="font-display font-medium text-[11px] text-on-surface truncate block max-w-[150px]">
                            {primaryPerson.name}
                          </span>
                          {primaryPerson.email && (
                            <span className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate block max-w-[150px]">
                              {primaryPerson.email}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-body-sm text-[10px] text-on-surface-variant opacity-40 italic">No contacts</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60 font-display">
                        <Building2 size={10} className="opacity-60" />
                        <span className="font-display text-[11px]">{contact.relationshipType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(contact.status)} className="text-[10px] py-0 px-1.5 h-4.5">
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all">
                        {canDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6.5 w-6.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => handleDeleteOne(e, contact.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        )}
                        <ChevronRight size={13} className="text-on-surface-variant ml-0.5" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>



      {canDelete && (
        <SelectionBar 
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDelete={() => setIsDeleteModalOpen(true)}
          label="contacts"
        />
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setContactToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={contactToDelete ? "Delete contact?" : "Delete selected contacts?"}
        description={contactToDelete ? "This action permanently removes the contact and all associated communication history." : `This action permanently removes ${selectedIds.size} contacts. This action cannot be undone.`}
        confirmLabel={contactToDelete ? "Delete Contact" : "Delete Contacts"}
      />
    </div>
  );
}
