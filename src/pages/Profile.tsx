
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate("/login");
                return;
            }

            setUser(user);

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.warn("Error fetching profile:", error);
            }

            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    ...profile,
                    updated_at: new Date(),
                });

            if (error) throw error;

            toast({
                title: "Profil aktualizován",
                description: "Vaše údaje byly úspěšně uloženy.",
            });
        } catch (error: any) {
            toast({
                title: "Chyba aktualizace",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
        toast({ title: "Odhlášeno", description: "Byli jste úspěšně odhlášeni." });
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Načítání profilu...</div>;
    }

    return (
        <div className="min-h-screen container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-display font-bold text-primary">Můj Profil</h1>
                    <Button variant="outline" onClick={handleLogout}>Odhlásit se</Button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label>Jméno a příjmení</Label>
                        <Input
                            value={profile?.full_name || ""}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        />
                    </div>

                    {profile?.account_type === "company" && (
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-bold text-lg">Firemní údaje</h3>
                            <div className="space-y-2">
                                <Label>Název firmy</Label>
                                <Input
                                    value={profile?.company_name || ""}
                                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>IČO</Label>
                                    <Input
                                        value={profile?.ico || ""}
                                        onChange={(e) => setProfile({ ...profile, ico: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>DIČ</Label>
                                    <Input
                                        value={profile?.dic || ""}
                                        onChange={(e) => setProfile({ ...profile, dic: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Ukládám..." : "Uložit změny"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
