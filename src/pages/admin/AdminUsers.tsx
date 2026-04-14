import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Search, Users, Shield, Tag, Calendar, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
    assigned_promo_code: string | null;
}

interface PromoCode {
    id: string;
    code: string;
    discount_percent: number;
}

const AdminUsers = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch profiles
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // Fetch active promo codes
            const { data: codesData, error: codesError } = await supabase
                .from('promo_codes')
                .select('id, code, discount_percent')
                .eq('is_active', true);

            if (codesError) throw codesError;

            setProfiles(profilesData || []);
            setPromoCodes(codesData || []);
        } catch (error: any) {
            console.error("Error fetching admin users data:", error);
            toast.error("Chyba při načítání dat uživatelů");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdatePersonalCode = async (userId: string, code: string | null) => {
        try {
            setUpdatingId(userId);
            const { error } = await supabase
                .from('profiles')
                .update({ assigned_promo_code: code === "none" ? null : code })
                .eq('id', userId);

            if (error) throw error;

            setProfiles(profiles.map(p => p.id === userId ? { ...p, assigned_promo_code: code === "none" ? null : code } : p));
            toast.success("Osobní slevový kód byl aktualizován");
        } catch (error: any) {
            console.error("Error updating user code:", error);
            toast.error("Chyba při aktualizaci kódu");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredProfiles = profiles.filter(p => 
        (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 sm:space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-wrap">
                <div className="space-y-2 sm:space-y-3">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">
                        Zákazníci
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-olive-dark/70 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] leading-none">
                            Správa registrovaných uživatelů a jejich slev
                        </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-olive-dark/40" />
                    <Input 
                        placeholder="Hledat jméno nebo email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 bg-admin-canvas border-olive-dark/10 rounded-2xl pl-12 font-bold"
                    />
                </div>
            </div>

            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-admin-canvas shadow-olive/10 overflow-hidden">
                <CardHeader className="bg-olive-dark p-8 sm:p-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Users className="w-5 h-5 text-lime" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-black text-white font-display uppercase italic">Seznam uživatelů</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 gap-6">
                            <Loader2 className="h-12 w-12 animate-spin text-olive-dark" />
                            <p className="text-olive-dark font-black uppercase text-xs tracking-widest">Načítání uživatelů...</p>
                        </div>
                    ) : filteredProfiles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-admin-canvas/60 border-b border-olive/8">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4 px-10">Zákazník</TableHead>
                                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4">Role / Typ</TableHead>
                                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4">Registrace</TableHead>
                                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4">Přiřazený Slevový Kód</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProfiles.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-admin-canvas transition-colors border-b border-olive/8 group">
                                            <TableCell className="py-6 px-10">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-olive-dark uppercase text-sm tracking-tight">{user.full_name || "Host"}</span>
                                                    <span className="text-[10px] font-bold text-olive-dark/50">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {user.role === 'admin' ? (
                                                        <Badge className="bg-olive-dark text-white border-none rounded-lg text-[8px] uppercase font-black px-2">Admin</Badge>
                                                    ) : (
                                                        <Badge className="bg-olive-dark/5 text-olive-dark border-none rounded-lg text-[8px] uppercase font-black px-2">User</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-olive-dark/60 uppercase">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(user.created_at), "d. MMMM yyyy", { locale: cs })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-10">
                                                <div className="flex items-center gap-3">
                                                    <Select
                                                        disabled={updatingId === user.id}
                                                        value={user.assigned_promo_code || "none"}
                                                        onValueChange={(val) => handleUpdatePersonalCode(user.id, val)}
                                                    >
                                                        <SelectTrigger className="w-48 h-10 bg-white/50 border-olive-dark/10 text-olive-dark font-black uppercase text-[10px] rounded-xl focus:ring-lime">
                                                            <SelectValue placeholder="Bez slevy" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-admin-canvas border-olive-dark/10 text-olive-dark font-bold uppercase text-[10px] rounded-xl">
                                                            <SelectItem value="none">Bez slevy</SelectItem>
                                                            {promoCodes.map(code => (
                                                                <SelectItem key={code.id} value={code.code}>
                                                                    {code.code} (-{code.discount_percent}%)
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {updatingId === user.id && <Loader2 className="w-4 h-4 animate-spin text-olive-dark" />}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                             <Users className="w-16 h-16 mb-4" />
                             <p className="font-black uppercase tracking-widest text-xs">Žádní uživatelé nenalezeni</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsers;
