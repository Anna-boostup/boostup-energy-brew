import { useState } from "react";
import { useInventory, Order } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Search } from "lucide-react";

export function ManualOrderForm({ onSuccess }: { onSuccess: () => void }) {
    const { products, addOrder, b2bCustomers, addB2BCustomer } = useInventory();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [customerType, setCustomerType] = useState<"b2c" | "b2b">("b2c");
    const [b2bMode, setB2bMode] = useState<"saved" | "new">("saved");
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");

    const [customer, setCustomer] = useState({ 
        name: "", 
        email: "", 
        phone: "", 
        street: "", 
        city: "", 
        zip: "", 
        houseNumber: "" 
    });

    const [businessCustomer, setBusinessCustomer] = useState({
        companyName: "",
        ico: "",
        dic: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        zip: "",
        houseNumber: "",
        contactName: "",
        saveForLater: true
    });

    const [isSearchingAres, setIsSearchingAres] = useState(false);
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

    const handleAresSearch = async (icoValue: string) => {
        const cleaned = (icoValue || "").trim();
        if (!cleaned) {
            toast({ title: "Chyba", description: "Zadejte nejprve IČO.", variant: "destructive" });
            return;
        }
        setIsSearchingAres(true);
        try {
            const res = await fetch(`/api/ares?ico=${encodeURIComponent(cleaned)}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Nepodařilo se vyhledat subjekt.");
            }
            setBusinessCustomer(prev => ({
                ...prev,
                companyName: data.companyName || "",
                dic: data.dic || "",
                street: data.street || "",
                houseNumber: data.houseNumber || "",
                city: data.city || "",
                zip: data.zip || ""
            }));
            toast({ title: "Úspěch", description: "Údaje byly načteny z registru ARES." });
        } catch (err: any) {
            toast({ title: "ARES Vyhledávání", description: err.message, variant: "destructive" });
        } finally {
            setIsSearchingAres(false);
        }
    };

    const handlePartnerSelect = (partnerId: string) => {
        setSelectedPartnerId(partnerId);
        const partner = b2bCustomers.find(c => c.id === partnerId);
        if (partner) {
            // Split street and houseNumber if street contains digits at the end, otherwise keep it combined in street
            let streetStr = partner.street || "";
            let houseNumberStr = "";
            const streetMatch = streetStr.match(/(.*?)\s+(\d+[\/\d]*\w*)$/);
            if (streetMatch) {
                streetStr = streetMatch[1];
                houseNumberStr = streetMatch[2];
            }

            setBusinessCustomer({
                companyName: partner.company_name,
                ico: partner.ico,
                dic: partner.dic || "",
                email: partner.email || "",
                phone: partner.phone || "",
                street: streetStr,
                city: partner.city || "",
                zip: partner.zip || "",
                houseNumber: houseNumberStr,
                contactName: "",
                saveForLater: false
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const nameToCheck = customerType === "b2b" ? businessCustomer.companyName : customer.name;
        const emailToCheck = customerType === "b2b" ? businessCustomer.email : customer.email;

        if (!nameToCheck || !emailToCheck) {
            toast({ title: "Chyba", description: "Jméno/Název firmy a email jsou povinné.", variant: "destructive" });
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
                name: customerType === "b2b" ? businessCustomer.companyName : customer.name,
                email: customerType === "b2b" ? businessCustomer.email : customer.email
            },
            delivery_info: {
                firstName: customerType === "b2b" 
                    ? (businessCustomer.contactName.split(' ')[0] || '') 
                    : (customer.name.split(' ')[0] || ''),
                lastName: customerType === "b2b" 
                    ? (businessCustomer.contactName.split(' ').slice(1).join(' ') || '') 
                    : (customer.name.split(' ').slice(1).join(' ') || ''),
                phone: customerType === "b2b" ? businessCustomer.phone : customer.phone,
                street: customerType === "b2b" ? businessCustomer.street : customer.street,
                city: customerType === "b2b" ? businessCustomer.city : customer.city,
                zip: customerType === "b2b" ? businessCustomer.zip : customer.zip,
                houseNumber: customerType === "b2b" ? businessCustomer.houseNumber : customer.houseNumber,
                deliveryMethod,
                paymentMethod,
                isCompany: customerType === "b2b",
                companyName: customerType === "b2b" ? businessCustomer.companyName : undefined,
                ico: customerType === "b2b" ? businessCustomer.ico : undefined,
                dic: customerType === "b2b" ? businessCustomer.dic : undefined,
                billingSameAsDelivery: true
            },
            items: orderItems,
            total: calculateTotal(),
            status: paymentMethod === 'transfer_manual' ? 'pending' : 'paid'
        };

        try {
            // Save new B2B customer if checked
            if (customerType === "b2b" && b2bMode === "new" && businessCustomer.saveForLater) {
                await addB2BCustomer({
                    company_name: businessCustomer.companyName,
                    ico: businessCustomer.ico,
                    dic: businessCustomer.dic || null,
                    email: businessCustomer.email || null,
                    phone: businessCustomer.phone || null,
                    street: businessCustomer.street + (businessCustomer.houseNumber ? ` ${businessCustomer.houseNumber}` : ""),
                    city: businessCustomer.city || null,
                    zip: businessCustomer.zip || null
                });
            }

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
                <h3 className="font-bold text-olive-dark uppercase tracking-widest text-xs">Typ Odběratele</h3>
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                    <button
                        type="button"
                        onClick={() => setCustomerType("b2c")}
                        className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                            customerType === "b2c" 
                                ? "bg-white text-olive-dark shadow-sm border border-zinc-200 font-black" 
                                : "text-zinc-500 hover:text-zinc-800"
                        }`}
                    >
                        Osobní (B2C)
                    </button>
                    <button
                        type="button"
                        onClick={() => setCustomerType("b2b")}
                        className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                            customerType === "b2b" 
                                ? "bg-white text-olive-dark shadow-sm border border-zinc-200 font-black" 
                                : "text-zinc-500 hover:text-zinc-800"
                        }`}
                    >
                        Firemní (B2B)
                    </button>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-olive/10">
                <h3 className="font-bold text-olive-dark uppercase tracking-widest text-xs">Údaje Zákazníka</h3>
                
                {customerType === "b2b" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100/50 rounded-xl border border-zinc-100">
                            <button
                                type="button"
                                onClick={() => setB2bMode("saved")}
                                className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    b2bMode === "saved" 
                                        ? "bg-white text-olive-dark shadow-sm border border-zinc-200" 
                                        : "text-zinc-400 hover:text-zinc-700"
                                }`}
                            >
                                Uložený partner
                            </button>
                            <button
                                type="button"
                                onClick={() => setB2bMode("new")}
                                className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                    b2bMode === "new" 
                                        ? "bg-white text-olive-dark shadow-sm border border-zinc-200" 
                                        : "text-zinc-400 hover:text-zinc-700"
                                }`}
                            >
                                Nový partner
                            </button>
                        </div>

                        {b2bMode === "saved" && (
                            <div className="space-y-2">
                                <Label>Vyberte partnera</Label>
                                <Select value={selectedPartnerId} onValueChange={handlePartnerSelect}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="Zvolte uloženou firmu..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {b2bCustomers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.company_name} (IČO: {c.ico})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {b2bMode === "new" && (
                            <div className="space-y-2">
                                <Label>IČO firmy *</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={businessCustomer.ico} 
                                        onChange={e => setBusinessCustomer({...businessCustomer, ico: e.target.value})} 
                                        placeholder="Zadejte IČO..."
                                        className="bg-white"
                                    />
                                    <Button 
                                        type="button" 
                                        disabled={isSearchingAres} 
                                        onClick={() => handleAresSearch(businessCustomer.ico)}
                                        className="bg-olive-dark text-white hover:bg-olive-dark/90 px-4 gap-2 flex items-center font-bold"
                                    >
                                        {isSearchingAres ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        ARES
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                            <div className="space-y-2 col-span-2">
                                <Label>Název firmy *</Label>
                                <Input 
                                    required 
                                    value={businessCustomer.companyName} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, companyName: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>DIČ (volitelně)</Label>
                                <Input 
                                    value={businessCustomer.dic} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, dic: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kontaktní osoba</Label>
                                <Input 
                                    placeholder="Jméno Příjmení"
                                    value={businessCustomer.contactName} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, contactName: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-mail *</Label>
                                <Input 
                                    required 
                                    type="email" 
                                    value={businessCustomer.email} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, email: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefon</Label>
                                <Input 
                                    value={businessCustomer.phone} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, phone: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 grid grid-cols-3 gap-2">
                                <div className="col-span-2 space-y-1">
                                    <Label>Ulice</Label>
                                    <Input 
                                        value={businessCustomer.street} 
                                        onChange={e => setBusinessCustomer({...businessCustomer, street: e.target.value})} 
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Č. popisné</Label>
                                    <Input 
                                        value={businessCustomer.houseNumber} 
                                        onChange={e => setBusinessCustomer({...businessCustomer, houseNumber: e.target.value})} 
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Město</Label>
                                <Input 
                                    value={businessCustomer.city} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, city: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>PSČ</Label>
                                <Input 
                                    value={businessCustomer.zip} 
                                    onChange={e => setBusinessCustomer({...businessCustomer, zip: e.target.value})} 
                                    className="bg-white"
                                />
                            </div>
                            {b2bMode === "new" && (
                                <div className="flex items-center gap-2 col-span-2 pt-2">
                                    <input 
                                        type="checkbox" 
                                        id="saveForLater" 
                                        checked={businessCustomer.saveForLater}
                                        onChange={e => setBusinessCustomer({...businessCustomer, saveForLater: e.target.checked})}
                                        className="rounded border-zinc-300 text-lime focus:ring-lime"
                                    />
                                    <Label htmlFor="saveForLater" className="cursor-pointer font-medium text-xs text-zinc-600">Uložit partnera do databáze pro příští použití</Label>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {customerType === "b2c" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                        <div className="space-y-2 col-span-2">
                            <Label>Jméno a Příjmení *</Label>
                            <Input required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="bg-white" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>E-mail *</Label>
                            <Input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefon</Label>
                            <Input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="bg-white" />
                        </div>
                        <div className="col-span-2 grid grid-cols-3 gap-2">
                            <div className="col-span-2 space-y-1">
                                <Label>Ulice</Label>
                                <Input value={customer.street} onChange={e => setCustomer({...customer, street: e.target.value})} className="bg-white" />
                            </div>
                            <div className="space-y-1">
                                <Label>Č. popisné</Label>
                                <Input value={customer.houseNumber} onChange={e => setCustomer({...customer, houseNumber: e.target.value})} className="bg-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Město</Label>
                            <Input value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label>PSČ</Label>
                            <Input value={customer.zip} onChange={e => setCustomer({...customer, zip: e.target.value})} className="bg-white" />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-4 border-t border-olive/10">
                <h3 className="font-bold text-olive-dark uppercase tracking-widest text-xs">Platba & Doprava</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Metoda platby</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="bg-white">
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
                            <SelectTrigger className="bg-white">
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
                            <div key={idx} className="flex gap-3 items-end p-3 bg-zinc-50 rounded-xl border border-olive/5">
                                <div className="space-y-2 flex-1">
                                    <Label>Produkt</Label>
                                    <Select value={item.sku} onValueChange={(val) => handleItemChange(idx, 'sku', val)}>
                                        <SelectTrigger className="bg-white">
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
                                    <Input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)} className="bg-white" />
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
