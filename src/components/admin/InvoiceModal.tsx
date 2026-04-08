
import React, { useRef } from "react";
import { Order } from "@/context/InventoryContext";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SITE_CONTENT } from "@/config/site-content";

interface InvoiceModalProps {
    order: Order;
    children?: React.ReactNode;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, children }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const bank = SITE_CONTENT.bankInfo;

    // SPAD (Short Payment Descriptor) string generation
    // Format: SPD:1.0*ACC:IBAN*AM:AMOUNT*CC:CURRENCY*MSG:MESSAGE
    const generateSpad = () => {
        const vs = order.id.replace(/\D/g, '').slice(-10);
        return `SPD*1.0*ACC:${bank.iban}*AM:${order.total}.00*CC:CZK*VS:${vs}`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4" /> Faktura
                    </Button>
                )}
            </DialogTrigger>
            {/* Increased width and max-width for better print preview */}
            <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-y-auto [&>button]:hidden">

                {/* Custom Sticky Header Toolbar */}
                <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 shadow-sm no-print">
                    <div className="flex items-center gap-4">
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Zavřít fakturu">
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold">Faktura #{order.id.slice(0, 8)}</span>
                            <p className="text-xs text-foreground/70">{order.customer.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 gap-2">
                            <Download className="w-4 h-4" /> Uložit do PDF
                        </Button>
                        <Button onClick={handlePrint} variant="default" size="sm" className="h-9 gap-2">
                            <Printer className="w-4 h-4" /> Tisk
                        </Button>
                    </div>
                </div>

                <div className="p-6 md:p-12 bg-background">
                    <div ref={invoiceRef} className="bg-white p-8 md:p-12 text-black shadow-lg rounded-sm mx-auto max-w-[800px] min-h-[1100px]" id="invoice-print">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-12 border-b pb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-olive-dark">FAKTURA</h1>
                                <p className="text-olive/50 mt-1">Číslo dokladu: {order.id}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-xl mb-2">{bank.accountName}</h2>
                                <p className="text-sm text-olive-dark/60">Technologická 123</p>
                                <p className="text-sm text-olive-dark/60">616 00 Brno</p>
                                <p className="text-sm text-olive-dark/60">IČ: 12345678</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                            <div>
                                <h3 className="font-bold text-olive-dark mb-4 uppercase text-sm tracking-wider">Odběratel</h3>
                                <div className="text-olive">
                                    <p className="font-bold">{order.customer.name}</p>
                                    <p>{order.customer.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="mb-4">
                                    <span className="text-olive/50 text-sm block">Datum vystavení</span>
                                    <span className="font-bold">{new Date(order.date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-olive/50 text-sm block">Datum splatnosti</span>
                                    <span className="font-bold">{new Date(new Date(order.date).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full mb-12">
                            <thead>
                                <tr className="border-b-2 border-background">
                                    <th className="text-left py-3 text-sm font-bold text-olive-dark/60">Položka</th>
                                    <th className="text-center py-3 text-sm font-bold text-olive-dark/60">Množství</th>
                                    <th className="text-right py-3 text-sm font-bold text-olive-dark/60">Cena/ks</th>
                                    <th className="text-right py-3 text-sm font-bold text-olive-dark/60">Celkem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-background">
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-4 text-olive-dark">
                                            <div className="font-medium">
                                                {item.mixConfiguration
                                                    ? item.name.replace('(MIX)', `(MIX-${(item.mixConfiguration.lemon || 0) + (item.mixConfiguration.red || 0) + (item.mixConfiguration.silky || 0)})`)
                                                    : item.name
                                                }
                                            </div>
                                            {item.mixConfiguration && (
                                                <div className="text-xs text-olive/50 mt-1">
                                                    — {[
                                                        item.mixConfiguration.lemon && `Lemon: ${item.mixConfiguration.lemon} ks`,
                                                        item.mixConfiguration.red && `Red: ${item.mixConfiguration.red} ks`,
                                                        item.mixConfiguration.silky && `Silky: ${item.mixConfiguration.silky} ks`
                                                    ].filter(Boolean).join(', ')}
                                                    {` (${(item.mixConfiguration.lemon || 0) + (item.mixConfiguration.red || 0) + (item.mixConfiguration.silky || 0)} ks celkem)`}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-olive-dark/60">{item.quantity}</td>
                                        <td className="py-4 text-right text-olive-dark/60">{item.price} Kč</td>
                                        <td className="py-4 text-right font-bold text-olive-dark">{item.price * item.quantity} Kč</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-olive-dark">
                                    <td colSpan={3} className="pt-4 text-right font-bold text-lg">CELKEM K ÚHRADĚ:</td>
                                    <td className="pt-4 text-right font-bold text-lg">{order.total} Kč</td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Settings & QR Payment */}
                        <div className="flex justify-between items-end border-t pt-8">
                            <div className="text-sm text-olive/50 max-w-xs">
                                <p>Děkujeme za vaši objednávku.</p>
                                <p className="mt-1">V případě dotazů nás kontaktujte na fakturace@drinkboostup.cz</p>
                            </div>
                            <div className="text-center">
                                <div className="border p-2 inline-block rounded-lg mb-2 bg-white">
                                    <QRCodeSVG value={generateSpad()} size={120} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wider text-olive/40">QR Platba</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
