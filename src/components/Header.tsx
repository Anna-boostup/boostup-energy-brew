import { Instagram, Facebook, Linkedin, ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logoBlack from "@/assets/logo-black.png";
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
            <img src={logoBlack} alt="BoostUp" className="h-8 w-auto" />
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
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Auth Button */}
            {user ? (
              <Link to={profile?.account_type === 'company' ? "/company-account" : "/account"}>
                <Button variant="ghost" size="icon" title={profile?.account_type === 'company' ? "Firemní účet" : "Můj profil"}>
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">Přihlásit se</Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              Košík
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>

          {/* ... mobile menu toggle unchanged ... */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ... mobile menu unchanged ... */}
        {/* ... */}
      </div>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
