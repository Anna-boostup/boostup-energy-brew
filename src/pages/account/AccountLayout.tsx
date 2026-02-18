import { Link, Outlet, useLocation } from "react-router-dom";
import { User, Package, LogOut, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const AccountLayout = () => {
    const location = useLocation();
    const { signOut } = useAuth();

    const navigation = [
        { name: "Můj profil", href: "/account/profile", icon: User },
        { name: "Moje objednávky", href: "/account/orders", icon: Package },
        { name: "Moje předplatné", href: "/account/subscriptions", icon: RefreshCw },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold font-display mb-8">Můj účet</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-4">
                    <nav className="flex flex-col gap-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            );
                        })}

                        <Button
                            variant="ghost"
                            className="justify-start gap-3 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-4"
                            onClick={() => signOut()}
                        >
                            <LogOut className="w-4 h-4" />
                            Odhlásit se
                        </Button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-[500px]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AccountLayout;
