import { Instagram, Facebook, Linkedin, ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logoBlack from "@/assets/logo-black.png";
import logoWhite from "@/assets/logo-white.png";
import CartModal from "./CartModal";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, profile } = useAuth();



  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logoBlack} alt="BoostUp" className="h-8 w-auto dark:hidden" />
            <img src={logoWhite} alt="BoostUp" className="h-8 w-auto hidden dark:block" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#mise" className="text-muted-foreground hover:text-foreground transition-colors">Naše mise</a>
            <a href="/#produkty" className="text-muted-foreground hover:text-foreground transition-colors">Produkty</a>
            <a href="/#3b" className="text-muted-foreground hover:text-foreground transition-colors">3B Koncept</a>
            <a href="/#kontakt" className="text-muted-foreground hover:text-foreground transition-colors">Kontakt</a>
          </nav>

          {/* Social & Cart */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Auth Button */}
            {user ? (
              <Link to={profile?.account_type === 'company' ? "/company-account" : "/account"}>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent hover:text-accent-foreground" title={profile?.account_type === 'company' ? "Firemní účet" : "Můj profil"}>
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">Přihlásit se</Button>
              </Link>
            )}

            <button
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground h-9 px-3 gap-2 relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              Košík
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Social & Cart links... Desktop only */}
          {/* ... */}

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-6 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-4 mb-6">
              <a
                href="/#mise"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-2 border-b border-border/50"
              >
                Naše mise
              </a>
              <a
                href="/#produkty"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-2 border-b border-border/50"
              >
                Produkty
              </a>
              <a
                href="/#3b"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-2 border-b border-border/50"
              >
                3B Koncept
              </a>
              <a
                href="/#kontakt"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-2 border-b border-border/50"
              >
                Kontakt
              </a>

              {/* Added mobile specific links */}
              <Link
                to={user ? (profile?.account_type === 'company' ? "/company-account" : "/account") : "/login"}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-lg font-medium py-2 border-b border-border/50 text-primary"
              >
                <User className="w-5 h-5" />
                {user ? "Můj profil" : "Přihlásit se"}
              </Link>
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-lg font-medium py-2 text-primary"
              >
                <ShoppingCart className="w-5 h-5" />
                Košík ({cartCount})
              </button>
            </nav>

            <div className="flex gap-4">
              <a href="#" className="p-2 bg-secondary rounded-full"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-secondary rounded-full"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-secondary rounded-full"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        )}
      </div>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
