
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
 * Modern Login component using original brand colors:
 * Primary Green: #3a572c
 * Lime: #dfdf57
 * Background: #f9fafb
 */
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Use HEX codes to ensure consistency with brand colors
    const COLORS = {
        primary: "#3a572c",
        lime: "#dfdf57",
        bg: "#f9fafb"
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
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
            toast({
                title: "Chyba přihlášení",
                description: error.message === "Invalid login credentials" 
                    ? "Neplatný e-mail nebo heslo. Zkuste to znovu." 
                    : error.message || "Nastala neočekávaná chyba",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
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
                    to: email,
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
        if (!email) {
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
                    to: email,
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
        <main className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4 py-12">
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#3a572c] transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
                Zpět na web
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[420px]"
            >
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 bg-[#3a572c] rounded-xl flex items-center justify-center shadow-lg shadow-[#3a572c]/10">
                                <Zap className="w-6 h-6 text-[#dfdf57]" fill="#dfdf57" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Přihlášení</h1>
                        <p className="text-slate-500 text-sm">Vítejte zpět v BoostUp</p>
                    </div>

                    <AnimatePresence>
                        {successMessage && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#3a572c]/5 border border-[#3a572c]/10 rounded-xl p-4 flex items-start gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 text-[#3a572c] mt-0.5" />
                                <p className="text-sm font-medium text-[#3a572c]">{successMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="vas@email.cz"
                                    className="h-12 pl-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all shadow-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Heslo</Label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-semibold text-[#3a572c] hover:underline"
                                    disabled={loading}
                                >
                                    Zapomenuté heslo?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 pl-10 pr-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all shadow-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 bg-[#3a572c] hover:bg-[#2d4322] text-white font-bold rounded-xl shadow-lg shadow-[#3a572c]/10 transition-all flex items-center justify-center gap-2" 
                            disabled={loading}
                        >
                            {loading ? "Přihlašování..." : (
                                <>
                                    Přihlásit se <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold text-slate-400">
                            <span className="bg-white px-4">Nebo</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                        onClick={handleMagicLink}
                        disabled={loading}
                    >
                        <Zap className="w-4 h-4 text-[#3a572c]" />
                        Přihlásit se přes Magic Link
                    </Button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-500">
                            Nemáte účet?{" "}
                            <Link to="/register" className="text-[#3a572c] font-bold hover:underline">
                                Zaregistrujte se
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </main>
    );
};

export default Login;
