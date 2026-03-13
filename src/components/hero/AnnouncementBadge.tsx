import { Zap, Sparkles } from "lucide-react";
import { getTextStyle, isBadgeVisible } from "@/lib/textStyles";

interface AnnouncementBadgeProps {
  siteContent: any;
  content: any;
}

const AnnouncementBadge = ({ siteContent, content }: AnnouncementBadgeProps) => {
  if (!isBadgeVisible(siteContent, 'hero.announcement')) return null;

  return (
    <div className="flex justify-center mb-10">
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm tracking-wide animate-fade-up shadow-button"
        style={getTextStyle(siteContent, 'hero.announcement')}>
        <Zap className="w-5 h-5 text-lime" />
        {content.announcement}
        <Sparkles className="w-5 h-5 text-lime" />
      </div>
    </div>
  );
};

export default AnnouncementBadge;
