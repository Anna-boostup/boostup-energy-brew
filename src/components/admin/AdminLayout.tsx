import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, profile, loading } = useAuth();

    if (loading) {
        return <div className="p-8">Ověřuji oprávnění...</div>;
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
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

    const handleLogout = () => {
        localStorage.removeItem("adminAuth");
        navigate("/admin/login");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Přehled", path: "/admin" },
        { icon: ShoppingCart, label: "Objednávky", path: "/admin/orders" },
        { icon: Package, label: "Sklad", path: "/admin/inventory" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="font-display font-bold text-2xl tracking-wider">BOOSTUP<span className="text-primary">.</span></h1>
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
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
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
