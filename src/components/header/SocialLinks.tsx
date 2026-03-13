import { Instagram, Facebook, Linkedin } from "lucide-react";

interface SocialLinksProps {
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
}

const SocialLinks = ({ social }: SocialLinksProps) => {
  return (
    <div className="flex items-center gap-3">
      <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
        <Instagram className="w-5 h-5" />
      </a>
      <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
        <Facebook className="w-5 h-5" />
      </a>
      <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
        <Linkedin className="w-5 h-5" />
      </a>
    </div>
  );
};

export default SocialLinks;
