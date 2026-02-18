
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast({
                title: "Chyba přihlášení",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Úspěšně přihlášeno",
                description: "Vítejte zpět!",
            });

            // Fetch profile to determine redirect
            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_type')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.account_type === 'company') {
                    navigate("/company-account");
                } else {
                    navigate("/account");
                }
            } else {
                navigate("/");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-primary">Přihlášení</h1>
                    <p className="text-muted-foreground">Vítejte zpět v BoostUp</p>
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
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Přihlašování..." : "Přihlásit se"}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Nebo</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        if (!email) {
                            toast({
                                title: "Zadejte email",
                                description: "Pro odeslání magického odkazu musíte vyplnit email.",
                                variant: "destructive",
                            });
                            return;
                        }
                        setLoading(true);
                        const { error } = await supabase.auth.signInWithOtp({
                            email,
                            options: {
                                emailRedirectTo: window.location.origin,
                            },
                        });
                        setLoading(false);

                        if (error) {
                            toast({
                                title: "Chyba",
                                description: error.message,
                                variant: "destructive",
                            });
                        } else {
                            toast({
                                title: "Odkaz odeslán! 🚀",
                                description: "Zkontrolujte si emailovou schránku.",
                            });
                        }
                    }}
                    disabled={loading}
                >
                    ⚡ Poslat přihlašovací odkaz (Magic Link)
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Nemáte účet?{" "}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Zaregistrujte se
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
