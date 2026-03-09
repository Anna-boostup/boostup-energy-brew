
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";

const Logout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
            <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl space-y-8 text-center animate-fade-up">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <LogOut className="w-10 h-10 text-primary" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-display font-bold text-foreground">Byli jste odhlášeni</h1>
                    <p className="text-muted-foreground text-lg">
                        Děkujeme za návštěvu. Váš účet byl bezpečně odhlášen.
                    </p>
                </div>

                <div className="pt-4 space-y-4">
                    <Button asChild className="w-full py-6 rounded-full text-lg font-bold shadow-button hover:scale-105 transition-all">
                        <Link to="/">
                            <Home className="w-5 h-5 mr-2" />
                            Zpět na hlavní stránku
                        </Link>
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Chcete se znovu přihlásit?{" "}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Přihlásit se
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logout;
