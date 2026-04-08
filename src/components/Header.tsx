import { 
  Menu, 
  X
} from "lucide-react";
import { useState, lazy, Suspense } from "react";
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
