"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Contact, ContactStatus, RelationshipType } from "@/features/contacts";
import { createContact, deleteContact, listContacts, updateContact as saveContact } from "@/features/contacts/services/contacts.client";
import { getUserInitials } from "@/lib/user-identity";

interface ContactsContextType {
  contacts: Contact[];
  updateStatus: (contactId: string, status: ContactStatus) => void;
  updateRelationshipType: (contactId: string, type: RelationshipType) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  addContact: (contact: Partial<Contact>) => void;
  deleteContacts: (ids: string[]) => void;
  loading: boolean;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

function contactPatchForApi(updates: Partial<Contact>): Partial<Contact> {
  const patch: Partial<Contact> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.industry !== undefined) patch.industry = updates.industry;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.relationshipType !== undefined) patch.relationshipType = updates.relationshipType;
  if (updates.persons !== undefined) patch.persons = updates.persons;
  if (updates.comments !== undefined) patch.comments = updates.comments;
  return patch;
}

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeContact = useCallback((contact: Contact): Contact => ({
    ...contact,
    relationshipType: contact.relationshipType || "Lead",
    status: contact.status || "New",
    industry: contact.industry || "Unspecified",
    contextData: contact.contextData && typeof contact.contextData === "object" && !Array.isArray(contact.contextData) ? contact.contextData : {},
    persons: Array.isArray(contact.persons) ? contact.persons : [],
    comments: Array.isArray(contact.comments) ? contact.comments : [],
    isArchived: Boolean(contact.isArchived),
    createdAt: contact.createdAt || new Date().toISOString(),
    lastContacted: contact.lastContacted || contact.createdAt || new Date().toISOString(),
  }), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await listContacts<Contact>();
        if (!cancelled) setContacts(items.map(normalizeContact));
      } catch (err) {
        console.error("Failed to load contacts:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = useCallback((contactId: string, status: ContactStatus) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const updated = { ...c, status };
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveContact<Contact>(recordId, contactPatchForApi(updated)).catch((err) => {
        console.error("Failed to update contact status:", err);
      });
      return updated;
    }));
  }, []);

  const updateRelationshipType = useCallback((contactId: string, type: RelationshipType) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const updated = { ...c, relationshipType: type };
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveContact<Contact>(recordId, contactPatchForApi(updated)).catch((err) => {
        console.error("Failed to update relationship type:", err);
      });
      return updated;
    }));
  }, []);

  const addContact = useCallback((partial: Partial<Contact>) => {
    const newContact: Contact = {
      id: "c" + Date.now(),
      name: partial.name || "New Contact",
      initials: getUserInitials({ name: partial.name }, "NC"),
      industry: partial.industry || "Unspecified",
      status: partial.status || "New",
      relationshipType: partial.relationshipType || "Lead",
      contextData: partial.contextData || {},
      isArchived: false,
      persons: partial.persons || [],
      comments: [],
      createdAt: new Date().toISOString(),
      lastContacted: new Date().toISOString(),
      ...partial
    };
    createContact<Contact>(newContact)
      .then((created) => setContacts(prev => [normalizeContact(created), ...prev]))
      .catch((err) => console.error("Failed to create contact:", err));
  }, []);

  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const updated = normalizeContact({ ...c, ...updates });
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveContact<Contact>(recordId, contactPatchForApi(updates)).catch((err) => {
        console.error("Failed to update contact:", err);
      });
      return updated;
    }));
  }, [normalizeContact]);

  const deleteContacts = useCallback((ids: string[]) => {
    setContacts(prev => prev.filter(c => !ids.includes(c.id)));
    Promise.all(
      ids.map((id) => {
        const recordId = contacts.find(c => c.id === id) as { recordId?: string } | undefined;
        const targetId = recordId?.recordId ?? id;
        return deleteContact(targetId).catch((err) => {
          console.error("Failed to delete contact:", err);
        });
      })
    ).catch(() => undefined);
  }, [contacts]);

  const value = useMemo(() => ({
    contacts,
    updateStatus,
    updateRelationshipType,
    updateContact,
    addContact,
    deleteContacts,
    loading
  }), [contacts, updateStatus, updateRelationshipType, updateContact, addContact, deleteContacts, loading]);

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
}

