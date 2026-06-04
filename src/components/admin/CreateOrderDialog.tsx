import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useInventory, Order } from "@/context/InventoryContext";
import { useContent } from "@/context/ContentContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Box, CreditCard, User, Truck, ShoppingBag, MapPin, AlertTriangle, Info } from "lucide-react";
import PacketaWidget from "@/components/PacketaWidget";

interface CreateOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface OrderItemState {
    sku: string;
    quantity: number;
    price: number;
    mixConfiguration?: {
        lemon: number;
        red: number;
        silky: number;
    };
}

interface CatalogProduct {
    sku: string;
    name: string;
    packSize: number;
    baseFlavor?: 'lemon' | 'red' | 'silky';
    isMix?: boolean;
}

const CATALOG_PRODUCTS: CatalogProduct[] = [
    { sku: 'lemon-3', name: '🍋 Lemon Blast (3 ks)', packSize: 3, baseFlavor: 'lemon' },
    { sku: 'lemon-12', name: '🍋 Lemon Blast (12 ks)', packSize: 12, baseFlavor: 'lemon' },
    { sku: 'lemon-21', name: '🍋 Lemon Blast (21 ks)', packSize: 21, baseFlavor: 'lemon' },
    { sku: 'red-3', name: '🍓 Red Rush (3 ks)', packSize: 3, baseFlavor: 'red' },
    { sku: 'red-12', name: '🍓 Red Rush (12 ks)', packSize: 12, baseFlavor: 'red' },
    { sku: 'red-21', name: '🍓 Red Rush (21 ks)', packSize: 21, baseFlavor: 'red' },
    { sku: 'silky-3', name: '🌿 Silky Leaf (3 ks)', packSize: 3, baseFlavor: 'silky' },
    { sku: 'silky-12', name: '🌿 Silky Leaf (12 ks)', packSize: 12, baseFlavor: 'silky' },
    { sku: 'silky-21', name: '🌿 Silky Leaf (21 ks)', packSize: 21, baseFlavor: 'silky' },
    { sku: 'mix-3', name: '🌈 MIX Pack (3 ks)', packSize: 3, isMix: true },
    { sku: 'mix-12', name: '🌈 MIX Pack (12 ks)', packSize: 12, isMix: true },
    { sku: 'mix-21', name: '🌈 MIX Pack (21 ks)', packSize: 21, isMix: true },
];

