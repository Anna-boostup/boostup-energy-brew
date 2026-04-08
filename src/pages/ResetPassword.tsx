
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // Use onAuthStateChange to robustly detect when the recovery session is established
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state change in ResetPassword:", event, session?.user?.id);
            
            if (event === 'SIGNED_IN' || session) {
                // Session is active, user can change password
                return;
            }

            // If we don't have a session, double check one last time before redirecting
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                toast({
                    title: "Neplatný odkaz",
                    description: "Odkaz pro obnovu hesla je neplatný nebo jeho platnost vypršela.",
                    variant: "destructive",
                });
                navigate("/login");
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, toast]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Chyba",
                description: "Hesla se neshodují.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Příliš krátké heslo",
                description: "Heslo musí mít alespoň 6 znaků.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast({
                title: "Heslo změněno",
                description: "Vaše heslo bylo úspěšně aktualizováno. Nyní se můžete přihlásit.",
            });

            navigate("/login");
        } catch (error: any) {
            toast({
                title: "Chyba",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-primary">Nové heslo</h1>
                    <p className="text-foreground/80">Zadejte své nové přístupové heslo</p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground/90">Nové heslo</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground/90">Potvrzení hesla</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Ukládání..." : "Změnit heslo"}
                    </Button>
                </form>
            </div>
        </main>
    );
};

export default ResetPassword;
