import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Save, Shield, ShoppingBag, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountOrders from "@/pages/account/Orders";
import Subscriptions from "@/pages/account/Subscriptions";

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
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Můj účet</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl w-full md:w-auto flex flex-wrap h-auto">
                    <TabsTrigger value="profile" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <User className="w-4 h-4" />
                        <span>Profil & Heslo</span>
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Moje objednávky</span>
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                        <span>Moje předplatné</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-8 max-w-2xl mt-0">
                    {/* Profile Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="w-5 h-5 text-muted-foreground" />
                                Osobní údaje
                            </CardTitle>
                            <CardDescription>Aktualizujte své zobrazované jméno</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="bg-slate-50 text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">E-mail nelze změnit.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="fullName">Celé jméno</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Vaše jméno a příjmení"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Role</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                                            {profile?.role || "admin"}
                                        </span>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isSavingProfile}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSavingProfile ? "Ukládám..." : "Uložit změny"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Password Change Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                                Změna hesla
                            </CardTitle>
                            <CardDescription>Pro změnu hesla musíte zadat aktuální heslo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="currentPassword">Aktuální heslo</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Vaše současné heslo"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="newPassword">Nové heslo</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimálně 8 znaků"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword">Potvrdit nové heslo</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Zopakujte nové heslo"
                                        required
                                    />
                                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-xs text-red-500">Hesla se neshodují</p>
                                    )}
                                    {newPassword && confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8 && (
                                        <p className="text-xs text-green-600">✓ Hesla se shodují</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={isChangingPassword || newPassword !== confirmPassword}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    {isChangingPassword ? "Měním heslo..." : "Změnit heslo"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="mt-0 space-y-6">
                    <AccountOrders />
                </TabsContent>

                <TabsContent value="subscriptions" className="mt-0 space-y-6">
                    <Subscriptions />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminProfile;
