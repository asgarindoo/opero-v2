"use client";

import React, { useState } from "react";
import { 
  Printer,
  Plus,
  Download
} from "lucide-react";
import { InvoicesProvider, useInvoices } from "@/features/invoices";
import { FinanceProvider } from "@/features/finance/context/FinanceContext";
import { ContactsProvider } from "@/features/contacts/context/ContactsContext";
import { ProductsProvider } from "@/features/products/context/ProductsContext";
import InvoiceTable from "@/features/invoices/components/InvoiceTable";
import InvoiceDrawer from "@/features/invoices/components/InvoiceDrawer";
import AddInvoiceModal from "@/features/invoices/components/AddInvoiceModal";
import ModuleHeader from "@/components/common/ModuleHeader";
import ModuleTabs from "@/components/common/ModuleTabs";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";

type FilterMode = "all" | "unpaid" | "paid" | "overdue" | "cancelled";

function InvoicesPageContent() {
  const { invoices } = useInvoices();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Removed icons for a cleaner look
  const tabs = [
    { id: "all", label: "All Invoices" },
    { id: "unpaid", label: "Unpaid" },
    { id: "paid", label: "Paid" },
    { id: "overdue", label: "Overdue" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className={`flex flex-col h-full overflow-hidden bg-[#fef8f8] ${selectedInvoiceId ? "print:h-auto print:overflow-visible print:bg-white" : ""}`}>
      <div className="print:hidden">
        <ModuleHeader 
        title="Billing & Invoices"
        count={invoices.length}
        rightContent={(
          <>
            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Search by invoice #, customer..." 
              width={220}
            />
            <div className="flex items-center p-1 rounded-[6px] bg-black/[0.04] gap-1 mr-1">
               <button className="p-1 rounded text-on-surface-variant opacity-60 hover:opacity-100 transition-all">
                  <Download size={14} />
               </button>
               <button className="p-1 rounded text-on-surface-variant opacity-60 hover:opacity-100 transition-all">
                  <Printer size={14} />
               </button>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              NEW INVOICE
            </Button>
          </>
        )}
      />
      </div>

      <div className="print:hidden">
        <ModuleTabs 
          tabs={tabs}
          activeTab={filterMode}
          onTabChange={(id) => setFilterMode(id as any)}
          background="bg-[#fbf5f5]" // Applied specific brand tone for filters
        />
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-hidden bg-background">
        <InvoiceTable searchQuery={searchQuery} filterMode={filterMode} onSelectInvoice={setSelectedInvoiceId} />
      </div>

      {/* Drawer & Modal */}
      {selectedInvoiceId && <InvoiceDrawer invoiceId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} />}
      {showAddModal && <AddInvoiceModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <FinanceProvider>
      <ContactsProvider>
        <ProductsProvider>
          <InvoicesProvider>
            <InvoicesPageContent />
          </InvoicesProvider>
        </ProductsProvider>
      </ContactsProvider>
    </FinanceProvider>
  );
}
