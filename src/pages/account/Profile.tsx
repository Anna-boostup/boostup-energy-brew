import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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
    const [deliveryCity, setDeliveryCity] = useState("");
    const [deliveryZip, setDeliveryZip] = useState("");

    // Billing Address
    const [billingSame, setBillingSame] = useState(true);
    const [isCompany, setIsCompany] = useState(false);
    const [billingCompany, setBillingCompany] = useState("");
    const [billingICO, setBillingICO] = useState("");
    const [billingDIC, setBillingDIC] = useState("");
    const [billingStreet, setBillingStreet] = useState("");
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
                setPhone(delivery.phone || ""); // Storing phone in delivery object for now
                setDeliveryStreet(delivery.street || "");
                setDeliveryCity(delivery.city || "");
                setDeliveryZip(delivery.zip || "");

                // Billing
                const billing = addr.billing || {};
                // Default to true if not specified, unless explicit false
                setBillingSame(billing.isSame !== false);
                setIsCompany(billing.isCompany === true);
                setBillingCompany(billing.company || "");
                setBillingICO(billing.ico || "");
                setBillingDIC(billing.dic || "");
                setBillingStreet(billing.street || "");
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
                title: "Uloženo",
                description: "Váš profil byl úspěšně aktualizován.",
            });
        }
        setLoading(false);
    };

    if (fetching) return <div className="text-center py-10">Načítám profil...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Osobní údaje</CardTitle>
                    <CardDescription>Tyto údaje se použijí pro předvyplnění objednávek.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Jméno a příjmení</Label>
                                <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Doručovací adresa</h3>
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
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-lg">Fakturační údaje</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="billingSame"
                                            checked={billingSame}
                                            onCheckedChange={(checked) => setBillingSame(checked as boolean)}
                                        />
                                        <Label htmlFor="billingSame" className="font-normal cursor-pointer text-sm">Stejná adresa</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <div className="grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                                    {/* Personal Fields (ICO option) */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="ico-personal">IČO (volitelné)</Label>
                                        <Input id="ico-personal" value={billingICO} onChange={e => setBillingICO(e.target.value)} placeholder="Pro podnikající fyzické osoby" />
                                    </div>

                                    {/* Separate Billing Address Fields (Only if billingSame is false) */}
                                    {!billingSame && (
                                        <>
                                            <div className="space-y-2 md:col-span-2 border-t pt-4 mt-2">
                                                <Label className="text-muted-foreground">Adresa sídla / fakturační adresa</Label>
                                            </div>
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
                                        </>
                                    )}
                                </div>
                            </div>
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
};

export default Profile;
