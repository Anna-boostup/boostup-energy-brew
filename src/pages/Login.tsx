
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Eye, 
    EyeOff, 
    Mail, 
    Lock, 
    Zap, 
    ArrowRight, 
    CheckCircle2, 
    ChevronLeft
} from "lucide-react";

/**
 * Modern Login component - Refined Version (v9)
 * - Restored standard rounding (rounded-2xl / rounded-[2.5rem])
 * - Maintaining brand colors and security fixes
 * - Clean, integrated aesthetic
 */
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);

        const trimmedEmail = email.trim();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password,
            });

            if (error) throw error;

            toast({
                title: "Úspěšně přihlášeno",
                description: "Vítejte zpět!",
            });

            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('account_type, role')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    navigate("/account");
                    return;
                }

                if (profile?.account_type === 'admin' || profile?.role === 'admin') {
                    navigate("/admin", { replace: true });
                } else if (profile?.account_type === 'company') {
                    navigate("/company-account", { replace: true });
                } else {
                    navigate("/account", { replace: true });
                }
            }
        } catch (error: any) {
            console.error("Login error:", error);
            const isInvalidCredentials = error.message?.includes("Invalid login credentials");
            
            toast({
                title: "Chyba přihlášení",
                description: isInvalidCredentials 
                    ? "Neplatný e-mail nebo heslo. Zkuste to znovu." 
                    : (error.message || "Chyba při přihlašování."),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            toast({
                title: "Zadejte email",
                description: "Pro odeslání odkazu musíte vyplnit email.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: trimmedEmail,
                    type: 'magic_link'
                })
            });

            if (!response.ok) throw new Error('Nepodařilo se odeslat email');

            setSuccessMessage("Přihlašovací odkaz byl odeslán do vašeho e-mailu.");
            toast({
                title: "Odkaz odeslán!",
                description: "Zkontrolujte si schránku.",
            });
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

    const handleForgotPassword = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            toast({
                title: "Zadejte email",
                description: "Pro obnovu hesla vyplňte email.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: trimmedEmail,
                    type: 'reset_password'
                })
            });
            if (!response.ok) throw new Error('Chyba odesílání');
            setSuccessMessage("Odkaz pro obnovu hesla byl odeslán.");
        } catch (error: any) {
            toast({ title: "Chyba", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--cream))] px-4 relative">
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-olive/50 hover:text-olive transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                Zpět na web
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[440px] z-10"
            >
                <div className="bg-white/30 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/40 shadow-card space-y-10">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-2">
                            <div className="w-16 h-16 bg-olive rounded-2xl flex items-center justify-center shadow-button">
                                <Zap className="w-8 h-8 text-lime" fill="currentColor" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-olive tracking-tight">PŘIHLÁŠENÍ</h1>
                        <p className="text-olive/40 text-xs font-bold uppercase tracking-widest">Vítejte zpět v boostup.cz</p>
                    </div>

                    <AnimatePresence>
                        {successMessage && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-olive/5 border border-olive/10 rounded-2xl p-5 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 text-olive mt-0.5 shrink-0" />
                                <p className="text-sm font-bold text-olive leading-tight">{successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-olive/80 ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/50 group-focus-within:text-olive transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="vas@email.cz"
                                    className="h-14 pl-12 bg-white/60 border border-olive/10 rounded-2xl focus:bg-white focus:ring-2 focus:ring-olive/20 transition-all font-bold placeholder:text-olive/50 text-olive"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-olive/80">Heslo</Label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] font-black uppercase tracking-widest text-olive/60 hover:text-olive transition-colors"
                                    disabled={loading}
                                >
                                    Zapomenuto?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/50 group-focus-within:text-olive transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-14 pl-12 pr-12 bg-white/60 border border-olive/10 rounded-2xl focus:bg-white focus:ring-2 focus:ring-olive/20 transition-all font-bold placeholder:text-olive/50 text-olive"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-olive/50 hover:text-olive transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-14 bg-olive hover:bg-olive-dark text-cream font-black text-lg rounded-2xl shadow-button transition-all active:scale-[0.98]" 
                            disabled={loading}
                        >
                            {loading ? "Zpracovávám..." : "PŘIHLÁSIT SE"}
                        </Button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-olive/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black tracking-widest text-olive/10">
                            <span className="bg-transparent px-4">NEBO</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-14 bg-white/20 border border-olive/5 hover:bg-olive hover:text-white rounded-2xl transition-all font-bold text-xs"
                        onClick={handleMagicLink}
                        disabled={loading}
                    >
                        <Zap className="w-4 h-4 text-lime mr-2" />
                        PŘIHLÁSIT SE MAGIC LINKEM
                    </Button>

                    <div className="text-center">
                        <p className="text-[10px] font-bold text-olive/30 uppercase tracking-widest">
                            Nemáte účet?{" "}
                            <Link to="/register" className="text-olive font-black hover:underline underline-offset-4">
                                ZAREGISTROVAT SE
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
};

export default Login;
