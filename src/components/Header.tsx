import { 
  Menu, 
  X,
  Mail
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, lazy, Suspense } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";

// Sub-components
import Logo from "./header/Logo";
import DesktopNav from "./header/DesktopNav";
import SocialLinks from "./header/SocialLinks";
import AuthButton from "./header/AuthButton";
import CartButton from "./header/CartButton";
import MobileMenu from "./header/MobileMenu";
import LanguageToggle from "./LanguageToggle";
import { Badge } from "./ui/badge";

const CartModal = lazy(() => import("./CartModal"));

interface HeaderProps {
  variant?: 'default' | 'simple';
}

const Header = ({ variant = 'default' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, profile } = useAuth();
  const { content: SITE_CONTENT } = useContent();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count if admin
  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
        setUnreadCount(0);
        return;
    }

    const fetchUnreadCount = async () => {
        try {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false);
            
            if (error) throw error;
            
            const newCount = count || 0;
            
            // Trigger notification if count increased
            if (newCount > unreadCount && typeof window !== 'undefined' && Notification.permission === 'granted') {
                new Notification('Nová zpráva! 📧', {
                    body: `Máte ${newCount} nepřečtených zpráv od zákazníků.`,
                    icon: '/favicon.png'
                });
                
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(() => {});
                } catch (e) {}
            }
            
            setUnreadCount(newCount);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [profile, unreadCount]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${
      isMenuOpen 
        ? 'bg-background border-border h-screen overflow-y-auto' 
        : 'bg-background/95 backdrop-blur-sm border-border/50'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />

          {variant === 'default' && (
            <DesktopNav navigation={SITE_CONTENT.navigation} />
          )}

          <div className="hidden md:flex items-center gap-4">
            {variant === 'default' && (
              <SocialLinks social={SITE_CONTENT.social} />
            )}

            <LanguageToggle />

            <AuthButton user={user} profile={profile} />

            {profile?.role === 'admin' && (
              <a 
                href="/#/admin/messages" 
                className="p-2 relative group hover:scale-110 transition-all"
                title="Zprávy"
              >
                <Mail className="w-5 h-5 text-olive-dark" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-terracotta text-white font-black border-2 border-background animate-in zoom-in duration-300">
                    {unreadCount}
                  </Badge>
                )}
              </a>
            )}

            <CartButton cartCount={cartCount} setIsCartOpen={setIsCartOpen} />
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <CartButton cartCount={cartCount} setIsCartOpen={setIsCartOpen} mobile />

            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Zavřít menu" : "Otevřít menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <MobileMenu 
            variant={variant}
            navigation={SITE_CONTENT.navigation}
            social={SITE_CONTENT.social}
            user={user}
            profile={profile}
            cartCount={cartCount}
            setIsCartOpen={setIsCartOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        )}
      </div>
      {isCartOpen && (
        <Suspense fallback={null}>
          <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </Suspense>
      )}
    </header>
  );
};

export default Header;
