
import React, { useRef } from "react";
import { Order } from "@/context/InventoryContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface InvoiceModalProps {
    order: Order;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    // SPAD (Short Payment Descriptor) string generation
    // Format: SPD:1.0*ACC:IBAN*AM:AMOUNT*CC:CURRENCY*MSG:MESSAGE
    const iban = "CZ0000000000000000000000"; // Placeholder IBAN
    const generateSpad = () => {
        return `SPD:1.0*ACC:${iban}*AM:${order.total}.00*CC:CZK*MSG:OBJ-${order.id}`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" /> Faktura
                </Button>
            </DialogTrigger>
            {/* Increased width and max-width for better print preview */}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full sm:max-w-[800px]">

                {/* Sticky Toolbar */}
                <div className="flex justify-end gap-2 mb-4 no-print sticky top-0 bg-white/95 p-4 border-b backdrop-blur-sm z-50 shadow-sm -mx-6 -mt-6 px-6">
                    <Button onClick={handlePrint} variant="default">
                        <Download className="w-4 h-4 mr-2" /> Uložit do PDF
                    </Button>
                    <Button onClick={handlePrint} variant="secondary">
                        <Printer className="w-4 h-4 mr-2" /> Tisk
                    </Button>
                </div>

                <div ref={invoiceRef} className="bg-white p-2 text-black print:p-0" id="invoice-print">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12 border-b pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">FAKTURA</h1>
                            <p className="text-slate-500 mt-1">Číslo dokladu: {order.id}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-xl mb-2">BoostUp s.r.o.</h2>
                            <p className="text-sm text-slate-600">Technologická 123</p>
                            <p className="text-sm text-slate-600">616 00 Brno</p>
                            <p className="text-sm text-slate-600">IČ: 12345678</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 uppercase text-sm tracking-wider">Odběratel</h3>
                            <div className="text-slate-700">
                                <p className="font-bold">{order.customer.name}</p>
                                <p>{order.customer.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <span className="text-slate-500 text-sm block">Datum vystavení</span>
                                <span className="font-bold">{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 text-sm block">Datum splatnosti</span>
                                <span className="font-bold">{new Date(new Date(order.date).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="text-left py-3 text-sm font-bold text-slate-600">Položka</th>
                                <th className="text-center py-3 text-sm font-bold text-slate-600">Množství</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-600">Cena/ks</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-600">Celkem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-slate-800">{item.name}</td>
                                    <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-slate-600">{item.price} Kč</td>
                                    <td className="py-4 text-right font-bold text-slate-800">{item.price * item.quantity} Kč</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-900">
                                <td colSpan={3} className="pt-4 text-right font-bold text-lg">CELKEM K ÚHRADĚ:</td>
                                <td className="pt-4 text-right font-bold text-lg">{order.total} Kč</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Settings & QR Payment */}
                    <div className="flex justify-between items-end border-t pt-8">
                        <div className="text-sm text-slate-500 max-w-xs">
                            <p>Děkujeme za vaši objednávku.</p>
                            <p className="mt-1">V případě dotazů nás kontaktujte na info@boostup.cz</p>
                        </div>
                        <div className="text-center">
                            <div className="border p-2 inline-block rounded-lg mb-2 bg-white">
                                <QRCodeSVG value={generateSpad()} size={120} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">QR Platba</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
