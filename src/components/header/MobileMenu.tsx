import { Link } from "react-router-dom";
import { User, Package, CreditCard, ShoppingCart, Instagram, Facebook, Linkedin, LogOut } from "lucide-react";
import { startTransition } from "react";

interface MobileMenuProps {
  variant: 'default' | 'simple';
  navigation: Array<{ href: string; label: string }>;
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  user: any;
  profile: any;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  setIsMenuOpen: (open: boolean) => void;
}

const MobileMenu = ({
  variant,
  navigation,
  social,
  user,
  profile,
  cartCount,
  setIsCartOpen,
  setIsMenuOpen
}: MobileMenuProps) => {
  return (
    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200 motion-reduce:animate-none">
      <nav className="flex flex-col gap-1 mb-4">
        {variant === 'default' && (
          <>
            {navigation.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (window.location.pathname === '/' && link.href.includes('#')) {
                    e.preventDefault();
                    const id = link.href.split('#')[1];
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="rounded-2xl px-4 py-3 text-base font-semibold hover:bg-lime focus-visible:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {link.label}
              </a>
            ))}
          </>
        )}

        {user ? (
          <>
            <Link
              to={profile?.role === 'admin' ? "/admin" : profile?.account_type === 'company' ? "/company-account/profile" : "/account/profile"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold hover:bg-lime focus-visible:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
            >
              <User className="w-5 h-5" />
              {profile?.role === 'admin' ? "Admin Menu" : "Můj profil"}
            </Link>
            {profile?.role !== 'admin' && (
              <>
                <Link
                  to={profile?.account_type === 'company' ? "/company-account/orders" : "/account/orders"}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold hover:bg-lime focus-visible:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
                >
                  <Package className="w-5 h-5" />
                  Moje objednávky
                </Link>
                <Link
                  to={profile?.account_type === 'company' ? "/company-account/subscriptions" : "/account/subscriptions"}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold hover:bg-lime focus-visible:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-foreground"
                >
                  <CreditCard className="w-5 h-5" />
                  Moje předplatné
                </Link>
              </>
            )}
          </>
        ) : (
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold hover:bg-lime focus-visible:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-primary"
          >
            <User className="w-5 h-5" />
            Přihlásit se
          </Link>
        )}

        <button
          onClick={() => {
            if (cartCount === 0) {
              const element = document.getElementById('produkty');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            } else {
              startTransition(() => {
                setIsCartOpen(true);
              });
            }
            setIsMenuOpen(false);
          }}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-base font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount === 0 ? "Nakoupit" : `Košík (${cartCount})`}
        </button>
      </nav>

      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <div className="flex gap-4">
          <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 bg-secondary rounded-full hover:bg-lime transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 bg-secondary rounded-full hover:bg-lime transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 bg-secondary rounded-full hover:bg-lime transition-colors"><Linkedin className="w-5 h-5" /></a>
        </div>
        
        {user && (
          <button
            onClick={async () => {
              const { supabase } = await import("@/lib/supabase");
              await supabase.auth.signOut();
              setIsMenuOpen(false);
              window.location.href = "/logout";
            }}
            className="flex items-center gap-2 text-sm font-bold text-terracotta hover:bg-terracotta hover:text-white px-4 py-2 border border-terracotta/30 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
