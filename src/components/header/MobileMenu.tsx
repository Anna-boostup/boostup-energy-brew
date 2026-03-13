import { Link } from "react-router-dom";
import { User, Package, CreditCard, ShoppingCart, Instagram, Facebook, Linkedin } from "lucide-react";
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
    <div className="md:hidden mt-4 pb-6 animate-in slide-in-from-top duration-300">
      <nav className="flex flex-col gap-4 mb-6">
        {variant === 'default' && (
          <>
            {navigation.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    const id = link.href.split('#')[1];
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="text-lg font-medium py-2 border-b border-border/50"
              >
                {link.label}
              </a>
            ))}
          </>
        )}

        {user ? (
          <>
            <Link
              to={profile?.account_type === 'company' ? "/company-account/profile" : "/account/profile"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 text-lg font-medium py-2 border-b border-border/50 text-foreground"
            >
              <User className="w-5 h-5" />
              Můj profil
            </Link>
            <Link
              to={profile?.account_type === 'company' ? "/company-account/orders" : "/account/orders"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 text-lg font-medium py-2 border-b border-border/50 text-foreground"
            >
              <Package className="w-5 h-5" />
              Moje objednávky
            </Link>
            <Link
              to={profile?.account_type === 'company' ? "/company-account/subscriptions" : "/account/subscriptions"}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 text-lg font-medium py-2 border-b border-border/50 text-foreground"
            >
              <CreditCard className="w-5 h-5" />
              Moje předplatné
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 text-lg font-medium py-2 border-b border-border/50 text-primary"
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
          className="flex items-center gap-2 text-lg font-medium py-2 text-primary"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount === 0 ? "Nakoupit" : `Košík (${cartCount})`}
        </button>
      </nav>

      <div className="flex gap-4">
        <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 bg-secondary rounded-full"><Instagram className="w-5 h-5" /></a>
        <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 bg-secondary rounded-full"><Facebook className="w-5 h-5" /></a>
        <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 bg-secondary rounded-full"><Linkedin className="w-5 h-5" /></a>
      </div>
    </div>
  );
};

export default MobileMenu;
