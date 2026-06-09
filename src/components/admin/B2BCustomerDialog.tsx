import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventory, B2BCustomer } from "@/context/InventoryContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    customer: B2BCustomer | null;
}

export const B2BCustomerDialog = ({ isOpen, onClose, customer }: Props) => {
    const { addB2BCustomer, updateB2BCustomer } = useInventory();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isSearchingAres, setIsSearchingAres] = useState(false);

    const [companyName, setCompanyName] = useState("");
    const [ico, setIco] = useState("");
    const [dic, setDic] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [houseNumber, setHouseNumber] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");

    useEffect(() => {
        if (customer) {
            setCompanyName(customer.company_name);
            setIco(customer.ico);
            setDic(customer.dic || "");
            setEmail(customer.email || "");
            setPhone(customer.phone || "");
            
            // Try to split street and houseNumber if there's a house number at the end
            let streetStr = customer.street || "";
            let houseNumberStr = "";
            const streetMatch = streetStr.match(/(.*?)\s+(\d+[/\d]*\w*)$/);
            if (streetMatch) {
                streetStr = streetMatch[1];
                houseNumberStr = streetMatch[2];
            }
            setStreet(streetStr);
            setHouseNumber(houseNumberStr);
            
            setCity(customer.city || "");
            setZip(customer.zip || "");
        } else {
            setCompanyName("");
            setIco("");
            setDic("");
            setEmail("");
            setPhone("");
            setStreet("");
            setHouseNumber("");
            setCity("");
            setZip("");
        }
    }, [customer, isOpen]);

    const handleAresSearch = async () => {
        const cleaned = ico.trim();
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
            setCompanyName(data.companyName || "");
            setDic(data.dic || "");
            setStreet(data.street || "");
            setHouseNumber(data.houseNumber || "");
            setCity(data.city || "");
            setZip(data.zip || "");
            toast({ title: "Úspěch", description: "Údaje byly načteny z registru ARES." });
        } catch (err: any) {
            toast({ title: "ARES Vyhledávání", description: err.message, variant: "destructive" });
        } finally {
            setIsSearchingAres(false);
        }
    };

    const handleSave = async () => {
        if (!companyName || !ico) {
            toast({ title: "Chyba", description: "Název firmy a IČO jsou povinné.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const fullStreet = street.trim() + (houseNumber.trim() ? ` ${houseNumber.trim()}` : "");
            const data = {
                company_name: companyName.trim(),
                ico: ico.trim(),
                dic: dic.trim() || null,
                email: email.trim() || null,
                phone: phone.trim() || null,
                street: fullStreet.trim() || null,
                city: city.trim() || null,
                zip: zip.trim() || null
            };

            let success = false;
            if (customer) {
                success = await updateB2BCustomer(customer.id, data);
            } else {
                success = await addB2BCustomer(data);
            }

            if (success) {
                toast({
                    title: "Uloženo",
                    description: `Partner ${companyName} byl úspěšně uložen.`,
                });
                onClose();
            } else {
                throw new Error("Nepodařilo se uložit partnera do databáze.");
            }
        } catch (error: any) {
            toast({
                title: "Chyba",
                description: error.message || "Uložení se nezdařilo.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-olive-dark font-black tracking-tight text-xl">
                        {customer ? "Upravit B2B odběratele" : "Nový B2B odběratel"}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-premium">
                    <div className="grid gap-2">
                        <Label htmlFor="ico">IČO *</Label>
                        <div className="flex gap-2">
                            <Input
                                id="ico"
                                value={ico}
                                onChange={(e) => setIco(e.target.value)}
                                placeholder="např. 26955768"
                                className="bg-white"
                            />
                            <Button
                                type="button"
                                disabled={isSearchingAres}
                                onClick={handleAresSearch}
                                className="bg-olive-dark text-white hover:bg-olive-dark/90 px-4 gap-2 flex items-center font-bold"
                            >
                                {isSearchingAres ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                ARES
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="companyName">Název firmy *</Label>
                        <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Zadejte název firmy..."
                            className="bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="dic">DIČ (volitelně)</Label>
                            <Input
                                id="dic"
                                value={dic}
                                onChange={(e) => setDic(e.target.value)}
                                placeholder="např. CZ26955768"
                                className="bg-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="firmamail@firma.cz"
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="např. +420 511 205 310"
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="street">Ulice</Label>
                            <Input
                                id="street"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="Purkyňova"
                                className="bg-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="houseNumber">Č. popisné</Label>
                            <Input
                                id="houseNumber"
                                value={houseNumber}
                                onChange={(e) => setHouseNumber(e.target.value)}
                                placeholder="649/127"
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">Město</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Brno"
                                className="bg-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zip">PSČ</Label>
                            <Input
                                id="zip"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                placeholder="61200"
                                className="bg-white"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl font-bold">
                        Zrušit
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !companyName || !ico} className="bg-lime text-olive-dark hover:bg-lime/80 rounded-xl font-bold">
                        {loading ? "Ukládám..." : "Uložit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
