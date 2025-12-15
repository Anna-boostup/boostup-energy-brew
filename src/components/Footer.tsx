import { Instagram, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl">Boost<span className="text-muted">UP</span></span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted hover:text-background transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted hover:text-background transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted hover:text-background transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted">
            © 2024 BoostUp. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
