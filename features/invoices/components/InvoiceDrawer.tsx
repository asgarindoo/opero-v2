import React, { useState } from "react";
import { useInvoices } from "../context/InvoicesContext";
import { X, Building2, Clock, Tag, User, CheckCircle2, ChevronRight, MessageSquare, Briefcase, Star, DollarSign, ListTodo, CalendarClock, MoreHorizontal, TrendingUp, Layers, Paperclip, FileText, Download, Printer, Mail, Share2, History, AlertCircle } from "lucide-react";
import { InvoiceStatus, InvoiceActivity } from "@/features/invoices";
import { useContacts } from "@/features/contacts/context/ContactsContext";
import Button from "@/components/ui/Button";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useRef } from "react";

function formatCurrency(val: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
}

export default function InvoiceDrawer({ invoiceId, onClose }: { invoiceId: string, onClose: () => void }) {
  const { invoices, updateInvoice, markAsPaid } = useInvoices();
  const { contacts } = useContacts();
  const inv = invoices.find(i => i.id === invoiceId);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!inv) return null;

  const handleMarkAsPaid = () => {
    markAsPaid(inv.id);
  };

  const handleCancel = () => {
    updateInvoice(inv.id, { status: "Cancelled" });
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownload = async () => {
    if (!invoiceRef.current || isDownloading) return;
    setIsDownloading(true);

    // Wait for React to re-render and remove the bottom section from the DOM
    setTimeout(async () => {
      try {
        const element = invoiceRef.current;
        if (!element) return;

        // Capture the element using html-to-image instead of html2canvas to avoid oklab parsing errors
        const imgData = await toPng(element, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          skipFonts: true, // Bypass cross-origin CSS parsing which causes the SecurityError
          filter: (node) => {
            if (node instanceof HTMLElement && node.dataset.html2canvasIgnore === "true") {
              return false;
            }
            return true;
          }
        });

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
        });

        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => { img.onload = resolve; });

        const pdfWidth = 297; // A4 landscape width in mm
        const pdfHeight = (img.height * pdfWidth) / img.width;

        // Re-initialize pdf with the exact height
        const finalPdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [pdfWidth, pdfHeight] // Dynamic height instead of fixed a4
        });

        finalPdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        finalPdf.save(`${inv.invoiceNumber}.pdf`);
      } catch (error) {
        console.error("Failed to generate PDF:", error);
      } finally {
        setIsDownloading(false);
      }
    }, 150);
  };

  const handleEmail = () => {
    const contactEmail = contacts.find(c => c.name === inv.contactName)?.persons?.[0]?.email || "";
    const subject = encodeURIComponent(`Invoice ${inv.invoiceNumber}`);
    const body = encodeURIComponent(`Hi ${inv.contactName || "Customer"},\n\nPlease find the details for invoice ${inv.invoiceNumber} attached.\n\nTotal Amount: ${formatCurrency(inv.totalAmount, inv.currency)}\nDue Date: ${new Date(inv.dueDate).toLocaleDateString()}\n\nThank you for your business!`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end print:static print:inset-auto print:block">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] animate-fade-in print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-[620px] h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in-right border-l border-black/[0.05] print:shadow-none print:border-none print:w-full print:max-w-none print:h-auto print:animate-none print:block">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 bg-surface-container-lowest z-10 sticky top-0 border-b border-black/[0.02] print:hidden">
          <div className="flex items-center gap-4">
            <div className="px-2 py-1 rounded bg-black/5 font-mono text-[10px] font-bold text-on-surface-variant opacity-60">
              {inv.invoiceNumber}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`p-1.5 rounded-md text-on-surface-variant transition-colors ${isDownloading ? "opacity-50 cursor-not-allowed" : "hover:bg-black/5"}`}
                title="Download PDF"
              >
                <Download size={14} className={isDownloading ? "animate-pulse" : ""} />
              </button>
              <button onClick={handlePrint} className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant transition-colors" title="Print"><Printer size={14} /></button>
              <button onClick={handleEmail} className="p-1.5 rounded-md hover:bg-black/5 text-on-surface-variant transition-colors" title="Send via Email"><Mail size={14} /></button>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-on-surface-variant opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto print:overflow-visible print:px-0 print:py-0 bg-surface-container-lowest">
          {/* We wrap the content in a div to capture it easily with html2canvas */}
          <div ref={invoiceRef} className="px-8 pb-12 pt-6 bg-surface-container-lowest">

            <div className="mb-10 flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-display text-[11px] font-medium px-2 py-0.5 rounded bg-black/5 border border-black/[0.03] ${inv.status === "Paid" ? "text-on-surface opacity-90" : inv.status === "Unpaid" && new Date(inv.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? "text-red-600" : "text-on-surface opacity-60"}`}>
                    {inv.status === "Unpaid" && new Date(inv.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? "Overdue" : inv.status}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant opacity-60">Issue Date: {new Date(inv.issueDate).toLocaleDateString()}</span>
                </div>
                <h3
                  className="font-display font-bold text-[24px] text-on-surface leading-tight mb-1 break-words break-all line-clamp-3"
                  title={inv.contactName}
                >
                  {inv.contactName ?? <span className="opacity-40 text-[18px]">No Contact</span>}
                </h3>
                <p className="font-body-sm text-[12px] text-on-surface-variant opacity-60 flex items-center gap-2">
                  <CalendarClock size={12} /> Due on {new Date(inv.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 relative">
                {inv.status === "Paid" && (
                  <div className="absolute top-2 right-10 px-3 py-1 border-[2px] border-green-600 text-green-600 rounded font-display font-black text-[14px] uppercase tracking-[0.2em] transform rotate-[-5deg] origin-center opacity-60 select-none z-10 mix-blend-multiply pointer-events-none">
                    PAID
                  </div>
                )}
                {inv.status === "Cancelled" && (
                  <div className="absolute top-2 right-10 px-3 py-1 border-[2px] border-red-600 text-red-600 rounded font-display font-black text-[12px] uppercase tracking-[0.2em] transform rotate-[-5deg] origin-center opacity-60 select-none z-10 mix-blend-multiply pointer-events-none whitespace-nowrap">
                    CANCELLED
                  </div>
                )}
                {inv.status === "Unpaid" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      icon={CheckCircle2}
                      onClick={handleMarkAsPaid}
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Itemized Table */}
            <section className="mb-8 overflow-hidden rounded-xl border border-black/[0.03]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/50 border-b border-black/[0.03]">
                  <tr>
                    <th className="px-4 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">Description</th>
                    <th className="px-3 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest text-center">Qty</th>
                    <th className="px-3 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest text-right">Price</th>
                    <th className="px-4 py-2.5 font-label-caps text-[8.5px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.02]">
                  {inv.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-body-sm text-[12px] text-on-surface opacity-80 break-words break-all max-w-[200px]">{item.description}</td>
                      <td className="px-3 py-3 font-body-sm text-[12px] text-on-surface opacity-60 text-center">{item.quantity}</td>
                      <td className="px-3 py-3 font-body-sm text-[12px] text-on-surface opacity-60 text-right break-all max-w-[100px]">{formatCurrency(item.unitPrice, inv.currency)}</td>
                      <td className="px-4 py-3 font-display font-medium text-[12px] text-on-surface opacity-90 text-right break-all max-w-[120px]">{formatCurrency(item.amount, inv.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Financial Summary */}
            <div className="flex justify-end mb-10">
              <div className="w-[240px] space-y-2 min-w-0">
                <div className="flex justify-between items-center px-1 gap-2">
                  <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60 shrink-0">Subtotal</span>
                  <span
                    className="font-body-sm text-[12px] text-on-surface opacity-80 truncate text-right"
                    title={formatCurrency(inv.subtotal, inv.currency)}
                  >
                    {formatCurrency(inv.subtotal, inv.currency)}
                  </span>
                </div>
                {inv.discountTotal > 0 && (
                  <div className="flex justify-between items-center px-1 text-red-500 gap-2">
                    <span className="font-body-sm text-[12px] opacity-60 shrink-0">
                      Discount {inv.discountRate ? `(${inv.discountRate}%)` : ""}
                    </span>
                    <span
                      className="font-body-sm text-[12px] opacity-80 truncate text-right"
                      title={`-${formatCurrency(inv.discountTotal, inv.currency)}`}
                    >
                      -{formatCurrency(inv.discountTotal, inv.currency)}
                    </span>
                  </div>
                )}
                {inv.taxTotal > 0 && (
                  <div className="flex justify-between items-center px-1 gap-2">
                    <span className="font-body-sm text-[12px] text-on-surface-variant opacity-60 shrink-0">
                      Tax {inv.taxRate ? `(${inv.taxRate}%)` : ""}
                    </span>
                    <span
                      className="font-body-sm text-[12px] text-on-surface opacity-80 truncate text-right"
                      title={formatCurrency(inv.taxTotal, inv.currency)}
                    >
                      +{formatCurrency(inv.taxTotal, inv.currency)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-black/5 my-2" />
                <div className="flex justify-between items-center px-1 pt-1 gap-2">
                  <span className="font-display font-bold text-[14px] text-on-surface opacity-90 shrink-0">Total Amount</span>
                  <span
                    className="font-display font-bold text-[18px] text-on-surface truncate text-right"
                    title={formatCurrency(inv.totalAmount, inv.currency)}
                  >
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </span>
                </div>
              </div>
            </div>

            {!isDownloading && (
              <div className="print:hidden" data-html2canvas-ignore="true">
                <div className="w-full h-px bg-black/5 mb-8" />

                {/* Notes & Activity */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <section>
                    <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-3">Invoice Notes</h4>
                    <div className="p-3 rounded-lg bg-surface-container-low/30 border border-black/[0.02] font-body-sm text-[11.5px] text-on-surface-variant opacity-70 leading-relaxed break-words break-all whitespace-pre-wrap">
                      {inv.notes || "No special instructions."}
                    </div>
                  </section>
                  <section>
                    <h4 className="font-label-caps text-[9px] text-on-surface-variant opacity-60 uppercase tracking-wider mb-3">Billing Timeline</h4>
                    <div className="space-y-4">
                      {inv.activities.map(activity => {
                        const Icon = activity.type === "payment" ? CheckCircle2 : activity.type === "reminder" ? AlertCircle : History;
                        return (
                          <div key={activity.id} className="flex gap-2.5">
                            <div className="mt-0.5 opacity-60"><Icon size={11} /></div>
                            <div>
                              <div className="flex justify-between items-center gap-4 mb-0.5">
                                <p className="font-display font-medium text-[11px] text-on-surface opacity-90 leading-none">{activity.description}</p>
                                <span className="font-body-sm text-[9px] text-on-surface-variant opacity-60 shrink-0">{new Date(activity.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="font-body-sm text-[10px] text-on-surface-variant opacity-60">by {activity.author}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
