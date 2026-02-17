
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple hardcoded check for demo purposes
        if (password === "admin123") {
            localStorage.setItem("adminAuth", "true");
            toast({
                title: "Vítejte v administraci",
                description: "Přihlášení proběhlo úspěšně.",
            });
            navigate("/admin");
        } else {
            toast({
                title: "Chyba přihlášení",
                description: "Nesprávné heslo.",
                variant: "destructive",
            });
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
                        <Label htmlFor="password">Heslo</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-center text-lg tracking-widest"
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
