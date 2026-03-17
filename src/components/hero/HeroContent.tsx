import { getTextStyle } from "@/lib/textStyles";

interface HeroContentProps {
  siteContent: any;
  content: any;
}

const HeroContent = ({ siteContent, content }: HeroContentProps) => {
  return (
    <div className="text-left animate-fade-up z-10 mb-12">
      <h1 className="font-display text-foreground mb-8 tracking-tight">
        <span className="block text-xl sm:text-3xl md:text-4xl font-medium text-foreground/90 mb-4 animate-slide-in-left uppercase tracking-[0.2em]"
          style={getTextStyle(siteContent, 'hero.headline.part1')}>
          {content.headline.part1}
        </span>
        <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gradient-energy animate-slide-in-left animation-delay-200 leading-[1.1] uppercase"
          style={getTextStyle(siteContent, 'hero.headline.gradient')}>
          {content.headline.gradient}
        </span>
        <span className="block text-lg sm:text-2xl md:text-3xl font-bold text-foreground/90 mt-6 animate-slide-in-left animation-delay-400 leading-tight max-w-xl italic"
          style={getTextStyle(siteContent, 'hero.headline.part2')}>
          {content.headline.part2}
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-foreground/90 italic max-w-xl mb-10 leading-relaxed animate-fade-up animation-delay-500"
        style={getTextStyle(siteContent, 'hero.description')}>
        {siteContent.hero.description}
      </p>
    </div>
  );
};

export default HeroContent;
