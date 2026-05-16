"use client";

import React, { useState } from "react";
import { useContacts } from "../context/ContactsContext";
import { ContactStatus } from "../types";
import { 
  ChevronRight,
  Search,
  Building2,
  Trash2
} from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ListFooter from "../../components/shared/ListFooter";
import SelectionBar from "../../components/shared/SelectionBar";
import ConfirmationModal from "../../components/shared/ConfirmationModal";

interface Props {
  filterMode: string;
  searchQuery: string;
  onSelectContact: (id: string) => void;
}

export default function ContactList({ filterMode, searchQuery, onSelectContact }: Props) {
  const { contacts, deleteContacts } = useContacts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const itemsPerPage = 25;

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterMode === "all") return matchesSearch && !c.isArchived;
    if (filterMode === "customers") return matchesSearch && c.relationshipType === "Customer" && !c.isArchived;
    if (filterMode === "partners") return matchesSearch && (c.relationshipType === "Partner" || c.relationshipType === "Investor") && !c.isArchived;
    if (filterMode === "suppliers") return matchesSearch && (c.relationshipType === "Supplier" || c.relationshipType === "Vendor") && !c.isArchived;
    
    return matchesSearch && !c.isArchived;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  const getStatusVariant = (status: ContactStatus): any => {
    switch (status) {
      case "Active": return "success";
      case "Lead": return "neutral";
      case "Onboarding": return "info";
      case "Churned": return "error";
      default: return "neutral";
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedContacts.map(c => c.id)));
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
    setContactToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      deleteContacts([contactToDelete]);
      setContactToDelete(null);
    } else {
      deleteContacts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
    setIsDeleteModalOpen(false);
  };

  if (filteredContacts.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-60">
         <Search size={40} strokeWidth={1} className="mb-4" />
         <p className="font-display text-[13px] tracking-wide uppercase">No contacts found</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#fbf5f5]">
            <TableRow className="h-10">
              <TableHead className="w-10 px-4">
                <div className="flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size > 0 && selectedIds.size === paginatedContacts.length}
                    onChange={toggleAll}
                    className="w-3 h-3 rounded-[3px] border-black/10 accent-primary cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </TableHead>
              <TableHead className="px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Contact / Company</TableHead>
              <TableHead className="px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Relationship</TableHead>
              <TableHead className="px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Status</TableHead>
              <TableHead className="px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Primary Contact</TableHead>
              <TableHead className="px-4 text-left font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Last Activity</TableHead>
              <TableHead className="px-4 text-right font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContacts.map((contact) => {
              const primaryPerson = contact.persons.find(p => p.isPrimary) || contact.persons[0];
              const isSelected = selectedIds.has(contact.id);
              
              return (
                <TableRow 
                  key={contact.id}
                  onClick={() => onSelectContact(contact.id)}
                  className={`group h-12 hover:bg-black/[0.015] cursor-pointer transition-colors ${isSelected ? "bg-primary/[0.02]" : ""}`}
                >
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
                  <TableCell className="px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6.5 h-6.5 rounded-md bg-black/5 flex items-center justify-center font-display font-semibold text-[9px] text-on-surface shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {contact.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-[12px] text-on-surface truncate group-hover:text-primary transition-colors opacity-90 leading-tight">
                          {contact.name}
                        </p>
                        <p className="font-body-sm text-[7px] text-on-surface-variant opacity-60 truncate uppercase font-bold tracking-[0.2em] leading-none mt-1">
                          {contact.industry}
                        </p>
                      </div>
                    </div>
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
                  <TableCell className="px-4 whitespace-nowrap">
                    {primaryPerson ? (
                      <div className="min-w-0">
                        <p className="font-display text-[11px] font-medium text-on-surface opacity-90 truncate">{primaryPerson.name}</p>
                        <p className="font-body-sm text-[9px] text-on-surface-variant opacity-60 truncate leading-none mt-0.5 font-display tracking-tight">{primaryPerson.email}</p>
                      </div>
                    ) : (
                      <span className="font-body-sm text-[10px] text-on-surface-variant opacity-60 italic">— Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap">
                    <span className="font-display text-[11px] text-on-surface-variant opacity-60 font-display">
                      {new Date(contact.lastContacted).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6.5 w-6.5 text-on-surface-variant opacity-60 hover:text-red-500 hover:opacity-100 hover:bg-red-50"
                        onClick={(e) => handleDeleteOne(e, contact.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                      <ChevronRight size={13} className="text-on-surface-variant opacity-60 ml-0.5" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ListFooter 
        totalItems={filteredContacts.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        label="contacts"
      />

      <SelectionBar 
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => setIsDeleteModalOpen(true)}
        label="contacts"
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setContactToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={contactToDelete ? "Delete Contact" : "Delete Selected Contacts"}
        description={contactToDelete ? "Are you sure you want to delete this contact? All communication history and associated data will be permanently removed." : `Are you sure you want to delete ${selectedIds.size} selected contacts? This action cannot be undone.`}
      />
    </div>
  );
}
