
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check if user is admin
            // We need to fetch profile explicitly here because AuthContext might not have updated yet
            // or we can just let the redirect happen and AdminLayout will catch it if not admin.
            // But better UX is to check here.

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role !== 'admin') {
                await supabase.auth.signOut();
                toast({
                    title: "Chyba oprávnění",
                    description: "Tento účet nemá administrátorská práva.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Vítejte v administraci",
                    description: "Přihlášení proběhlo úspěšně.",
                });
                navigate("/admin");
            }

        } catch (error: any) {
            toast({
                title: "Chyba přihlášení",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-slate-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
                    <p className="text-slate-500">Zadejte heslo pro přístup</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="vas@email.cz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Heslo</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
                        Vstoupit
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        (Demo heslo: admin123)
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
