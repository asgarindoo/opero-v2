"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Contact, ContactActivity, ContactStatus, RelationshipType } from "@/features/contacts";
import { createContact, deleteContact, listContacts, updateContact as saveContact } from "@/features/contacts/services/contacts.client";
import { useTenant } from "@/components/providers/TenantProvider";

interface ContactsContextType {
  contacts: Contact[];
  addNote: (contactId: string, note: string) => void;
  updateStatus: (contactId: string, status: ContactStatus) => void;
  updateRelationshipType: (contactId: string, type: RelationshipType) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  addContact: (contact: Partial<Contact>) => void;
  deleteContacts: (ids: string[]) => void;
  loading: boolean;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTenant();
  const userName = user?.name || "You";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await listContacts<Contact>();
        if (!cancelled) setContacts(items);
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

  const addNote = useCallback((contactId: string, note: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const newActivity: ContactActivity = {
        id: Math.random().toString(36).substring(7),
        type: "note",
        description: note,
        timestamp: new Date().toISOString(),
        author: userName
      };
      const updated = {
        ...c,
        activities: [newActivity, ...(c.activities || [])],
        lastContacted: newActivity.timestamp
      };

      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveContact<Contact>(recordId, updated).catch((err) => {
        console.error("Failed to save contact note:", err);
      });

      return updated;
    }));
  }, []);

  const updateStatus = useCallback((contactId: string, status: ContactStatus) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const updated = { ...c, status };
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveContact<Contact>(recordId, updated).catch((err) => {
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
      saveContact<Contact>(recordId, updated).catch((err) => {
        console.error("Failed to update relationship type:", err);
      });
      return updated;
    }));
  }, []);

  const addContact = useCallback((partial: Partial<Contact>) => {
    const newContact: Contact = {
      id: "c" + Date.now(),
      name: partial.name || "New Contact",
      initials: partial.name ? partial.name.substring(0, 2).toUpperCase() : "NC",
      industry: partial.industry || "Unspecified",
      status: partial.status || "New",
      relationshipType: partial.relationshipType || "Lead",
      contextData: partial.contextData || {},
      isArchived: false,
      tags: [],
      persons: partial.persons || [],
      activities: [],
      assignedStaff: [],
      createdAt: new Date().toISOString(),
      lastContacted: new Date().toISOString(),
      ...partial
    };
    createContact<Contact>(newContact)
      .then((created) => setContacts(prev => [created, ...prev]))
      .catch((err) => console.error("Failed to create contact:", err));
  }, []);

  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const updated = { ...c, ...updates };
      const recordId = (c as { recordId?: string }).recordId ?? c.id;
      saveContact<Contact>(recordId, updated).catch((err) => {
        console.error("Failed to update contact:", err);
      });
      return updated;
    }));
  }, []);

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
    addNote,
    updateStatus,
    updateRelationshipType,
    updateContact,
    addContact,
    deleteContacts,
    loading
  }), [contacts, addNote, updateStatus, updateRelationshipType, updateContact, addContact, deleteContacts, loading]);

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

