import { DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, FileText, X, Package, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import InvoiceModal from "@/components/admin/InvoiceModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { useInventory } from "@/context/InventoryContext";

export const OrderDetailDialog = ({ order }: { order: any }) => {
    const { toast } = useToast();
    const { updateOrderPacketaInfo } = useInventory();
    const [isCreatingPacket, setIsCreatingPacket] = useState(false);

    // Helper to safely format currency if formatPrice isn't available or fails
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('cs-CZ') + ' Kč';
    };

    const handleCreatePacketaPacket = async () => {
        setIsCreatingPacket(true);
        try {
            const packetaRes = await fetch('/api/create-packeta-packet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber: order.id,
                    firstName: order.delivery_info?.firstName || order.customer?.name?.split(' ')[0],
                    lastName: order.delivery_info?.lastName || order.customer?.name?.split(' ').slice(1).join(' '),
                    email: order.customer?.email || order.customer_email,
                    phone: order.delivery_info?.phone,
                    packetaPointId: order.delivery_info?.packetaPointId,
                    total: order.total
                })
            });

            const packetaData = await packetaRes.json();
            if (packetaRes.ok && packetaData.barcode && packetaData.packetId) {
                // Update the order in the database and local context immediately
                await updateOrderPacketaInfo(order.id, packetaData.barcode, packetaData.packetId);

                toast({
                    title: "Zásilka vytvořena",
                    description: `Kód zásilky: ${packetaData.barcode}. Tlačítko pro tisk štítku je nyní k dispozici.`,
                });
            } else {
                throw new Error(packetaData.error || 'Neznámá chyba');
            }
        } catch (e: any) {
            toast({
                title: "Chyba při vytváření zásilky",
                description: e.message,
                variant: "destructive"
            });
        } finally {
            setIsCreatingPacket(false);
        }
    };

    if (!order) return null;

    return (
        <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden [&>button]:hidden">
            {/* Custom Sticky Header Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <DialogClose asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogClose>
                    <div className="flex flex-col">
                        <DialogTitle className="text-lg font-bold">Objednávka #{order.id.slice(0, 8)}</DialogTitle>
                        <p className="text-xs text-muted-foreground">{new Date(order.date || order.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <InvoiceModal order={order}>
                        <Button variant="outline" size="sm" className="h-9 gap-2">
                            <FileText className="w-4 h-4" />
                            Faktura
                        </Button>
                    </InvoiceModal>

                    <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => window.print()}>
                        <Printer className="w-4 h-4" />
                        Tisk
                    </Button>

                    {order.delivery_info?.deliveryMethod === 'zasilkovna' && (
                        <>
                            {order.packeta_barcode ? (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-9 bg-green-600 hover:bg-green-700 gap-2"
                                    onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                >
                                    <Printer className="w-4 h-4" />
                                    Štítek
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-9 bg-primary gap-2"
                                    disabled={isCreatingPacket || !order.delivery_info?.packetaPointId}
                                    onClick={handleCreatePacketaPacket}
                                >
                                    {isCreatingPacket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                                    Vytvořit zásilku
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-6" id="printable-area">
                {/* Status Badges Row */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Aktuální stav</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant={order.status === 'pending' ? 'outline' : 'secondary'} className={`text-xs px-3 py-1 ${order.status !== 'pending' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}`}>
                            {order.status === 'pending' ? 'Platba: Čeká' : 'Platba: Zaplaceno'}
                        </Badge>
                        <Badge
                            variant={order.status === 'shipped' ? 'default' : 'outline'}
                            className={`text-xs px-3 py-1 ${order.status === 'shipped' ? 'bg-blue-600' :
                                order.status === 'processing' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                    'border-amber-200 text-amber-700'
                                }`}
                        >
                            {order.status === 'shipped' ? 'Doprava: Vyřízena' :
                                order.status === 'processing' ? 'Doprava: Rozpracováno' :
                                    'Doprava: Čeká k vyřízení'}
                        </Badge>
                    </div>
                </div>

                {/* Customer & Delivery */}
                <div className="grid md:grid-cols-2 gap-8 bg-slate-50/50 p-4 rounded-xl border">
                    <div>
                        <h3 className="font-bold text-sm text-slate-500 uppercase mb-3 tracking-tight">Odběratel</h3>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">{order.delivery_info?.firstName || order.customer?.name} {order.delivery_info?.lastName}</p>
                            <p className="text-primary font-medium">{order.customer?.email || order.customer_email}</p>
                            <p className="text-slate-600">{order.delivery_info?.phone}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-500 uppercase mb-3 tracking-tight">Doručení</h3>
                        <div className="space-y-1">
                            <p className="font-bold">{order.delivery_info?.street}</p>
                            <p>{order.delivery_info?.city}, {order.delivery_info?.zip}</p>
                            <div className="pt-2 flex flex-col gap-1">
                                <p className="text-xs font-semibold text-slate-500">
                                    METODA: <span className="text-slate-900">{order.delivery_info?.deliveryMethod === 'zasilkovna' ? 'Zásilkovna' : 'Kurýr'}</span>
                                </p>
                                <p className="text-xs font-semibold text-slate-500">
                                    PLATBA: <span className="text-slate-900">{order.delivery_info?.paymentMethod === 'transfer' ? 'Bankovní převod' : 'Kartou online'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold">Položka</TableHead>
                                <TableHead className="text-right font-bold w-[100px]">Množství</TableHead>
                                <TableHead className="text-right font-bold w-[150px]">Cena celkem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items && order.items.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                                    <TableCell className="text-right text-slate-600 font-bold">{item.quantity}x</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(item.price * item.quantity)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Totals */}
                <div className="flex justify-end pr-4">
                    <div className="w-full md:w-1/3 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600 font-medium">
                            <span>Mezisoučet:</span>
                            <span>{formatCurrency(order.total - (order.delivery_info?.deliveryMethod === 'zasilkovna' ? 79 : 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 font-medium">
                            <span>Doprava:</span>
                            <span>{order.delivery_info?.deliveryMethod === 'zasilkovna' ? '79 Kč' : 'Zdarma'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-slate-900 text-slate-900">
                            <span>CELKEM:</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* QR Payment (only for transfer) */}
                {order.delivery_info?.paymentMethod === 'transfer' && (
                    <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
                        <div className="bg-white p-3 rounded-xl shrink-0">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPD*1.0*ACC:CZ9120100000002102766861*AM:${order.total}.00*CC:CZK*VS:${order.id.replace(/\D/g, '')}`}
                                alt="QR Platba"
                                className="w-32 h-32"
                            />
                        </div>
                        <div className="space-y-3 flex-1">
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase">Platební údaje</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Účet</p>
                                    <p className="font-mono text-lg font-bold">2102766861/2010</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">VS</p>
                                    <p className="font-mono text-lg font-bold">{order.id.replace(/\D/g, '')}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs italic">Naskenujte QR kód ve své bankovní aplikaci pro okamžitou platbu.</p>
                        </div>
                    </div>
                )}
            </div>
        </DialogContent>
    );
};
