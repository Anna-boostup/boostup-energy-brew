
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
 * Modern Login component using EXACT brand colors from index.css variables:
 * Primary: hsl(var(--olive))
 * Accent: hsl(var(--lime))
 * Background: hsl(var(--cream))
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

            // Immediate fetch of profile to determine redirect
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
                    ? "Neplatný e-mail nebo heslo. Zkontrolujte prosím své údaje a zkuste to znovu." 
                    : (error.message || "Nastala neočekávaná chyba při přihlašování."),
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
                description: "Pro obnovu hesla musíte vyplnit emailovou adresu.",
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Nepodařilo se odeslat email');
            }

            setSuccessMessage("Odkaz pro obnovu hesla byl odeslán na váš e-mail.");
            toast({
                title: "Odkaz odeslán",
                description: "Zkontrolujte svůj email pro instrukce k obnově hesla.",
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

    const handleMagicLink = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            toast({
                title: "Zadejte email",
                description: "Pro odeslání magického odkazu musíte vyplnit email.",
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Nepodařilo se odeslat magic link');
            }

            setSuccessMessage("Přihlašovací odkaz byl odeslán. Klikněte na něj ve svém e-mailu.");
            toast({
                title: "Odkaz odeslán! 🚀",
                description: "Zkontrolujte si emailovou schránku.",
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

    return (
        <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--cream))] px-4 py-12">
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--olive))] hover:opacity-70 transition-opacity"
            >
                <ChevronLeft className="w-4 h-4" />
                Zpět na web
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[440px]"
            >
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-card border border-olive/5 space-y-10">
                    <div className="text-center space-y-3">
                        <div className="flex justify-center mb-4">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-16 h-16 bg-[hsl(var(--olive))] rounded-2xl flex items-center justify-center shadow-button"
                            >
                                <Zap className="w-8 h-8 text-[hsl(var(--lime))]" fill="currentColor" />
                            </motion.div>
                        </div>
                        <h1 className="text-3xl font-black text-[hsl(var(--olive))] tracking-tight">PŘIHLÁŠENÍ</h1>
                        <p className="text-olive/60 font-medium text-sm">Vítejte zpět v boostup.cz</p>
                    </div>

                    <AnimatePresence>
                        {successMessage && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-olive/5 border border-olive/10 rounded-2xl p-4 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 text-olive mt-0.5" />
                                <p className="text-sm font-semibold text-olive leading-relaxed">{successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-olive/40 ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/30 group-focus-within:text-olive transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="vas@email.cz"
                                    className="h-14 pl-12 bg-[hsl(var(--cream))]/30 border-none rounded-2xl focus:ring-2 focus:ring-olive/10 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-olive/40">Heslo</Label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-[10px] font-bold uppercase tracking-widest text-olive/30 hover:text-olive transition-colors"
                                    disabled={loading}
                                >
                                    Zapomenuto?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive/30 group-focus-within:text-olive transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-14 pl-12 pr-12 bg-[hsl(var(--cream))]/30 border-none rounded-2xl focus:ring-2 focus:ring-olive/10 transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-olive/20 hover:text-olive transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-14 bg-[hsl(var(--olive))] hover:bg-[hsl(var(--olive-dark))] text-[hsl(var(--cream))] font-black text-lg rounded-2xl shadow-button transition-all flex items-center justify-center gap-3 active:scale-[0.98]" 
                            disabled={loading}
                        >
                            {loading ? "ČEKEJ..." : (
                                <>
                                    PŘIHLÁSIT SE <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-olive/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-olive/20">
                            <span className="bg-white px-6">NEBO</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-14 border-2 border-olive/5 hover:bg-olive hover:text-white rounded-2xl transition-all flex items-center justify-center gap-3 font-bold group"
                        onClick={handleMagicLink}
                        disabled={loading}
                    >
                        <Zap className="w-4 h-4 text-[hsl(var(--lime))] group-hover:text-white transition-colors" />
                        PŘIHLÁSIT MAGIC LINKEM
                    </Button>

                    <div className="text-center">
                        <p className="text-xs font-medium text-olive/40">
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
