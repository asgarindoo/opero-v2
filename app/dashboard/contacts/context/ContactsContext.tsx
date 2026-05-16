"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Contact, ContactActivity, ContactStatus, RelationshipType } from "../types";

const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Acme Corp",
    initials: "AC",
    industry: "Manufacturing",
    status: "Active",
    relationshipType: "Customer",
    contextData: {
      value: 125000,
      stage: "Closed"
    },
    isArchived: false,
    tags: [],
    persons: [
      { id: "cnt1", name: "Alice Smith", email: "alice@acme.example.com", role: "VP of Operations", isPrimary: true },
      { id: "cnt2", name: "Bob Johnson", email: "bob@acme.example.com", phone: "+1 555-0192", role: "Procurement Manager", isPrimary: false }
    ],
    activities: [
      { id: "act1", type: "meeting", description: "Quarterly business review", timestamp: "2024-05-10T10:00:00Z", author: "You" },
      { id: "act2", type: "email", description: "Sent updated SLAs", timestamp: "2024-05-08T14:30:00Z", author: "Sarah Connor" }
    ],
    assignedStaff: [],
    createdAt: "2023-11-15T08:00:00Z",
    lastContacted: "2024-05-10T10:00:00Z"
  },
  {
    id: "c2",
    name: "Globex Dynamics",
    initials: "GD",
    industry: "Software",
    status: "Onboarding",
    relationshipType: "Partner",
    contextData: {
      value: 45000,
      stage: "Strategic"
    },
    isArchived: false,
    tags: [],
    persons: [
      { id: "cnt3", name: "Charlie Davis", email: "charlie@globex.example.com", role: "CTO", isPrimary: true }
    ],
    activities: [
      { id: "act3", type: "call", description: "Kickoff call and introduction", timestamp: "2024-05-11T09:00:00Z", author: "You" }
    ],
    assignedStaff: [],
    createdAt: "2024-05-01T10:00:00Z",
    lastContacted: "2024-05-11T09:00:00Z"
  },
  {
    id: "c3",
    name: "Stark Industries",
    initials: "SI",
    industry: "Defense & Energy",
    status: "Lead",
    relationshipType: "Investor",
    contextData: {
      value: 850000,
      stage: "Pitched"
    },
    isArchived: false,
    tags: [],
    persons: [
      { id: "cnt4", name: "Pepper Potts", email: "pepper@stark.example.com", role: "CEO", isPrimary: true }
    ],
    activities: [
      { id: "act4", type: "note", description: "Initial outreach via LinkedIn", timestamp: "2024-05-12T08:00:00Z", author: "John Doe" }
    ],
    assignedStaff: [],
    createdAt: "2024-05-12T08:00:00Z",
    lastContacted: "2024-05-12T08:00:00Z"
  },
  {
    id: "c4",
    name: "Apex Logistics",
    initials: "AL",
    industry: "Supply Chain",
    status: "Active",
    relationshipType: "Supplier",
    contextData: {
      value: 50000,
      stage: "Tier 1"
    },
    isArchived: false,
    tags: [],
    persons: [
      { id: "cnt5", name: "Frank Martin", email: "frank@apex.example.com", role: "Logistics Director", isPrimary: true }
    ],
    activities: [
      { id: "act5", type: "email", description: "Negotiated Q3 rates", timestamp: "2024-05-11T11:00:00Z", author: "Sarah Connor" }
    ],
    assignedStaff: [],
    createdAt: "2024-05-11T10:00:00Z",
    lastContacted: "2024-05-11T11:00:00Z"
  }
];

interface ContactsContextType {
  contacts: Contact[];
  addNote: (contactId: string, note: string) => void;
  updateStatus: (contactId: string, status: ContactStatus) => void;
  updateRelationshipType: (contactId: string, type: RelationshipType) => void;
  addContact: (contact: Partial<Contact>) => void;
  deleteContacts: (ids: string[]) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  const addNote = useCallback((contactId: string, note: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const newActivity: ContactActivity = {
        id: Math.random().toString(36).substring(7),
        type: "note",
        description: note,
        timestamp: new Date().toISOString(),
        author: "You"
      };
      return {
        ...c,
        activities: [newActivity, ...c.activities],
        lastContacted: newActivity.timestamp
      };
    }));
  }, []);

  const updateStatus = useCallback((contactId: string, status: ContactStatus) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status } : c));
  }, []);

  const updateRelationshipType = useCallback((contactId: string, type: RelationshipType) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, relationshipType: type } : c));
  }, []);

  const addContact = useCallback((partial: Partial<Contact>) => {
    const newContact: Contact = {
      id: "c" + Date.now(),
      name: partial.name || "New Contact",
      initials: partial.name ? partial.name.substring(0, 2).toUpperCase() : "NC",
      industry: partial.industry || "Unspecified",
      status: partial.status || "Lead",
      relationshipType: partial.relationshipType || "Customer",
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
    setContacts(prev => [newContact, ...prev]);
  }, []);

  const deleteContacts = useCallback((ids: string[]) => {
    setContacts(prev => prev.filter(c => !ids.includes(c.id)));
  }, []);

  const value = useMemo(() => ({
    contacts,
    addNote,
    updateStatus,
    updateRelationshipType,
    addContact,
    deleteContacts
  }), [contacts, addNote, updateStatus, updateRelationshipType, addContact, deleteContacts]);

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
