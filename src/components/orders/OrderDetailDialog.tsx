import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Define the Order type based on what we use in Orders.tsx and the DB schema
// Ideally this should be imported from types/index.ts but for now we define it here or use 'any'
export interface OrderType {
    id: string;
    date: string; // or Date
    status: 'pending' | 'paid' | 'shipped';
    total: number;
    customer: {
        name: string;
        email: string;
    };
    delivery_info?: {
        firstName: string;
        lastName: string;
        phone: string;
        street: string;
        city: string;
        zip: string;
        deliveryMethod: string;
        paymentMethod: string;
        billingSameAsDelivery?: boolean;
        isCompany?: boolean;
        companyName?: string;
        ico?: string;
        dic?: string;
        billingStreet?: string;
        billingCity?: string;
        billingZip?: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

export const OrderDetailDialog = ({ order }: { order: any }) => {
    // Helper to safely format currency if formatPrice isn't available or fails
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('cs-CZ') + ' Kč';
    };

    if (!order) return null;

    return (
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Detail objednávky #{order.id}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 p-4" id="printable-area">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">BoostUp Energy</h1>
                        <p className="text-sm text-muted-foreground">Objednávka #{order.id}</p>
                        <p className="text-sm text-muted-foreground">Datum: {new Date(order.date || order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <Badge variant={order.status === 'paid' ? 'secondary' : order.status === 'shipped' ? 'default' : 'outline'} className="text-lg px-4 py-1">
                            {order.status === 'pending' ? 'Čeká na platbu' :
                                order.status === 'paid' ? 'Zaplaceno' : 'Odesláno'}
                        </Badge>
                    </div>
                </div>

                {/* Customer & Delivery */}
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2">Zákazník</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-medium">{order.delivery_info?.firstName || order.customer?.name} {order.delivery_info?.lastName}</p>
                            <p>{order.customer?.email || order.customer_email}</p>
                            <p>{order.delivery_info?.phone}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Doručení</h3>
                        <div className="text-sm space-y-1">
                            <p>{order.delivery_info?.street}</p>
                            <p>{order.delivery_info?.city}, {order.delivery_info?.zip}</p>
                            <p className="mt-2 text-muted-foreground">
                                Doprava: {order.delivery_info?.deliveryMethod === 'zasilkovna' ? 'Zásilkovna' : 'Kurýr'}
                            </p>
                            <p className="text-muted-foreground">
                                Platba: {order.delivery_info?.paymentMethod === 'transfer' ? 'Bankovní převod' : 'Kartou online'}
                            </p>
                        </div>
                    </div>

                    {/* Billing Address if different or company info present */}
                    {/* Billing Address if different or company info present */}
                    {(order.delivery_info?.billingSameAsDelivery === false || order.delivery_info?.isCompany || order.delivery_info?.ico || order.delivery_info?.dic) && (
                        <div className="col-span-2 pt-4 border-t mt-4">
                            <h3 className="font-semibold mb-2">Fakturační údaje</h3>
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    {order.delivery_info?.isCompany && order.delivery_info?.companyName && (
                                        <p className="font-bold">{order.delivery_info.companyName}</p>
                                    )}

                                    {order.delivery_info?.ico && <p>IČO: {order.delivery_info.ico}</p>}
                                    {order.delivery_info?.dic && <p>DIČ: {order.delivery_info.dic}</p>}

                                    {!order.delivery_info?.isCompany && !order.delivery_info?.ico && <p className="text-muted-foreground italic">Soukromá osoba</p>}
                                </div>
                                <div>
                                    <p>{order.delivery_info?.billingSameAsDelivery === false ? order.delivery_info?.billingStreet : order.delivery_info?.street}</p>
                                    <p>
                                        {order.delivery_info?.billingSameAsDelivery === false ? order.delivery_info?.billingCity : order.delivery_info?.city}, {' '}
                                        {order.delivery_info?.billingSameAsDelivery === false ? order.delivery_info?.billingZip : order.delivery_info?.zip}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Items */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Položka</TableHead>
                            <TableHead className="text-right">Množství</TableHead>
                            <TableHead className="text-right">Cena</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items && order.items.map((item: any, idx: number) => (
                            <TableRow key={idx}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.quantity}x</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Totals */}
                <div className="flex justify-end border-t pt-4">
                    <div className="w-1/2 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Mezisoučet:</span>
                            <span>{formatCurrency(order.total - (order.delivery_info?.deliveryMethod === 'zasilkovna' ? 79 : 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Doprava:</span>
                            <span>{order.delivery_info?.deliveryMethod === 'zasilkovna' ? '79 Kč' : 'Zdarma'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Celkem:</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* QR Payment (only for transfer) */}
                {order.delivery_info?.paymentMethod === 'transfer' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6 flex gap-6 items-center">
                        <div className="bg-white p-2 rounded shrink-0">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPD*1.0*ACC:CZ9120100000002102766861*AM:${order.total}.00*CC:CZK*VS:${order.id.replace(/\D/g, '')}`}
                                alt="QR Platba"
                                className="w-32 h-32"
                            />
                        </div>
                        <div className="space-y-1 text-sm text-blue-900">
                            <h4 className="font-bold text-blue-700 mb-2">Platební údaje</h4>
                            <p>Číslo účtu: <strong>2102766861/2010</strong></p>
                            <p>VS: <strong>{order.id.replace(/\D/g, '')}</strong></p>
                            <p>Částka: <strong>{formatCurrency(order.total)}</strong></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-4 print:hidden">
                <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Tisk
                </Button>
            </div>
        </DialogContent>
    );
};
