import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Building2 } from "lucide-react";

export default function CompanyProfile() {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    // Delivery Address
    const [deliveryStreet, setDeliveryStreet] = useState("");
    const [deliveryCity, setDeliveryCity] = useState("");
    const [deliveryZip, setDeliveryZip] = useState("");

    // Billing
    const [billingSame, setBillingSame] = useState(true);
    const [billingStreet, setBillingStreet] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingZip, setBillingZip] = useState("");

    // Company Fields (Always enabled and required)
    const [billingCompany, setBillingCompany] = useState("");
    const [billingDIC, setBillingDIC] = useState("");
    // ICO removed for company as per requirements

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || "");

            if (profile.address) {
                setPhone(profile.address.phone || "");
                setDeliveryStreet(profile.address.street || "");
                setDeliveryCity(profile.address.city || "");
                setDeliveryZip(profile.address.zip || "");

                if (profile.address.billing) {
                    setBillingSame(profile.address.billing.sameAsDelivery);
                    setBillingStreet(profile.address.billing.street || "");
                    setBillingCity(profile.address.billing.city || "");
                    setBillingZip(profile.address.billing.zip || "");

                    setBillingCompany(profile.address.billing.companyName || "");
                    setBillingDIC(profile.address.billing.dic || "");
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
            // account_type is immutable/persistent from registration
            address: {
                phone,
                street: deliveryStreet,
                city: deliveryCity,
                zip: deliveryZip,
                billing: {
                    sameAsDelivery: billingSame,
                    isCompany: true, // Always true for Company Profile
                    companyName: billingCompany,
                    dic: billingDIC,
                    // ICO is not stored/used for company purchased in this mode
                    street: billingSame ? deliveryStreet : billingStreet,
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
                title: "Uloženo",
                description: "Váš firemní profil byl aktualizován.",
            });
        }
        setLoading(false);
    };

    if (initialLoad) {
        return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Firemní účet</h1>

            <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Nastavení firemního profilu
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSave} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Kontaktní osoba</Label>
                                <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Firemní údaje</h3>
                            {/* Always visible company fields */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="company">Název firmy</Label>
                                    <Input id="company" value={billingCompany} onChange={e => setBillingCompany(e.target.value)} placeholder="Např. BoostUp s.r.o." required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="dic">DIČ</Label>
                                    <Input id="dic" value={billingDIC} onChange={e => setBillingDIC(e.target.value)} placeholder="CZ..." required />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Doručovací adresa</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="street">Ulice a číslo popisné</Label>
                                    <Input id="street" value={deliveryStreet} onChange={e => setDeliveryStreet(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Město</Label>
                                    <Input id="city" value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">PSČ</Label>
                                    <Input id="zip" value={deliveryZip} onChange={e => setDeliveryZip(e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Fakturační adresa</h3>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="billingSame"
                                        className="rounded border-border"
                                        checked={billingSame}
                                        onChange={(e) => setBillingSame(e.target.checked)}
                                    />
                                    <Label htmlFor="billingSame" className="font-normal cursor-pointer text-sm">Shodná s doručovací</Label>
                                </div>
                            </div>

                            {!billingSame && (
                                <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="billingStreet">Ulice a číslo popisné</Label>
                                        <Input id="billingStreet" value={billingStreet} onChange={e => setBillingStreet(e.target.value)} required={!billingSame} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billingCity">Město</Label>
                                        <Input id="billingCity" value={billingCity} onChange={e => setBillingCity(e.target.value)} required={!billingSame} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billingZip">PSČ</Label>
                                        <Input id="billingZip" value={billingZip} onChange={e => setBillingZip(e.target.value)} required={!billingSame} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} size="lg">
                                {loading ? "Ukládám..." : "Uložit změny"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
