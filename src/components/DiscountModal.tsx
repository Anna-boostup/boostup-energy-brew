
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DiscountModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already seen the popup or is logged in (simplified check for now)
        const hasSeenPopup = localStorage.getItem("hasSeenDiscountPopup");
        const isLoggedIn = false; // logic to check auth state if accessible, or just rely on local storage for now

        if (!hasSeenPopup && !isLoggedIn) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000); // Show after 3 seconds

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenDiscountPopup", "true");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-secondary/30 border-2 border-primary/20">
                <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    {/* Close button handled by Dialog primitive usually, but custom if needed */}
                </div>
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Gift className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-display font-bold">
                        Získejte 10% slevu!
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Připojte se k BoostUp komunitě a získejte okamžitou slevu na vaši první objednávku.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="bg-background/50 p-4 rounded-xl text-center border border-border/50">
                        <p className="text-sm font-bold text-muted-foreground mb-1">Váš kód po registraci:</p>
                        <div className="text-xl font-mono font-bold text-primary tracking-widest">BOOST10</div>
                    </div>

                    <Link to="/register" onClick={handleClose}>
                        <Button className="w-full font-bold text-lg h-12">
                            Chci slevu
                        </Button>
                    </Link>

                    <Button variant="ghost" onClick={handleClose} className="text-muted-foreground text-xs">
                        Ne, děkuji
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DiscountModal;