export const CreateOrderDialog = ({ isOpen, onClose }: CreateOrderDialogProps) => {
    const { content } = useContent();
    const { toast } = useToast();
    const { addOrder, addMovement, stock } = useInventory();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Customer info
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Billing toggle
    const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
    const [isCompany, setIsCompany] = useState(false);
    const [companyName, setCompanyName] = useState("");
    const [ico, setIco] = useState("");
    const [dic, setDic] = useState("");

    // Shipping info
    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState("courier");
    const [packetaPointId, setPacketaPointId] = useState("");
    const [packetaPointName, setPacketaPointName] = useState("");

    // Billing address fields (if not same)
    const [billingStreet, setBillingStreet] = useState("");
    const [billingHouseNumber, setBillingHouseNumber] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingZip, setBillingZip] = useState("");

    // Payment and status
    const [paymentMethod, setPaymentMethod] = useState("transfer_manual");
    const [orderStatus, setOrderStatus] = useState<Order['status']>("paid");

    // Items list
    const [items, setItems] = useState<OrderItemState[]>([
        { sku: "lemon-3", quantity: 1, price: 149 }
    ]);

    // Shipping fee
    const [shippingFee, setShippingFee] = useState<number>(0);

    // Automatically set shipping fee on delivery method changes
    useEffect(() => {
        if (deliveryMethod === 'zasilkovna') {
            setShippingFee(79);
        } else if (deliveryMethod === 'courier') {
            setShippingFee(120);
        } else {
            setShippingFee(0);
        }
    }, [deliveryMethod]);

    const getDefaultPrice = (sku: string): number => {
        if (sku.endsWith('-3')) return content?.pricing?.pack3 || 149;
        if (sku.endsWith('-12')) return content?.pricing?.pack12 || 499;
        if (sku.endsWith('-21')) return content?.pricing?.pack21 || 799;
        return 149;
    };

    const handleProductChange = (index: number, sku: string) => {
        const product = CATALOG_PRODUCTS.find(p => p.sku === sku);
        if (!product) return;

        const newItems = [...items];
        const defaultPrice = getDefaultPrice(sku);

        // Prepopulate mix counts
        let mixConfig = undefined;
        if (product.isMix) {
            const perFlavor = Math.floor(product.packSize / 3);
            const remainder = product.packSize % 3;
            mixConfig = {
                lemon: perFlavor + remainder,
                red: perFlavor,
                silky: perFlavor
            };
        }

        newItems[index] = {
            sku,
            quantity: newItems[index].quantity,
            price: defaultPrice,
            mixConfiguration: mixConfig
        };
        setItems(newItems);
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...items];
        newItems[index].quantity = Math.max(1, quantity);
        setItems(newItems);
    };

    const handlePriceChange = (index: number, price: number) => {
        const newItems = [...items];
        newItems[index].price = Math.max(0, price);
        setItems(newItems);
    };

    const handleMixCountChange = (index: number, flavor: 'lemon' | 'red' | 'silky', value: number) => {
        const newItems = [...items];
        const item = newItems[index];
        if (item.mixConfiguration) {
            item.mixConfiguration = {
                ...item.mixConfiguration,
                [flavor]: Math.max(0, value)
            };
            setItems(newItems);
        }
    };

    const addItem = () => {
        setItems([...items, { sku: "lemon-3", quantity: 1, price: 149 }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) {
            toast({
                title: "Chyba",
                description: "Objednávka musí obsahovat alespoň jednu položku.",
                variant: "destructive"
            });
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + shippingFee;

    // Calculate total required bottles per flavor
    const getRequiredBottles = () => {
        const req = { lemon: 0, red: 0, silky: 0 };
        items.forEach(item => {
            const product = CATALOG_PRODUCTS.find(p => p.sku === item.sku);
            if (!product) return;

            if (product.isMix && item.mixConfiguration) {
                req.lemon += (item.mixConfiguration.lemon || 0) * item.quantity;
                req.red += (item.mixConfiguration.red || 0) * item.quantity;
                req.silky += (item.mixConfiguration.silky || 0) * item.quantity;
            } else if (product.baseFlavor) {
                req[product.baseFlavor] += product.packSize * item.quantity;
            }
        });
        return req;
    };

    const requiredBottles = getRequiredBottles();

    // Check if stock is sufficient
    const isStockLow = 
        requiredBottles.lemon > (stock.lemon || 0) ||
        requiredBottles.red > (stock.red || 0) ||
        requiredBottles.silky > (stock.silky || 0);

    const handleSubmit = async () => {
        // Validate customer info
        if (!firstName.trim() || !lastName.trim()) {
            toast({ title: "Chybí jméno zákazníka", description: "Zadejte jméno i příjmení.", variant: "destructive" });
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            toast({ title: "Neplatný e-mail", description: "Zadejte platnou e-mailovou adresu.", variant: "destructive" });
            return;
        }
        if (!phone.trim()) {
            toast({ title: "Chybí telefonní číslo", description: "Zadejte telefonní číslo zákazníka.", variant: "destructive" });
            return;
        }

        // Validate address
        if (deliveryMethod !== 'personal') {
            if (!street.trim() || !houseNumber.trim() || !city.trim() || !zip.trim()) {
                toast({ title: "Neúplná doručovací adresa", description: "Vyplňte kompletní doručovací adresu.", variant: "destructive" });
                return;
            }
        }

        // Validate billing address if not same
        if (!billingSameAsDelivery) {
            if (!billingStreet.trim() || !billingHouseNumber.trim() || !billingCity.trim() || !billingZip.trim()) {
                toast({ title: "Neúplná fakturační adresa", description: "Vyplňte kompletní fakturační adresu.", variant: "destructive" });
                return;
            }
        }

        if (isCompany && !companyName.trim()) {
            toast({ title: "Chybí název firmy", description: "Vyplňte název firmy.", variant: "destructive" });
            return;
        }
        if (isCompany && !ico.trim()) {
            toast({ title: "Chybí IČO", description: "Vyplňte IČO firmy.", variant: "destructive" });
            return;
        }

        // Validate Zásilkovna point
        if (deliveryMethod === 'zasilkovna' && !packetaPointId) {
            toast({ title: "Chybí pobočka Zásilkovny", description: "Vyberte pobočku pro doručení.", variant: "destructive" });
            return;
        }

        // Validate mix sizes
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const product = CATALOG_PRODUCTS.find(p => p.sku === item.sku);
            if (product?.isMix && item.mixConfiguration) {
                const sum = item.mixConfiguration.lemon + item.mixConfiguration.red + item.mixConfiguration.silky;
                if (sum !== product.packSize) {
                    toast({
                        title: "Nesprávná konfigurace MIX balení",
                        description: `U položky #${i+1} (${product.name}) neodpovídá celkový počet lahviček (${sum} ks) zvolenému balení (${product.packSize} ks).`,
                        variant: "destructive"
                    });
                    return;
                }
            }
        }

        setIsSubmitting(true);

        try {
            const orderId = `BUP-OFF-${Math.floor(Date.now() / 1000)}`;

            // 1. Persist stock movements if status is not cancelled
            if (orderStatus !== 'cancelled') {
                for (const [flavor, amount] of Object.entries(requiredBottles)) {
                    if (amount > 0) {
                        await addMovement(flavor, -amount, 'sale', `Offline objednávka: ${orderId}`);
                    }
                }
            }

            // 2. Persist order
            const newOrder: Order = {
                id: orderId,
                date: new Date().toISOString(),
                customer: {
                    name: `${firstName.trim()} ${lastName.trim()}`,
                    email: email.trim(),
                },
                delivery_info: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                    street: street.trim(),
                    houseNumber: houseNumber.trim(),
                    city: city.trim(),
                    zip: zip.trim(),
                    deliveryMethod,
                    paymentMethod,
                    packetaPointId: deliveryMethod === 'zasilkovna' ? packetaPointId : undefined,
                    billingSameAsDelivery,
                    isCompany,
                    companyName: isCompany ? companyName.trim() : undefined,
                    ico: isCompany ? ico.trim() : undefined,
                    dic: isCompany ? dic.trim() : undefined,
                    billingStreet: billingSameAsDelivery ? street.trim() : billingStreet.trim(),
                    billingHouseNumber: billingSameAsDelivery ? houseNumber.trim() : billingHouseNumber.trim(),
                    billingCity: billingSameAsDelivery ? city.trim() : billingCity.trim(),
                    billingZip: billingSameAsDelivery ? zip.trim() : billingZip.trim(),
                },
                items: items.map(item => {
                    const catalogItem = CATALOG_PRODUCTS.find(p => p.sku === item.sku);
                    return {
                        sku: item.sku,
                        name: catalogItem?.name || item.sku,
                        quantity: item.quantity,
                        price: item.price,
                        mixConfiguration: item.mixConfiguration
                    };
                }),
                total,
                status: orderStatus
            };

            const success = await addOrder(newOrder);

            if (success) {
                toast({
                    title: "Objednávka vytvořena",
                    description: `Offline objednávka ${orderId} byla úspěšně zapsána a sklad byl odečten.`,
                });
                resetAndClose();
            } else {
                throw new Error("Nepodařilo se uložit objednávku do databáze.");
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Chyba při ukládání",
                description: error.message || "Během zápisu objednávky došlo k chybě.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setStreet("");
        setHouseNumber("");
        setCity("");
        setZip("");
        setDeliveryMethod("courier");
        setPacketaPointId("");
        setPacketaPointName("");
        setBillingSameAsDelivery(true);
        setIsCompany(false);
        setCompanyName("");
        setIco("");
        setDic("");
        setBillingStreet("");
        setBillingHouseNumber("");
        setBillingCity("");
        setBillingZip("");
        setPaymentMethod("transfer_manual");
        setOrderStatus("paid");
        setItems([{ sku: "lemon-3", quantity: 1, price: 149 }]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="max-w-6xl rounded-[2.5rem] border-none shadow-2xl bg-white text-olive-dark max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader className="border-b border-olive/10 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-olive-dark font-black uppercase text-xl sm:text-2xl tracking-tight italic font-display">
                        <ShoppingBag className="w-7 h-7 text-lime-dark" />
                        Nová manuální objednávka
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
                    {/* Left side: Client & Shipping Info */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Customer Details */}
                        <div className="p-6 bg-olive-dark/5 rounded-[2rem] border border-olive/5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-olive-dark/60 flex items-center gap-2">
                                <User className="w-4 h-4 text-lime-dark" /> Osobní údaje zákazníka
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Jméno *</Label>
                                    <Input 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        placeholder="Jan" 
                                        className="rounded-xl border-olive/10 bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Příjmení *</Label>
                                    <Input 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        placeholder="Novák" 
                                        className="rounded-xl border-olive/10 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">E-mail *</Label>
                                    <Input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="jan.novak@gmail.com" 
                                        className="rounded-xl border-olive/10 bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Telefon *</Label>
                                    <Input 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        placeholder="+420 777 777 777" 
                                        className="rounded-xl border-olive/10 bg-white"
                                    />
                                </div>
                            </div>

                            {/* Company Toggle */}
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox 
                                    id="isCompany" 
                                    checked={isCompany} 
                                    onCheckedChange={(checked) => setIsCompany(checked as boolean)}
                                    className="data-[state=checked]:bg-lime-dark data-[state=checked]:border-lime-dark"
                                />
                                <Label htmlFor="isCompany" className="text-xs font-bold uppercase tracking-wider cursor-pointer">Nakupuji na firmu</Label>
                            </div>

                            {isCompany && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-olive/5 animate-in fade-in duration-300">
                                    <div className="sm:col-span-1 space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Firma *</Label>
                                        <Input 
                                            value={companyName} 
                                            onChange={(e) => setCompanyName(e.target.value)} 
                                            placeholder="Firma s.r.o." 
                                            className="rounded-xl border-olive/10 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">IČO *</Label>
                                        <Input 
                                            value={ico} 
                                            onChange={(e) => setIco(e.target.value)} 
                                            placeholder="12345678" 
                                            className="rounded-xl border-olive/10 bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">DIČ</Label>
                                        <Input 
                                            value={dic} 
                                            onChange={(e) => setDic(e.target.value)} 
                                            placeholder="CZ12345678" 
                                            className="rounded-xl border-olive/10 bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Delivery Options */}
                        <div className="p-6 bg-olive-dark/5 rounded-[2rem] border border-olive/5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-olive-dark/60 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-lime-dark" /> Způsob doručení
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'courier', label: 'Kurýr', desc: 'Doručení na adresu' },
                                    { id: 'zasilkovna', label: 'Zásilkovna', desc: 'Výdejní místo' },
                                    { id: 'personal', label: 'Osobní odběr', desc: 'Mendelu Brno' }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setDeliveryMethod(method.id)}
                                        className={`p-3 rounded-xl border text-center transition-all ${deliveryMethod === method.id ? 'border-lime-dark bg-lime/10 ring-2 ring-lime/20 font-black' : 'border-olive/10 hover:border-olive-dark/30 font-bold bg-white text-olive-dark/70'}`}
                                    >
                                        <div className="text-xs uppercase tracking-wider">{method.label}</div>
                                        <div className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5">{method.desc}</div>
                                    </button>
                                ))}
                            </div>

                            {deliveryMethod === 'zasilkovna' && (
                                <div className="space-y-3 p-3 bg-white rounded-xl border border-olive/10 animate-in fade-in duration-300">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Výdejní místo Zásilkovny *</Label>
                                    
                                    {packetaPointId ? (
                                        <div className="flex justify-between items-center bg-lime/5 p-3 rounded-lg border border-lime/20">
                                            <div>
                                                <div className="text-xs font-black">{packetaPointName}</div>
                                                <div className="text-[9px] text-muted-foreground uppercase">ID pobočky: {packetaPointId}</div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => { setPacketaPointId(""); setPacketaPointName(""); }}
                                                className="text-xs text-red-600 hover:text-red-700 h-8"
                                            >
                                                Změnit
                                            </Button>
                                        </div>
                                    ) : (
                                        <PacketaWidget 
                                            onPointSelected={(point: any) => { 
                                                setPacketaPointId(point.id); 
                                                setPacketaPointName(point.name); 
                                            }} 
                                        />
                                    )}

                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-[9px] font-black uppercase text-olive-dark/50">Nebo zadejte ID pobočky ručně</Label>
                                        <Input 
                                            value={packetaPointId} 
                                            onChange={(e) => {
                                                setPacketaPointId(e.target.value);
                                                if (e.target.value) setPacketaPointName(`Pobočka ID: ${e.target.value}`);
                                            }} 
                                            placeholder="Např. 1421" 
                                            className="h-9 text-xs rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {deliveryMethod !== 'personal' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Ulice *</Label>
                                            <Input 
                                                value={street} 
                                                onChange={(e) => setStreet(e.target.value)} 
                                                placeholder="Vodní" 
                                                className="rounded-xl border-olive/10 bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Č. popisné *</Label>
                                            <Input 
                                                value={houseNumber} 
                                                onChange={(e) => setHouseNumber(e.target.value)} 
                                                placeholder="12/A" 
                                                className="rounded-xl border-olive/10 bg-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Město *</Label>
                                            <Input 
                                                value={city} 
                                                onChange={(e) => setCity(e.target.value)} 
                                                placeholder="Brno" 
                                                className="rounded-xl border-olive/10 bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">PSČ *</Label>
                                            <Input 
                                                value={zip} 
                                                onChange={(e) => setZip(e.target.value)} 
                                                placeholder="602 00" 
                                                className="rounded-xl border-olive/10 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Billing Address Override */}
                        {deliveryMethod !== 'personal' && (
                            <div className="p-6 bg-olive-dark/5 rounded-[2rem] border border-olive/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-olive-dark/60 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-lime-dark" /> Fakturační adresa
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="billingSame" 
                                            checked={billingSameAsDelivery} 
                                            onCheckedChange={(checked) => setBillingSameAsDelivery(checked as boolean)}
                                            className="data-[state=checked]:bg-lime-dark data-[state=checked]:border-lime-dark"
                                        />
                                        <Label htmlFor="billingSame" className="text-xs font-bold cursor-pointer">Stejná jako doručovací</Label>
                                    </div>
                                </div>

                                {!billingSameAsDelivery && (
                                    <div className="space-y-4 pt-2 border-t border-olive/5 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Fakturační ulice *</Label>
                                                <Input 
                                                    value={billingStreet} 
                                                    onChange={(e) => setBillingStreet(e.target.value)} 
                                                    placeholder="Vodní" 
                                                    className="rounded-xl border-olive/10 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Č. popisné *</Label>
                                                <Input 
                                                    value={billingHouseNumber} 
                                                    onChange={(e) => setBillingHouseNumber(e.target.value)} 
                                                    placeholder="12/A" 
                                                    className="rounded-xl border-olive/10 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Fakturační město *</Label>
                                                <Input 
                                                    value={billingCity} 
                                                    onChange={(e) => setBillingCity(e.target.value)} 
                                                    placeholder="Brno" 
                                                    className="rounded-xl border-olive/10 bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Fakturační PSČ *</Label>
                                                <Input 
                                                    value={billingZip} 
                                                    onChange={(e) => setBillingZip(e.target.value)} 
                                                    placeholder="602 00" 
                                                    className="rounded-xl border-olive/10 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side: Items selection, payment, pricing summary */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* 4. Items lists */}
                        <div className="p-6 bg-olive-dark/5 rounded-[2rem] border border-olive/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-olive-dark/60 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-lime-dark" /> Položky objednávky
                                </h3>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addItem}
                                    className="h-8 rounded-lg border-lime-dark/20 text-lime-dark hover:bg-lime/10"
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Přidat položku
                                </Button>
                            </div>

                            <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
                                {items.map((item, idx) => {
                                    const product = CATALOG_PRODUCTS.find(p => p.sku === item.sku);
                                    return (
                                        <div key={idx} className="p-4 bg-white rounded-xl border border-olive/10 space-y-3 relative group">
                                            <button 
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-all p-1"
                                                title="Smazat položku"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="space-y-1.5 w-[90%]">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Produkt #{idx + 1}</Label>
                                                <Select value={item.sku} onValueChange={(val) => handleProductChange(idx, val)}>
                                                    <SelectTrigger className="h-10 rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATALOG_PRODUCTS.map(prod => (
                                                            <SelectItem key={prod.sku} value={prod.sku}>{prod.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-black uppercase text-olive-dark/60">Množství</Label>
                                                    <Input 
                                                        type="number" 
                                                        min="1" 
                                                        value={item.quantity} 
                                                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-black uppercase text-olive-dark/60">Cena za balení (Kč)</Label>
                                                    <Input 
                                                        type="number" 
                                                        min="0" 
                                                        value={item.price} 
                                                        onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                                                        className="h-9 font-mono"
                                                    />
                                                </div>
                                            </div>

                                            {/* MIX Specific Breakdown Inputs */}
                                            {product?.isMix && item.mixConfiguration && (
                                                <div className="p-3 bg-olive-dark/5 rounded-lg space-y-2 border border-olive/5 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-olive-dark/80">
                                                        <span>Rozpis příchutí:</span>
                                                        <span className={item.mixConfiguration.lemon + item.mixConfiguration.red + item.mixConfiguration.silky === product.packSize ? "text-green-600" : "text-amber-600"}>
                                                            {item.mixConfiguration.lemon + item.mixConfiguration.red + item.mixConfiguration.silky} / {product.packSize} ks
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[8px] font-bold text-olive-dark/60">🍋 Lemon</Label>
                                                            <Input 
                                                                type="number" 
                                                                min="0" 
                                                                value={item.mixConfiguration.lemon} 
                                                                onChange={(e) => handleMixCountChange(idx, 'lemon', parseInt(e.target.value) || 0)}
                                                                className="h-8 text-xs p-1.5 text-center font-bold"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[8px] font-bold text-olive-dark/60">🍓 Red</Label>
                                                            <Input 
                                                                type="number" 
                                                                min="0" 
                                                                value={item.mixConfiguration.red} 
                                                                onChange={(e) => handleMixCountChange(idx, 'red', parseInt(e.target.value) || 0)}
                                                                className="h-8 text-xs p-1.5 text-center font-bold"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[8px] font-bold text-olive-dark/60">🌿 Silky</Label>
                                                            <Input 
                                                                type="number" 
                                                                min="0" 
                                                                value={item.mixConfiguration.silky} 
                                                                onChange={(e) => handleMixCountChange(idx, 'silky', parseInt(e.target.value) || 0)}
                                                                className="h-8 text-xs p-1.5 text-center font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. Payment and Status */}
                        <div className="p-6 bg-olive-dark/5 rounded-[2rem] border border-olive/5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-olive-dark/60 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-lime-dark" /> Platba a Stav objednávky
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Způsob platby</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="transfer_manual">Bankovní převod</SelectItem>
                                            <SelectItem value="card">Platba kartou</SelectItem>
                                            <SelectItem value="cash">Hotově / Osobní</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-olive-dark/60">Stav objednávky</Label>
                                    <Select value={orderStatus} onValueChange={(val: any) => setOrderStatus(val)}>
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Nevyřízená / Čeká na platbu</SelectItem>
                                            <SelectItem value="paid">Zaplacená / Čeká na zpracování</SelectItem>
                                            <SelectItem value="processing">Zpracovává se</SelectItem>
                                            <SelectItem value="shipped">Odeslaná</SelectItem>
                                            <SelectItem value="cancelled">Stornovaná (neuplatní se sklad)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 6. Stock Check Warning */}
                        {orderStatus !== 'cancelled' && (
                            <div className="p-4 bg-lime/10 border border-lime/20 rounded-[1.5rem] space-y-2">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-olive-dark">
                                    <Info className="w-4 h-4 text-lime-dark" /> Odpis ze skladu (lahvičky)
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                                        <div className="text-[8px] font-bold text-olive-dark/50 uppercase">Lemon</div>
                                        <div className="text-sm font-black text-olive-dark">{requiredBottles.lemon} ks</div>
                                        <div className="text-[9px] text-muted-foreground">Sklad: {stock.lemon || 0}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                                        <div className="text-[8px] font-bold text-olive-dark/50 uppercase">Red</div>
                                        <div className="text-sm font-black text-olive-dark">{requiredBottles.red} ks</div>
                                        <div className="text-[9px] text-muted-foreground">Sklad: {stock.red || 0}</div>
                                    </div>
                                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                                        <div className="text-[8px] font-bold text-olive-dark/50 uppercase">Silky</div>
                                        <div className="text-sm font-black text-olive-dark">{requiredBottles.silky} ks</div>
                                        <div className="text-[9px] text-muted-foreground">Sklad: {stock.silky || 0}</div>
                                    </div>
                                </div>

                                {isStockLow && (
                                    <div className="flex gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] font-bold rounded-xl mt-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                                        <span>Nedostatek lahviček na skladě pro jednu nebo více příchutí. Zápis může selhat nebo způsobit záporný stav skladu.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 7. Summary & Submit */}
                        <div className="p-6 bg-olive-dark/5 rounded-[2rem] border border-olive/5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-olive-dark/60">Shrnutí objednávky</h3>
                            <div className="space-y-2 pt-2 border-t border-olive/5">
                                <div className="flex justify-between items-center text-xs opacity-75">
                                    <span>Mezisoučet zboží:</span>
                                    <span className="font-mono font-bold">{subtotal} Kč</span>
                                </div>
                                <div className="flex justify-between items-center text-xs opacity-75">
                                    <span>Poštovné:</span>
                                    <div className="flex items-center gap-1">
                                        <Input 
                                            type="number" 
                                            min="0"
                                            value={shippingFee}
                                            onChange={(e) => setShippingFee(parseInt(e.target.value) || 0)}
                                            className="w-16 h-7 text-xs p-1 text-right font-mono"
                                        />
                                        <span>Kč</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-olive/10 font-bold text-base">
                                    <span>Celkem k úhradě:</span>
                                    <span className="font-mono text-lime-dark text-lg font-black">{total} Kč</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-olive/10 pt-4 gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={resetAndClose}
                        className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive-dark/40 hover:text-olive-dark"
                    >
                        Zavřít
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="rounded-xl bg-lime hover:bg-lime/90 text-olive-dark px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-lime/20 h-11 min-w-[150px]"
                    >
                        {isSubmitting ? "Ukládám..." : "Uložit objednávku"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
