import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, FileText, Factory, Bell, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useManufacture } from "@/context/ManufactureContext";
import logoGreen from "@/assets/logo-green.png";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, profile, loading, signOut } = useAuth();
    const { materials } = useManufacture();

    if (loading) {
        return <div className="p-8">Ověřuji oprávnění...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (profile?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-red-500 font-bold">Nemáte oprávnění pro přístup do administrace.</p>
                <Link to="/">
                    <Button>Zpět na hlavní stránku</Button>
                </Link>
            </div>
        );
    }

    const handleLogout = async () => {
        await signOut();
        navigate("/logout", { replace: true });
    };

    const hasLowStockAlert = materials.some(m =>
        m.notifications_enabled && (
            m.quantity <= m.min_quantity ||
            (m.warning_quantity > 0 && m.quantity <= m.warning_quantity)
        )
    );

    const navItems = [
        { icon: LayoutDashboard, label: "Přehled", path: "/admin" },
        { icon: ShoppingCart, label: "Objednávky", path: "/admin/orders" },
        { icon: Package, label: "Sklad produktů", path: "/admin/inventory" },
        {
            icon: Factory,
            label: "Sklad výroby",
            path: "/admin/manufacture",
            hasAlert: hasLowStockAlert
        },
        { icon: FileText, label: "Obsah webu", path: "/admin/content" },
        { icon: User, label: "Můj profil", path: "/admin/profile" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex items-center justify-between z-50">
                <Link to="/" className="font-display font-bold text-xl tracking-wider hover:opacity-80 transition-opacity">BOOSTUP<span className="text-primary">.</span></Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 text-white w-72">
                        <div className="p-6 border-b border-slate-800">
                            <Link to="/" className="flex items-center">
                                <img src={logoGreen} alt="BoostUp" className="h-8 w-auto brightness-0 invert" />
                            </Link>
                            <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
                        </div>
                        <nav className="p-4 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            // Ideally close sheet here if controllable
                                        }}
                                        className={`w - full flex items - center justify - between px - 4 py - 3 rounded - xl transition - all ${isActive
                                            ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                            } `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </div>
                                        {item.hasAlert && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Odhlásit se
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 bg-slate-900 text-white fixed h-full shadow-xl z-10">
                <div className="p-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center">
                        <img src={logoGreen} alt="BoostUp" className="h-8 w-auto brightness-0 invert" />
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w - full flex items - center justify - between px - 4 py - 3 rounded - xl transition - all ${isActive
                                    ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    } `}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </div>
                                {item.hasAlert && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Odhlásit se
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
