import { Instagram, Facebook, Linkedin, Zap, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";

const Footer = () => {
  return (
    <footer className="py-16 bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src={logoWhite} alt="BoostUp" className="h-10 mb-6" />
            <p className="text-primary-foreground/70 max-w-md mb-6">
              6 hodin soustředění a čisté energie ze stimulantů. Síla 2,5 espressa bez nervozity.
              Žádná umělá sladidla a aromata.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-lime hover:text-foreground transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-lime hover:text-foreground transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-lime hover:text-foreground transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Odkazy</h4>
            <ul className="space-y-3">
              {["O nás", "Produkty", "Koncept 3B", "Kontakt", "Blog"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-lime transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">Kontakt</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="w-5 h-5 text-lime" />
                info@boostup.cz
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="w-5 h-5 text-terracotta" />
                Praha, Česká republika
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Zap className="w-5 h-5 text-olive-light" />
                Launch Q1 2025
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 BoostUp. Všechna práva vyhrazena.
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/50">
            <a href="#" className="hover:text-primary-foreground transition-colors">Ochrana soukromí</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Obchodní podmínky</a>
            <Link to="/admin" className="hover:text-primary-foreground transition-colors opacity-0 hover:opacity-100">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
