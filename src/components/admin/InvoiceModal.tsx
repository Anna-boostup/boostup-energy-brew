import React, { useRef } from "react";
import { Order } from "@/context/InventoryContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SITE_CONTENT } from "@/config/site-content";
import { useContent } from "@/context/ContentContext";

interface InvoiceModalProps {
    order: Order;
    children?: React.ReactNode;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, children }) => {
    const { content } = useContent();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const bank = SITE_CONTENT.bankInfo;

    if (!content) return null;
    const t = content.admin.invoices;
    const lang = content.lang;

    // SPAD (Short Payment Descriptor) string generation
    const generateSpad = () => {
        const vs = order.id.replace(/\D/g, '').slice(-10);
        return `SPD*1.0*ACC:${bank.iban}*AM:${order.total}.00*CC:CZK*VS:${vs}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'cs-CZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4" /> {t.actions.open}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0 border-none bg-zinc-100">
                {/* Fixed Toolbar */}
                <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 p-4 flex justify-between items-center no-print">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                            <Printer className="w-4 h-4" /> {t.actions.print}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" /> {t.actions.save}
                        </Button>
                    </div>
                </div>

                {/* Invoice Body */}
                <div className="p-8 sm:p-12 print:p-0">
                    <div ref={invoiceRef} className="bg-white shadow-2xl mx-auto p-12 sm:p-16 min-h-[1100px] w-full max-w-[800px] print:shadow-none print:p-0">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-16">
                            <div>
                                <h1 className="text-3xl font-bold text-olive-dark">{t.title}</h1>
                                <p className="text-olive/50 mt-1">{t.docNumber}: {order.id}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-xl mb-2">{bank.accountName}</h2>
                                <p className="text-sm text-olive-dark/60">{bank.address.street}</p>
                                <p className="text-sm text-olive-dark/60">{bank.address.city}</p>
                                <p className="text-sm text-olive-dark/60">{t.icLabel}: {bank.address.ic}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <h3 className="font-bold text-olive-dark mb-4 uppercase text-sm tracking-wider">{t.customer}</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="font-black text-lg">{order.firstName} {order.lastName}</p>
                                    <p className="text-olive-dark/70">{order.email}</p>
                                    <p className="text-olive-dark/70">{order.phone}</p>
                                    <div className="mt-4 pt-4 border-t border-zinc-100">
                                        <p className="text-olive-dark/70">{order.street} {order.houseNumber}</p>
                                        <p className="text-olive-dark/70">{order.zip} {order.city}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-zinc-50 p-6 rounded-2xl">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">{t.issueDate}</span>
                                        <span className="font-bold">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">{t.dueDate}</span>
                                        <span className="font-bold">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-zinc-200">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{t.issuer}</p>
                                        <p className="text-xs font-bold leading-relaxed">
                                            {bank.accountName}<br />
                                            {bank.accountNumber}<br />
                                            {bank.iban}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-12">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-olive-dark text-left">
                                        <th className="py-4 font-black uppercase tracking-widest text-[11px]">{t.labels.item}</th>
                                        <th className="py-4 text-center font-black uppercase tracking-widest text-[11px]">{t.labels.qty}</th>
                                        <th className="py-4 text-right font-black uppercase tracking-widest text-[11px]">{t.labels.price}</th>
                                        <th className="py-4 text-right font-black uppercase tracking-widest text-[11px]">{t.labels.total}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {order.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-4 font-bold">{item.name}</td>
                                            <td className="py-4 text-center">{item.quantity}</td>
                                            <td className="py-4 text-right">{item.price} {bank.currency}</td>
                                            <td className="py-4 text-right font-bold">{(item.quantity * item.price)} {bank.currency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-olive-dark">
                                        <td colSpan={3} className="py-6 text-right font-black uppercase tracking-widest text-sm">{t.labels.grandTotal}</td>
                                        <td className="py-6 text-right font-black text-2xl text-olive-dark">{order.total} {bank.currency}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer & QR */}
                        <div className="grid grid-cols-2 gap-12 items-end mt-auto pt-12 border-t border-zinc-100">
                            <div>
                                <h4 className="font-bold mb-2 uppercase text-[11px] tracking-widest text-zinc-400">{t.qr}</h4>
                                <div className="p-3 bg-white border border-zinc-100 rounded-xl inline-block shadow-sm">
                                    <QRCodeSVG value={generateSpad()} size={120} />
                                </div>
                            </div>
                            <div className="text-right text-sm text-zinc-400">
                                <p className="font-bold text-zinc-600 mb-2">{t.footer.thanks}</p>
                                <p>{t.footer.contact.replace('{email}', 'fakturace@drinkboostup.cz')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
