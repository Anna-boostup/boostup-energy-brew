import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building2, MapPin, Phone, User as UserIcon, CreditCard, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompanyProfile() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    // Delivery Address
    const [deliveryStreet, setDeliveryStreet] = useState("");
    const [deliveryHouseNumber, setDeliveryHouseNumber] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");
    const [deliveryZip, setDeliveryZip] = useState("");

    // Billing
    const [billingSame, setBillingSame] = useState(true);
    const [billingStreet, setBillingStreet] = useState("");
    const [billingHouseNumber, setBillingHouseNumber] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingZip, setBillingZip] = useState("");

    // Company Fields
    const [billingCompany, setBillingCompany] = useState("");
    const [billingDIC, setBillingDIC] = useState("");

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");

            if (profile.address) {
                const addr = profile.address;
                setPhone(addr.phone || "");
                setDeliveryStreet(addr.street || "");
                setDeliveryHouseNumber(addr.houseNumber || "");
                setDeliveryCity(addr.city || "");
                setDeliveryZip(addr.zip || "");

                if (addr.billing) {
                    const billing = addr.billing;
                    setBillingSame(billing.sameAsDelivery !== false);
                    setBillingStreet(billing.street || "");
                    setBillingHouseNumber(billing.houseNumber || "");
                    setBillingCity(billing.city || "");
                    setBillingZip(billing.zip || "");

                    setBillingCompany(billing.companyName || "");
                    setBillingDIC(billing.dic || "");
                }
            }
            setInitialLoad(false);
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const updates = {
            id: user!.id,
            full_name: fullName,
            address: {
                phone,
                street: deliveryStreet,
                houseNumber: deliveryHouseNumber,
                city: deliveryCity,
                zip: deliveryZip,
                billing: {
                    sameAsDelivery: billingSame,
                    isCompany: true,
                    companyName: billingCompany,
                    dic: billingDIC,
                    street: billingSame ? deliveryStreet : billingStreet,
                    houseNumber: billingSame ? deliveryHouseNumber : billingHouseNumber,
                    city: billingSame ? deliveryCity : billingCity,
                    zip: billingSame ? deliveryZip : billingZip,
                }
            },
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            toast({
                title: "Chyba při ukládání",
                description: error.message,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Vše uloženo! ⚡",
                description: "Váš firemní profil byl aktualizován.",
            });
        }
        setLoading(false);
    };

    if (initialLoad) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Načítám firemní profil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={handleSave} className="space-y-8 pb-10">
                
                {/* 1. Company & Contact Section */}
                <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-primary/5 pb-8 pt-10 px-8 sm:px-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-display font-black uppercase tracking-tight italic">Firemní údaje</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">Informace o vaší společnosti</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Název firmy</Label>
                                <Input id="company" value={billingCompany} onChange={e => setBillingCompany(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="Např. BoostUp s.r.o." />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="dic" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">DIČ</Label>
                                <Input id="dic" value={billingDIC} onChange={e => setBillingDIC(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="CZ12345678" />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Telefonní číslo</Label>
                                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="+420 777 666 555" />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="fullname" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Kontaktní osoba</Label>
                                <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="Jan Novák" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Delivery Address Section */}
                <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8 pt-10 px-8 sm:px-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-primary shadow-lg shadow-black/20">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-display font-black uppercase tracking-tight italic">Doručovací adresa</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kam máme zásilku doručit?</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 space-y-6">
                        <div className="grid md:grid-cols-12 gap-6">
                            <div className="space-y-3 md:col-span-8">
                                <Label htmlFor="street" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Ulice</Label>
                                <Input id="street" value={deliveryStreet} onChange={e => setDeliveryStreet(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                            </div>
                            <div className="space-y-3 md:col-span-4">
                                <Label htmlFor="houseNumber" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Číslo popisné</Label>
                                <Input id="houseNumber" value={deliveryHouseNumber} onChange={e => setDeliveryHouseNumber(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                            </div>
                            <div className="space-y-3 md:col-span-8">
                                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Město</Label>
                                <Input id="city" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                            </div>
                            <div className="space-y-3 md:col-span-4">
                                <Label htmlFor="zip" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">PSČ</Label>
                                <Input id="zip" value={deliveryZip} onChange={e => setDeliveryZip(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Billing Address Section */}
                <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8 pt-10 px-8 sm:px-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-black/5">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-display font-black uppercase tracking-tight italic">Sídlo společnosti</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Adresa pro fakturaci</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-2xl border border-white">
                                <input
                                    type="checkbox"
                                    id="billingSame"
                                    className="rounded border-primary/50 accent-primary w-4 h-4"
                                    checked={billingSame}
                                    onChange={(e) => setBillingSame(e.target.checked)}
                                />
                                <Label htmlFor="billingSame" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-muted-foreground">Shodná s doručovací</Label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={cn("p-8 sm:p-10 space-y-6 transition-all duration-500", !billingSame ? "opacity-100" : "opacity-50 pointer-events-none grayscale-[0.5]")}>
                        <div className="grid md:grid-cols-12 gap-6">
                            {!billingSame && (
                                <>
                                    <div className="space-y-3 md:col-span-8">
                                        <Label htmlFor="billingStreet" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Ulice</Label>
                                        <Input id="billingStreet" value={billingStreet} onChange={e => setBillingStreet(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                    <div className="space-y-3 md:col-span-4">
                                        <Label htmlFor="billingHouseNumber" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Číslo popisné</Label>
                                        <Input id="billingHouseNumber" value={billingHouseNumber} onChange={e => setBillingHouseNumber(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                    <div className="space-y-3 md:col-span-8">
                                        <Label htmlFor="billingCity" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Město</Label>
                                        <Input id="billingCity" value={billingCity} onChange={e => setBillingCity(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                    <div className="space-y-3 md:col-span-4">
                                        <Label htmlFor="billingZip" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">PSČ</Label>
                                        <Input id="billingZip" value={billingZip} onChange={e => setBillingZip(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pr-4">
                    <Button type="submit" disabled={loading} size="lg" className="h-16 px-10 rounded-[2rem] bg-black text-primary hover:bg-black/90 shadow-2xl shadow-black/20 font-display font-black uppercase tracking-widest italic group transition-all hover:scale-105 active:scale-95">
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Ukládám...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>Uložit změny</span>
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

