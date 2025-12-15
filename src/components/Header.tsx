import { Instagram, Facebook, Linkedin, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground" fill="currentColor">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-foreground">Boost<span className="text-olive-light">UP</span></span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#mise" className="text-muted-foreground hover:text-foreground transition-colors">Naše mise</a>
            <a href="#produkty" className="text-muted-foreground hover:text-foreground transition-colors">Produkty</a>
            <a href="#3b" className="text-muted-foreground hover:text-foreground transition-colors">3B Koncept</a>
            <a href="#kontakt" className="text-muted-foreground hover:text-foreground transition-colors">Kontakt</a>
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
            <Button variant="outline" size="sm" className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              Košík
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 border-t border-border mt-4">
            <div className="flex flex-col gap-4">
              <a href="#mise" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Naše mise</a>
              <a href="#produkty" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Produkty</a>
              <a href="#3b" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>3B Koncept</a>
              <a href="#kontakt" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Kontakt</a>
              <div className="flex items-center gap-4 pt-2">
                <Instagram className="w-5 h-5 text-muted-foreground" />
                <Facebook className="w-5 h-5 text-muted-foreground" />
                <Linkedin className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
