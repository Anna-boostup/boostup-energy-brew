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
              <img src={logoWhite} alt="BoostUp" className="h-10 w-auto" width={160} height={40} />
            </Link>
            <p className="text-primary-foreground/90 text-lg leading-relaxed mb-8 max-w-sm">
              {content.brand.description}
            </p>
            <div className="flex gap-4">
              <a href={SITE_CONTENT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Instagram className="w-6 h-6" />
              </a>
              <a href={SITE_CONTENT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href={SITE_CONTENT.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-12 h-12 rounded-2xl bg-primary-foreground/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links Groups */}
          {(content.links || []).map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-black text-xl mb-8 tracking-wider">{group.title}</h4>
              <ul className="space-y-4">
                {(group.items || []).map((item) => (
                  <li key={item.label}>
                    {item.label !== "Naše mise" && (
                      item.href.startsWith('/') && !item.href.includes('://') ? (
                        <Link
                          to={item.href}
                          onClick={(e) => {
                            if (window.location.pathname === '/' && item.href.includes('#')) {
                              e.preventDefault();
                              const id = item.href.split('#')[1];
                              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="text-primary-foreground hover:text-lime transition-colors text-lg"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          target={item.href.startsWith('http') ? "_blank" : undefined}
                          rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                          className="text-primary-foreground hover:text-lime transition-colors text-lg"
                        >
                          {item.label}
                        </a>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-display font-black text-xl mb-8 tracking-wider">{content.contact.title}</h4>
            <ul className="space-y-4 text-primary-foreground text-lg">
              <li>
                <a href={`mailto:${content.contact.email}`} className="hover:text-lime transition-colors">
                  {content.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${content.contact.phone.replace(/\s/g, '')}`} className="hover:text-lime transition-colors">
                  {content.contact.phone}
                </a>
              </li>
              <li className="leading-relaxed">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Chaloupkova+3002/1a,+612+00+Brno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lime transition-colors"
                >
                  {content.contact.address.line1}<br />
                  {content.contact.address.line2}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-primary-foreground/90 text-sm font-bold tracking-widest">
            {content.bottom.copyright}
          </p>
          <div className="flex gap-8">
            {(content.bottom.legal || []).map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm font-bold tracking-widest uppercase"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
