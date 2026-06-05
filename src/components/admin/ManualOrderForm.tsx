import { useState } from "react";
import { useInventory, Order } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function ManualOrderForm({ onSuccess }: { onSuccess: () => void }) {
    const { products, addOrder } = useInventory();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [customer, setCustomer] = useState({ name: "", email: "", phone: "", street: "", city: "", zip: "" });
    const [paymentMethod, setPaymentMethod] = useState("transfer_manual");
    const [deliveryMethod, setDeliveryMethod] = useState("courier");
    const [items, setItems] = useState<{ sku: string; quantity: number }[]>([]);
    const [promoPriceType, setPromoPriceType] = useState<"regular" | "free" | "custom">("free");
    const [customPrice, setCustomPrice] = useState<string>("0");

    const activeProducts = products.filter(p => p.is_active);

    const handleAddItem = () => {
        if (activeProducts.length > 0) {
            setItems([...items, { sku: activeProducts[0].sku, quantity: 1 }]);
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: 'sku' | 'quantity', value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        if (paymentMethod === 'promo') {
            if (promoPriceType === 'free') return 0;
            if (promoPriceType === 'custom') {
                return parseFloat(customPrice) || 0;
            }
        }
        return items.reduce((total, item) => {
            const prod = activeProducts.find(p => p.sku === item.sku);
            return total + ((prod?.price || 0) * item.quantity);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!customer.name || !customer.email) {
            toast({ title: "Chyba", description: "Jméno a email jsou povinné.", variant: "destructive" });
            return;
        }

        if (items.length === 0) {
            toast({ title: "Chyba", description: "Přidejte alespoň jeden produkt.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        const totalRegular = items.reduce((total, item) => {
            const prod = activeProducts.find(p => p.sku === item.sku);
            return total + ((prod?.price || 0) * item.quantity);
        }, 0);

        const orderItems = items.map(item => {
            const prod = activeProducts.find(p => p.sku === item.sku);
            let price = prod?.price || 0;
            if (paymentMethod === 'promo') {
                if (promoPriceType === 'free') {
                    price = 0;
                } else if (promoPriceType === 'custom') {
                    const customTotal = parseFloat(customPrice) || 0;
                    const ratio = totalRegular > 0 ? (customTotal / totalRegular) : 0;
                    price = Math.round((prod?.price || 0) * ratio * 100) / 100;
                }
            }
            return {
                sku: item.sku,
                name: prod?.name || item.sku,
                quantity: item.quantity,
                price: price
            };
        });

        const newOrder: Order = {
            id: `MAN-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            customer: {
                name: customer.name,
                email: customer.email
            },
            delivery_info: {
                firstName: customer.name.split(' ')[0] || '',
                lastName: customer.name.split(' ').slice(1).join(' ') || '',
                phone: customer.phone,
                street: customer.street,
                city: customer.city,
                zip: customer.zip,
                houseNumber: '',
                deliveryMethod,
                paymentMethod
            },
            items: orderItems,
            total: calculateTotal(),
            status: paymentMethod === 'transfer_manual' ? 'pending' : 'paid'
        };

        try {
            const success = await addOrder(newOrder);
            if (success) {
                toast({ title: "Úspěch", description: "Objednávka byla ručně vytvořena." });
                onSuccess();
            } else {
                throw new Error("Kolize ID nebo chyba při ukládání.");
            }
        } catch (error: any) {
            toast({ title: "Chyba", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-bold text-olive-dark uppercase tracking-widest text-xs">Zákazník</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Jméno a Příjmení *</Label>
                        <Input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>E-mail *</Label>
                        <Input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefon</Label>
                        <Input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Ulice</Label>
                        <Input value={customer.street} onChange={e => setCustomer({...customer, street: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Město</Label>
                        <Input value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>PSČ</Label>
                        <Input value={customer.zip} onChange={e => setCustomer({...customer, zip: e.target.value})} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-olive/10">
                <h3 className="font-bold text-olive-dark uppercase tracking-widest text-xs">Platba & Doprava</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Metoda platby</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="transfer_manual">Převodem (Čeká na platbu)</SelectItem>
                                <SelectItem value="cash">Hotově (Zaplaceno)</SelectItem>
                                <SelectItem value="card">Kartou / Jiné (Zaplaceno)</SelectItem>
                                <SelectItem value="promo">Promo / Dárek</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Způsob dopravy</Label>
                        <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="courier">Kurýr</SelectItem>
                                <SelectItem value="packeta">Zásilkovna</SelectItem>
                                <SelectItem value="personal">Osobní odběr</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {paymentMethod === 'promo' && (
                        <div className="space-y-3 col-span-2 bg-lime/5 p-4 rounded-xl border border-lime/20 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <Label className="font-bold text-olive-dark text-[10px] uppercase tracking-widest pl-0.5">Cena pro Promo / Dárek</Label>
                                <Select value={promoPriceType} onValueChange={(val: "regular" | "free" | "custom") => setPromoPriceType(val)}>
                                    <SelectTrigger className="bg-white border-lime/20 h-11 text-sm font-bold text-olive-dark focus:ring-lime mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">0 Kč (Zdarma / Dárek)</SelectItem>
                                        <SelectItem value="regular">Běžná cena (Sledovat hodnotu)</SelectItem>
                                        <SelectItem value="custom">Vlastní cena (Speciální sleva)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {promoPriceType === 'custom' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="font-bold text-olive-dark text-[10px] uppercase tracking-widest pl-0.5">Vlastní celková cena (Kč)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={customPrice}
                                        onChange={e => setCustomPrice(e.target.value)}
                                        className="bg-white border-lime/20 h-11 text-sm font-bold text-olive-dark focus:ring-lime"
                                        placeholder="Zadejte vlastní částku..."
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-olive/10">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-olive-dark uppercase tracking-widest text-xs">Položky objednávky</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2 bg-lime/10">
                        <Plus className="w-4 h-4" /> Přidat položku
                    </Button>
                </div>
                
                {items.length === 0 ? (
                    <p className="text-sm text-olive/60 italic text-center py-4">Zatím nebyly přidány žádné produkty.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-end p-3 bg-admin-canvas/50 rounded-xl border border-olive/5">
                                <div className="space-y-2 flex-1">
                                    <Label>Produkt</Label>
                                    <Select value={item.sku} onValueChange={(val) => handleItemChange(idx, 'sku', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeProducts.map(p => (
                                                <SelectItem key={p.sku} value={p.sku}>{p.name} ({p.price} Kč)</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 w-24">
                                    <Label>Množství</Label>
                                    <Input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveItem(idx)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-olive-dark uppercase text-sm">Celkem k úhradě:</span>
                    <span className="text-xl font-black text-olive-dark">{calculateTotal()} Kč</span>
                </div>
            </div>

            <div className="pt-6 border-t border-olive/10 flex justify-end gap-3">
                <Button type="submit" disabled={isLoading} className="bg-lime text-olive-dark hover:bg-lime/80 px-8 rounded-xl font-bold">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vytvořit objednávku"}
                </Button>
            </div>
        </form>
    );
}
