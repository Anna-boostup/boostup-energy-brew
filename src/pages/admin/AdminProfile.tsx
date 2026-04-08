import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Save, Shield, ShoppingBag, RefreshCw, Mail, Fingerprint } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountOrders from "@/pages/account/Orders";
import Subscriptions from "@/pages/account/Subscriptions";
import { Badge } from "@/components/ui/badge";

const AdminProfile = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Profile info state
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSavingProfile(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: fullName })
                .eq("id", user.id);
            if (error) throw error;
            toast({ title: "Profil uložen", description: "Vaše jméno bylo úspěšně aktualizováno." });
        } catch (error: any) {
            toast({ title: "Chyba", description: error.message, variant: "destructive" });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({ title: "Hesla se neshodují", description: "Nové heslo a potvrzení musí být stejné.", variant: "destructive" });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: "Heslo je příliš krátké", description: "Heslo musí mít alespoň 8 znaků.", variant: "destructive" });
            return;
        }

        setIsChangingPassword(true);
        try {
            // Re-authenticate with current password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || "",
                password: currentPassword,
            });
            if (signInError) throw new Error("Aktuální heslo je nesprávné.");

            // Then update password
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast({ title: "Heslo změněno", description: "Vaše heslo bylo úspěšně aktualizováno." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast({ title: "Chyba při změně hesla", description: error.message, variant: "destructive" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="space-y-16 pb-32 animate-in fade-in duration-1000">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-start gap-8">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-lime/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield className="w-12 h-12 text-lime relative z-10" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-6xl font-black text-olive-dark tracking-tighter font-display uppercase italic leading-none">Můj Profil</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[10px]">
                                Centrální správa administrátorského účtu
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-12">
                <div className="p-2 bg-olive-dark rounded-[2.5rem] w-full md:w-fit shadow-2xl">
                    <TabsList className="bg-transparent h-auto p-1 gap-2 flex flex-wrap">
                        <TabsTrigger value="profile" className="gap-3 px-10 py-5 rounded-[2.2rem] font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-lime data-[state=active]:text-olive-dark transition-all duration-500 border-none shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20">
                            <User className="w-4 h-4" />
                            <span>Profil & Zabezpečení</span>
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="gap-3 px-10 py-5 rounded-[2.2rem] font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-lime data-[state=active]:text-olive-dark transition-all duration-500 border-none shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Historie Nákupů</span>
                        </TabsTrigger>
                        <TabsTrigger value="subscriptions" className="gap-3 px-10 py-5 rounded-[2.2rem] font-black uppercase text-[10px] tracking-[0.2em] text-white/40 data-[state=active]:bg-lime data-[state=active]:text-olive-dark transition-all duration-500 border-none shadow-none data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20">
                            <RefreshCw className="w-4 h-4" />
                            <span>Aktivní Předplatné</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-0">
                    {/* Profile Info Card */}
                    <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl h-full flex flex-col">
                        <div className="bg-olive-dark p-10 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-lime/10 rounded-xl">
                                    <Fingerprint className="w-6 h-6 text-lime" />
                                </div>
                                <h3 className="text-2xl font-black text-white font-display uppercase italic tracking-tight">Osobní údaje</h3>
                            </div>
                            <p className="text-lime/40 font-black uppercase tracking-[0.2em] text-[10px]">Aktualizace jména a informací o roli</p>
                        </div>
                        <div className="p-10 flex-1">
                            <form onSubmit={handleSaveProfile} className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">E-mailová adresa</Label>
                                    <div className="relative group/input">
                                        <Input
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="h-16 pl-14 rounded-2xl border-none bg-olive-dark/5 text-olive-dark/60 font-medium cursor-not-allowed italic"
                                        />
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-dark/20" />
                                    </div>
                                    <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest pl-1">Primární email nelze v administraci měnit.</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">Plné jméno</Label>
                                    <div className="relative group/input">
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Vaše jméno"
                                            className="h-16 pl-14 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-slate-200/50 focus-visible:ring-lime focus-visible:border-lime transition-all font-display font-black text-lg text-olive-dark"
                                        />
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-dark/20 group-focus-within/input:text-lime transition-colors" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">Systémová Role</Label>
                                    <div className="p-4 bg-cream/50rounded-[1.5rem] border border-olive/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                                            <span className="font-display font-black text-olive-dark uppercase italic text-lg">{profile?.role || "Administrátor"}</span>
                                        </div>
                                        <Badge className="bg-olive-dark text-lime font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-lg">Verified</Badge>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isSavingProfile}
                                    className="w-full h-16 bg-olive-dark hover:bg-black text-lime font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.02] active:scale-95 gap-3"
                                >
                                    {isSavingProfile ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Uložit změny v profilu
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Password Change Card */}
                    <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl h-full flex flex-col">
                        <div className="bg-olive-dark p-10 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-lime/10 rounded-xl">
                                    <Lock className="w-6 h-6 text-lime" />
                                </div>
                                <h3 className="text-2xl font-black text-white font-display uppercase italic tracking-tight">Zabezpečení</h3>
                            </div>
                            <p className="text-lime/40 font-black uppercase tracking-[0.2em] text-[10px]">Aktualizace hesla a ochrana klíče</p>
                        </div>
                        <div className="p-10 flex-1">
                            <form onSubmit={handleChangePassword} className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="currentPassword" title="Aktuální heslo" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">Současné heslo</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-16 px-6 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-slate-200/50 focus-visible:ring-lime transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="newPassword" title="Nové heslo" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">Nové heslo</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimálně 8 znaků"
                                        className="h-16 px-6 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-slate-200/50 focus-visible:ring-lime transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" title="Potvrzení hesla" className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark pl-1">Potvrdit nové heslo</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Zopakujte heslo"
                                        className="h-16 px-6 rounded-2xl border-2 border-transparent bg-white shadow-xl shadow-slate-200/50 focus-visible:ring-lime transition-all"
                                        required
                                    />
                                    {newPassword && confirmPassword && (
                                        <div className="flex items-center gap-2 pl-1">
                                            {newPassword !== confirmPassword ? (
                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Hesla se neshodují</p>
                                            ) : (
                                                <p className="text-[10px] text-lime-dark font-bold uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                                                    <Fingerprint className="w-3 h-3" />
                                                    Hesla jsou identická
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
                                    className="w-full h-16 bg-olive-dark hover:bg-black text-lime font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.02] active:scale-95 gap-3"
                                >
                                    {isChangingPassword ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                    Aktualizovat heslo
                                </Button>
                            </form>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="glass-card rounded-[3.5rem] p-4 overflow-hidden border border-white/40 shadow-2xl">
                        <AccountOrders />
                    </div>
                </TabsContent>

                <TabsContent value="subscriptions" className="mt-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="glass-card rounded-[3.5rem] p-4 overflow-hidden border border-white/40 shadow-2xl">
                        <Subscriptions />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminProfile;
