import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, FileText, Factory, Bell, User, HelpCircle, TrendingUp, Mail, ExternalLink, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useManufacture } from "@/context/ManufactureContext";
import logoGreen from "@/assets/logo-green.png";
import { AdminErrorBoundary } from "@/components/AdminErrorBoundary";


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
        { icon: Mail, label: "Zprávy", path: "/admin/messages" },
        { icon: FileText, label: "Obsah webu", path: "/admin/content" },
        { icon: TrendingUp, label: "Ceny a Statistiky", path: "/admin/pricing" },
        { icon: Sparkles, label: "Slevové kódy", path: "/admin/promo-codes" },
        { icon: User, label: "Můj účet", path: "/admin/profile" },
        { icon: HelpCircle, label: "Nápověda", path: "/admin/help" },
    ];

    return (
        <div className="min-h-screen bg-admin-canvas flex font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-olive-dark text-white p-4 flex items-center justify-between z-50 shadow-lg px-6">
                <Link to="/" className="font-display font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
                    BOOST<span className="text-lime">UP</span>
                </Link>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 sidebar-premium border-r-lime/10 text-white w-72 rounded-r-[3rem]">
                        <div className="p-8 border-b border-white/5">
                            <Link to="/" className="flex items-center">
                                <span className="font-display font-black text-2xl tracking-tighter">BOOST<span className="text-lime">UP</span></span>
                            </Link>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime/50 mt-2">Admin Engine</p>
                        </div>
                        <ul className="p-4 space-y-2" role="list">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        {item.isExternal ? (
                                            <a
                                                href={item.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5" />
                                                    {item.label}
                                                </div>
                                                <ExternalLink className="w-4 h-4 opacity-50" />
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    navigate(item.path);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                                    ? "bg-lime text-olive-dark font-black shadow-xl shadow-lime/20 scale-[1.02]"
                                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                                    } `}
                                                aria-current={isActive ? "page" : undefined}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5" />
                                                    {item.label}
                                                </div>
                                                {item.hasAlert && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" aria-label="Upozornění: Nízký stav zásob" />
                                                )}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
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
            <aside className="hidden md:flex flex-col w-72 sidebar-premium text-white fixed h-[calc(100vh-2rem)] my-4 ml-4 rounded-[3rem] shadow-2xl z-20 border border-white/5">
                <div className="p-10 pb-8 shrink-0">
                    <Link to="/" className="flex items-center group">
                        <span className="font-display font-black text-3xl tracking-tighter group-hover:scale-105 transition-transform duration-500">
                            BOOST<span className="text-lime">UP</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Admin Terminal</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <ul className="space-y-1.5" role="list">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    {item.isExternal ? (
                                        <a
                                            href={item.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                                <span className="text-sm">{item.label}</span>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 opacity-30 group-hover:opacity-60" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => navigate(item.path)}
                                            className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                                ? "bg-lime text-olive-dark font-black shadow-xl shadow-lime/20 scale-[1.05] z-10"
                                                : "text-white/50 hover:bg-white/5 hover:text-white hover:pl-7"
                                                } `}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? "text-olive-dark scale-110" : "text-white/30 group-hover:text-lime"}`} />
                                                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                            </div>
                                            {item.hasAlert && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" aria-label="Upozornění: Nízký stav zásob" />
                                            )}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="p-6 border-t border-white/5 space-y-3">
                    <Link 
                        to="/admin/profile" 
                        className={`px-4 py-4 flex items-center gap-4 rounded-[2rem] transition-all duration-300 border border-transparent ${location.pathname === '/admin/profile' ? 'bg-white/10 border-white/10' : 'hover:bg-white/5'}`}
                    >
                        <div className="w-11 h-11 rounded-2xl bg-lime flex items-center justify-center text-olive-dark font-black text-sm shadow-lg shadow-lime/20">
                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "A"}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-white truncate leading-tight uppercase tracking-widest">{profile?.full_name?.split(' ')[0] || "Admin"}</span>
                            <span className="text-[9px] font-bold text-white/30 truncate uppercase tracking-widest">{user?.email?.split('@')[0]}</span>
                        </div>
                    </Link>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-2xl h-12 px-6"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Odhlásit se</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-80 p-6 md:p-12 pt-28 md:pt-12 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <AdminErrorBoundary>
                        <Outlet />
                    </AdminErrorBoundary>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
