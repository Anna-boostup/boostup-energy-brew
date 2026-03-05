
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [accountType, setAccountType] = useState<"personal" | "company">("personal");

    // Company fields
    const [companyName, setCompanyName] = useState("");
    const [ico, setIco] = useState("");
    const [dic, setDic] = useState("");

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        account_type: accountType,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create profile record
                const profileData = {
                    id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    account_type: accountType,
                    // Store company details in address.billing structure to match CompanyProfile logic
                    // and avoid needing new columns for now
                    address: {
                        billing: {
                            isCompany: accountType === "company",
                            companyName: accountType === "company" ? companyName : "",
                            ico: accountType === "company" ? ico : "",
                            dic: accountType === "company" ? dic : "",
                        }
                    }
                };

                const { error: profileError } = await supabase
                    .from("profiles")
                    .upsert(profileData);

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                }

                // 3. Trigger our branded confirmation email
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: email,
                            type: 'confirm_signup',
                            customerName: fullName
                        })
                    });
                } catch (emailError) {
                    console.error("Failed to trigger branded email:", emailError);
                    // We don't block registration if email trigger fails, 
                    // but it's good to know.
                }

                toast({
                    title: "Registrace úspěšná",
                    description: "Váš účet byl vytvořen. Nyní se můžete přihlásit.",
                });
                navigate("/login");
            }
        } catch (error: any) {
            toast({
                title: "Chyba registrace",
                description: error.message || "Něco se pokazilo.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-primary">Registrace</h1>
                    <p className="text-foreground/80">Vytvořte si účet a získejte výhody</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-3">
                        <Label className="text-foreground/90">Typ účtu</Label>
                        <RadioGroup defaultValue="personal" onValueChange={(v) => setAccountType(v as "personal" | "company")} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="personal" id="r1" />
                                <Label htmlFor="r1">Fyzická osoba</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="company" id="r2" />
                                <Label htmlFor="r2">Firma (B2B)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground/90">Jméno a příjmení</Label>
                        <Input
                            id="fullName"
                            placeholder="Jan Novák"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground/90">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="jan@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground/90">Heslo</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {accountType === "company" && (
                        <div className="space-y-4 pt-2 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-foreground/90">Název firmy</Label>
                                <Input
                                    id="companyName"
                                    placeholder="Moje Firma s.r.o."
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    required={accountType === "company"}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ico" className="text-foreground/90">IČO</Label>
                                    <Input
                                        id="ico"
                                        placeholder="12345678"
                                        value={ico}
                                        onChange={(e) => setIco(e.target.value)}
                                        required={accountType === "company"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dic" className="text-foreground/90">DIČ</Label>
                                    <Input
                                        id="dic"
                                        placeholder="CZ12345678"
                                        value={dic}
                                        onChange={(e) => setDic(e.target.value)}
                                        required={accountType === "company"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Registruji..." : "Vytvořit účet"}
                    </Button>
                </form>

                <div className="text-center text-sm text-foreground/80">
                    Již máte účet?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Přihlaste se
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Register;
