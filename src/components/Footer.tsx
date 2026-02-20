import { useContent } from "@/context/ContentContext";
import { Link } from "react-router-dom";
import { Youtube, Instagram, Facebook } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const Footer = () => {
  const { content: SITE_CONTENT } = useContent();
  const content = SITE_CONTENT.footer;

  return (
    <footer className="bg-foreground text-primary-foreground pt-24 pb-12 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block mb-8">
              <img src={logoWhite} alt="BoostUp" className="h-10 w-auto" />
            </Link>
            <p className="text-primary-foreground/60 text-lg leading-relaxed mb-8 max-w-sm">
              {content.brand.description}
            </p>
            <div className="flex gap-4">
              <a href={SITE_CONTENT.social.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href={SITE_CONTENT.social.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href={SITE_CONTENT.social.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links Groups */}
          {content.links.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-black text-xl mb-8 tracking-wider">{group.title}</h4>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        if (window.location.pathname === '/' && item.href.includes('#')) {
                          e.preventDefault();
                          const id = item.href.split('#')[1];
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-primary-foreground/60 hover:text-lime transition-colors text-lg"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-display font-black text-xl mb-8 tracking-wider">{content.contact.title}</h4>
            <ul className="space-y-4 text-primary-foreground/60 text-lg">
              <li>{content.contact.email}</li>
              <li>{content.contact.phone}</li>
              <li className="leading-relaxed">
                {content.contact.address.line1}<br />
                {content.contact.address.line2}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-primary-foreground/40 text-sm font-bold tracking-widest">
            {content.bottom.copyright}
          </p>
          <div className="flex gap-8">
            {content.bottom.legal.map((link) => (
              <a key={link.label} href={link.href} className="text-primary-foreground/40 hover:text-primary-foreground transition-colors text-sm font-bold tracking-widest uppercase">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
