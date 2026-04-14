import { useState, useEffect, Suspense } from "react";
import { Outlet, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, FileText, Factory, Bell, User, HelpCircle, TrendingUp, Mail, ExternalLink, Sparkles, ChevronRight, Activity, Pin, PinOff, PenTool, Users, Loader2, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useManufacture } from "@/context/ManufactureContext";
import logoGreen from "@/assets/logo-green.png";
import { AdminErrorBoundary } from "@/components/AdminErrorBoundary";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/context/ContentContext";
import { useInventory } from "@/context/InventoryContext";
import { format, subDays } from "date-fns";


const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, profile, loading, signOut } = useAuth();
    const { materials } = useManufacture();
    const { content } = useContent();
    // Fetch unread messages count
    const { orders = [] } = useInventory() || { orders: [] };

    // Fetch analytics and unread messages count
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(() => {
        const saved = localStorage.getItem("admin_sidebar_pinned");
        return saved === null ? true : saved === "true";
    });
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = isPinned || isHovered;

    const [unreadCount, setUnreadCount] = useState(0);
    const [stats, setStats] = useState({ visits: 0, orders: 0, conversion: 0 });

    useEffect(() => {
        localStorage.setItem("admin_sidebar_pinned", String(isPinned));
    }, [isPinned]);

    useEffect(() => {
        if (!user || profile?.role !== 'admin') return;

        const fetchData = async () => {
            try {
                // 1. Fetch Unread Messages
                const { count: msgCount } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_read', false);
                setUnreadCount(msgCount || 0);

                // 2. Fetch 30-day Analytics
                const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
                const { data: events, error: analyticError } = await supabase
                    .from("analytics_events")
                    .select("id")
                    .eq("event_type", "view")
                    .gte("created_at", thirtyDaysAgo);
                
                if (analyticError) throw analyticError;

                const visits = events?.length || 0;
                const recentOrders = orders.filter(o => o.status !== 'cancelled' && o.date && new Date(o.date) >= new Date(thirtyDaysAgo)).length;
                const conversion = visits > 0 ? (recentOrders / visits) * 100 : 0;

                setStats({ visits, orders: recentOrders, conversion });

            } catch (err) {
                console.error('Error fetching admin layout data:', err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [user, profile, orders.length]);

    // No full-screen loading guard here to prevent flicker
    // Logic will be handled inside return for skeleton/shell stability

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-admin-canvas flex flex-col items-center justify-center p-8 gap-6 animate-in fade-in duration-700">
                <div className="w-16 h-16 bg-olive-dark rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-soft">
                    <Sparkles className="w-8 h-8 text-lime" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olive-dark/40 animate-pulse">
                    {content?.admin?.auth?.verifying || "Verifying Access..."}
                </p>
            </div>
        );
    }

    if (profile?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-admin-canvas flex flex-col items-center justify-center p-8 gap-6 text-center">
                <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20">
                    <LogOut className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-olive-dark font-black uppercase tracking-widest">{content?.admin?.auth?.noPermission || "Access Denied"}</p>
                </div>
                <Link to="/">
                    <Button className="bg-olive-dark hover:bg-olive-dark/90 text-white rounded-2xl px-8 h-12 font-bold uppercase tracking-widest text-xs">
                        {content?.admin?.auth?.backToHome || "Back to Home"}
                    </Button>
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
        { icon: LayoutDashboard, label: content?.admin?.navigation?.dashboard, path: "/admin" },
        { icon: ShoppingCart, label: content?.admin?.navigation?.orders, path: "/admin/orders" },
        { icon: Package, label: content?.admin?.navigation?.inventory, path: "/admin/inventory" },
        {
            icon: Factory,
            label: content?.admin?.navigation?.manufacture,
            path: "/admin/manufacture",
            hasAlert: hasLowStockAlert
        },
        { icon: Mail, label: content?.admin?.navigation?.messages, path: "/admin/messages" },
        { icon: Users, label: "Zákazníci", path: "/admin/users" },
        { icon: Mail, label: content?.admin?.navigation?.emails, path: "/admin/emails" },
        { icon: PenTool, label: "Blog", path: "/admin/blog" },
        { icon: FileText, label: content?.admin?.navigation?.content, path: "/admin/content" },
        { icon: TrendingUp, label: content?.admin?.navigation?.pricing, path: "/admin/pricing" },
        { icon: Sparkles, label: content?.admin?.navigation?.promoCodes, path: "/admin/promo-codes" },
        { icon: Activity, label: content?.admin?.navigation?.insights || "Insights", path: "/admin/insights" },
        { icon: User, label: content?.admin?.navigation?.profile, path: "/admin/profile" },
        { icon: HelpCircle, label: content?.admin?.navigation?.help, path: "/admin/help" },
    ];

    return (
        <div className="min-h-screen bg-admin-canvas flex font-sans overflow-x-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-olive-dark/90 backdrop-blur-xl text-white p-5 flex items-center justify-between z-50 border-b border-white/5 shadow-2xl">
                <Link to="/" className="font-display font-black text-2xl tracking-tighter hover:scale-105 transition-all duration-500 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    BOOST<span className="text-white">UP</span>
                </Link>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -mr-2 rounded-2xl h-11 w-11 transition-all active:scale-90" data-testid="admin-mobile-menu-trigger">
                            <div className="flex flex-col gap-1.5 items-end pr-1">
                                <div className="w-6 h-0.5 bg-white rounded-full" />
                                <div className="w-4 h-0.5 bg-lime rounded-full" />
                                <div className="w-5 h-0.5 bg-white/60 rounded-full" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 sidebar-premium border-r-lime/10 text-white w-[88vw] max-w-[320px] rounded-r-[3.5rem] flex flex-col h-full border-none shadow-[25px_0_50px_-12px_rgba(0,0,0,0.5)]">
                        <div className="p-10 border-b border-white/5 shrink-0 bg-gradient-to-b from-black/20 to-transparent">
                            <Link to="/" className="flex items-center">
                                <span className="font-display font-black text-3xl tracking-tighter italic">BOOST<span className="text-white">UP</span></span>
                            </Link>
                            <div className="flex items-center gap-2 mt-3">
                                <div className="w-2 h-2 rounded-full bg-lime animate-pulse shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">{content?.admin?.terminalLabel || "ADMIN TERMINAL"}</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <ul className="space-y-2" role="list">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <li key={item.path}>
                                            <button
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                                    ? "bg-lime text-olive-dark font-black shadow-xl shadow-lime/20"
                                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                                    } `}
                                                aria-current={isActive ? "page" : undefined}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-5 h-5" />
                                                    {item.label}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.path === '/admin/messages' && unreadCount > 0 && (
                                                        <Badge className="bg-terracotta text-white border-none text-[10px] h-5 w-5 flex items-center justify-center p-0">
                                                            {unreadCount}
                                                        </Badge>
                                                    )}
                                                    {item.hasAlert && (
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="p-4 border-t border-white/5 shrink-0 bg-olive-dark/50">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {content?.admin?.auth?.logout || "Logout"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar Overlay Trigger (thin strip) */}
            {!isPinned && !isExpanded && (
                <div 
                    onMouseEnter={() => setIsHovered(true)}
                    className="fixed inset-y-0 left-0 w-4 z-40 cursor-e-resize"
                />
            )}

            {/* Desktop Sidebar */}
            <aside 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`hidden md:flex flex-col sidebar-premium text-white fixed h-[calc(100vh-2rem)] my-4 z-[45] rounded-[3rem] shadow-2xl border border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isExpanded 
                        ? 'w-80 left-4 translate-x-0' 
                        : 'w-20 left-4 translate-x-0'
                }`}
            >
                <div className={`pt-10 pb-8 shrink-0 relative flex items-center ${!isExpanded ? 'justify-center px-4' : 'px-10'}`}>
                    <Link to="/" className="flex items-center group">
                        <span className={`font-display font-black tracking-tighter group-hover:scale-105 transition-all duration-500 ${isExpanded ? 'text-3xl' : 'text-4xl text-white'}`}>
                            {isExpanded ? (
                                <>BOOST<span className="text-white">UP</span></>
                            ) : (
                                <>B<span className="text-lime">U</span></>
                            )}
                        </span>
                    </Link>
                    {isExpanded && (
                        <div className="flex items-center gap-2 mt-2 animate-in fade-in duration-500 absolute -bottom-4 left-10">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 truncate">{content?.admin?.terminalLabel || "ADMIN TERMINAL"}</p>
                        </div>
                    )}
                    
                    {/* Pin Button */}
                    {isExpanded && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPinned(!isPinned)}
                            className="absolute top-8 right-4 text-white/20 hover:text-lime hover:bg-white/5 rounded-full h-8 w-8 transition-all duration-500"
                        >
                            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </Button>
                    )}
                </div>

                <div className={`px-6 pt-4 pb-4 ${!isExpanded ? 'px-0 flex justify-center' : ''}`}>
                    <Link to="/" className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 bg-white/5 hover:bg-lime hover:text-olive-dark group ${!isExpanded ? 'px-0 justify-center w-12 h-12 p-0 mx-auto' : ''}`}>
                        <Home className={`w-5 h-5 ${!isExpanded ? '' : 'shrink-0'}`} />
                        {isExpanded && <span className="text-[10px] font-black uppercase tracking-[0.2em]">{content?.admin?.auth?.backToHome || "Vstoupit na web"}</span>}
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <ul className="space-y-2" role="list">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        className={`w-full flex items-center justify-between transition-all duration-300 group ${isActive
                                            ? "bg-lime text-olive-dark font-black shadow-xl shadow-lime/20 scale-[1.02] z-10"
                                            : "text-white/50 hover:bg-white/5 hover:text-white"
                                            } ${!isExpanded ? 'aspect-square justify-center rounded-2xl mx-auto w-12' : 'px-6 py-4 rounded-2xl'}`}
                                        title={!isExpanded ? item.label : undefined}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <div className={`flex items-center ${isExpanded ? 'gap-4' : 'justify-center'}`}>
                                            <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? "text-olive-dark scale-110" : "text-white/30 group-hover:text-white"}`} />
                                            {isExpanded && <span className="text-xs font-black uppercase tracking-widest animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
                                        </div>
                                        {isExpanded && (
                                            <div className="flex items-center gap-2">
                                                {item.path === '/admin/messages' && unreadCount > 0 && (
                                                    <Badge className="bg-terracotta text-white border-none text-[10px] h-5 w-5 flex items-center justify-center p-0 animate-in zoom-in duration-300">
                                                        {unreadCount}
                                                    </Badge>
                                                )}
                                                {item.hasAlert && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                                                )}
                                            </div>
                                        )}
                                        {!isExpanded && (item.path === '/admin/messages' && unreadCount > 0 || item.hasAlert) && (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-lg" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className={`p-8 border-t border-white/5 space-y-4 ${!isExpanded ? 'p-4 flex flex-col items-center' : ''}`}>
                    {/* Pin Logic in text for better UX */}
                    {isExpanded && (
                        <div className="flex items-center justify-between px-4">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">{content?.admin?.auth?.autoHideSidebar || "Auto-hide Sidebar"}</span>
                            <div 
                                onClick={() => setIsPinned(!isPinned)}
                                className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors duration-300 ${!isPinned ? 'bg-lime/20' : 'bg-white/5'}`}
                            >
                                <div className={`absolute top-0.5 h-3 w-3 rounded-full transition-all duration-300 ${!isPinned ? 'right-0.5 bg-lime' : 'left-0.5 bg-white/20'}`} />
                            </div>
                        </div>
                    )}

                    <Link 
                        to="/admin/profile" 
                        className={`flex items-center transition-all duration-300 border border-transparent hover:bg-olive-dark/20 ${location.pathname === '/admin/profile' ? 'bg-olive-dark/20 border-white/10 ring-1 ring-lime/20' : ''} ${isExpanded ? 'px-5 py-5 gap-4 rounded-[2.5rem] bg-olive-dark/10 border-white/5' : 'p-0 w-12 h-12 justify-center rounded-2xl mx-auto'}`}
                    >
                        <div className={`rounded-2xl bg-lime overflow-hidden flex items-center justify-center text-olive-dark font-black shadow-xl shadow-lime/20 shrink-0 ${isExpanded ? 'w-12 h-12 min-w-[3rem] text-sm' : 'w-full h-full text-xl'}`}>
                            <span className="leading-none select-none">{profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "A"}</span>
                        </div>
                        {isExpanded && (
                            <div className="flex flex-col min-w-0 animate-in slide-in-from-left-2 duration-300">
                                <span className="text-[11px] font-black text-white truncate leading-tight uppercase tracking-[0.2em]">{profile?.full_name?.split(' ')[0] || "Admin"}</span>
                                <span className="text-[9px] font-bold text-white/30 truncate uppercase tracking-widest">{user?.email?.split('@')[0]}</span>
                            </div>
                        )}
                    </Link>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-2xl h-12 px-6 ${!isExpanded ? 'px-0 justify-center w-12' : ''}`}
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {isExpanded && <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 animate-in slide-in-from-left-2 duration-300">{content?.admin?.auth?.logout || "Logout"}</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-4 md:p-8 pt-24 md:pt-10 min-h-screen ${isPinned ? 'md:ml-80' : 'md:ml-24'}`}>
                <div className="max-w-[1600px] mx-auto">
                    {false ? (
                        <div className="flex">
                            {/* Removed old loader from here as it's now handled by higher-level guard */}
                        </div>
                    ) : (
                        <AdminErrorBoundary>
                            <Suspense fallback={
                                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-olive-dark/20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark/20 animate-pulse">{content?.admin?.auth?.verifying || "Loading..."}</p>
                                </div>
                            }>
                                {content ? <Outlet /> : (
                                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
                                        <div className="w-12 h-12 bg-olive-dark/5 rounded-2xl flex items-center justify-center mb-6">
                                            <Sparkles className="w-6 h-6 text-olive-dark/10" />
                                        </div>
                                        <div className="h-4 w-48 bg-olive-dark/5 rounded-full mb-3" />
                                        <div className="h-3 w-32 bg-olive-dark/5 rounded-full" />
                                    </div>
                                )}
                            </Suspense>
                        </AdminErrorBoundary>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

