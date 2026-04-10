import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, User as UserIcon, Building2, CreditCard, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Profile = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Profile Data
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    // Delivery Address
    const [deliveryStreet, setDeliveryStreet] = useState("");
    const [deliveryHouseNumber, setDeliveryHouseNumber] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");
    const [deliveryZip, setDeliveryZip] = useState("");

    // Billing Address
    const [billingSame, setBillingSame] = useState(true);
    const [isCompany, setIsCompany] = useState(false);
    const [billingCompany, setBillingCompany] = useState("");
    const [billingICO, setBillingICO] = useState("");
    const [billingDIC, setBillingDIC] = useState("");
    const [billingStreet, setBillingStreet] = useState("");
    const [billingHouseNumber, setBillingHouseNumber] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingZip, setBillingZip] = useState("");

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                setFullName(data.full_name || "");

                // Parse Address JSONB
                const addr = data.address || {};

                // Delivery
                const delivery = addr.delivery || {};
                setPhone(delivery.phone || "");
                setDeliveryStreet(delivery.street || "");
                setDeliveryHouseNumber(delivery.houseNumber || "");
                setDeliveryCity(delivery.city || "");
                setDeliveryZip(delivery.zip || "");

                // Billing
                const billing = addr.billing || {};
                setBillingSame(billing.isSame !== false);
                setIsCompany(billing.isCompany === true);
                setBillingCompany(billing.company || "");
                setBillingICO(billing.ico || "");
                setBillingDIC(billing.dic || "");
                setBillingStreet(billing.street || "");
                setBillingHouseNumber(billing.houseNumber || "");
                setBillingCity(billing.city || "");
                setBillingZip(billing.zip || "");
            }
            setFetching(false);
        };

        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const addressData = {
            delivery: {
                street: deliveryStreet,
                houseNumber: deliveryHouseNumber,
                city: deliveryCity,
                zip: deliveryZip,
                phone: phone,
            },
            billing: {
                isSame: billingSame,
                isCompany: isCompany,
                company: billingCompany,
                ico: billingICO,
                dic: billingDIC,
                street: billingSame ? deliveryStreet : billingStreet,
                houseNumber: billingSame ? deliveryHouseNumber : billingHouseNumber,
                city: billingSame ? deliveryCity : billingCity,
                zip: billingSame ? deliveryZip : billingZip,
            }
        };

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                address: addressData,
            })
            .eq('id', user?.id);

        if (error) {
            toast({
                title: "Chyba při ukládání",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Vše uloženo! ⚡",
                description: "Váš profil byl úspěšně aktualizován.",
            });
        }
        setLoading(false);
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Načítám váš profil...</p>
        </div>
    );

    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={handleSave} className="space-y-8 pb-10">
                {/* 1. Personal Info Section */}
                <Card className="border-none shadow-2xl bg-white/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-primary/5 pb-8 pt-10 px-8 sm:px-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-display font-black uppercase tracking-tight italic">Osobní údaje</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary">Základní kontaktní informace</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="fullname" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Jméno a příjmení</Label>
                                <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="Např. Jan Novák" />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Telefonní číslo</Label>
                                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="+420 777 666 555" />
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
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kam vám máme poslat zásilku?</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 space-y-6">
                        <div className="grid md:grid-cols-12 gap-6">
                            <div className="space-y-3 md:col-span-8">
                                <Label htmlFor="street" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Ulice</Label>
                                <Input id="street" value={deliveryStreet} onChange={e => setDeliveryStreet(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="Např. Smetanovo nábřeží" />
                            </div>
                            <div className="space-y-3 md:col-span-4">
                                <Label htmlFor="houseNumber" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Číslo popisné</Label>
                                <Input id="houseNumber" value={deliveryHouseNumber} onChange={e => setDeliveryHouseNumber(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="123/1" />
                            </div>
                            <div className="space-y-3 md:col-span-8">
                                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Město</Label>
                                <Input id="city" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="Praha" />
                            </div>
                            <div className="space-y-3 md:col-span-4">
                                <Label htmlFor="zip" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">PSČ</Label>
                                <Input id="zip" value={deliveryZip} onChange={e => setDeliveryZip(e.target.value)} required className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="110 00" />
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
                                    <CardTitle className="text-2xl font-display font-black uppercase tracking-tight italic">Fakturační údaje</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Údaje pro daňový doklad</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-2xl border border-white">
                                <Checkbox
                                    id="billingSame"
                                    checked={billingSame}
                                    onCheckedChange={(checked) => setBillingSame(checked as boolean)}
                                    className="rounded-md border-primary/50 data-[state=checked]:bg-primary"
                                />
                                <Label htmlFor="billingSame" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-muted-foreground">Stejná jako doručovací</Label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={cn("p-8 sm:p-10 space-y-6 transition-all duration-500", !billingSame ? "opacity-100" : "opacity-50 pointer-events-none grayscale-[0.5]")}>
                        <div className="grid md:grid-cols-12 gap-6">
                            {/* Company Fields (Always available but optional in personal profile) */}
                            <div className="md:col-span-12 space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="ico-personal" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">IČO (volitelné)</Label>
                                    <Input id="ico-personal" value={billingICO} onChange={e => setBillingICO(e.target.value)} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" placeholder="Pro samostatně výdělečné osoby" />
                                </div>
                            </div>

                            {!billingSame && (
                                <>
                                    <div className="space-y-3 md:col-span-8">
                                        <Label htmlFor="billingStreet" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Fakturační ulice</Label>
                                        <Input id="billingStreet" value={billingStreet} onChange={e => setBillingStreet(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                    <div className="space-y-3 md:col-span-4">
                                        <Label htmlFor="billingHouseNumber" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Číslo popisné</Label>
                                        <Input id="billingHouseNumber" value={billingHouseNumber} onChange={e => setBillingHouseNumber(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                    <div className="space-y-3 md:col-span-8">
                                        <Label htmlFor="billingCity" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Fakturační město</Label>
                                        <Input id="billingCity" value={billingCity} onChange={e => setBillingCity(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                    <div className="space-y-3 md:col-span-4">
                                        <Label htmlFor="billingZip" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground">Fakturační PSČ</Label>
                                        <Input id="billingZip" value={billingZip} onChange={e => setBillingZip(e.target.value)} required={!billingSame} className="h-14 rounded-2xl border-none bg-white shadow-inner focus-visible:ring-primary/50 font-bold" />
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button Floating or Bottom */}
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
};

export default Profile;

