import { Button } from "./ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import bottlesHero from "@/assets/hero-vse.jpg";
import { useState } from "react";
import IngredientDialog from "./IngredientDialog";
import { useContent } from "@/context/ContentContext";
import { getTextStyle, isBadgeVisible } from "@/lib/textStyles";

const HeroSection = () => {
  const { content: siteContent } = useContent();
  const content = siteContent.hero;
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="min-h-screen pt-20 relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-80 h-80 bg-olive/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-5 w-[500px] h-[500px] bg-lime/15 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-terracotta/10 rounded-full blur-3xl animate-pulse-glow animation-delay-200" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-orange/10 rounded-full blur-3xl animate-pulse-glow animation-delay-600" />
      </div>

      <div className="container mx-auto px-4 pt-8 pb-32 relative z-10">
        {/* Announcement Badge */}
        {isBadgeVisible(siteContent, 'hero.announcement') && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm tracking-wide animate-fade-up shadow-button"
              style={getTextStyle(siteContent, 'hero.announcement')}>
              <Zap className="w-5 h-5 text-lime" />
              {content.announcement}
              <Sparkles className="w-5 h-5 text-lime" />
            </div>
          </div>
        )}

        {/* Centered Text Content */}
        <div className="text-center animate-fade-up z-10 mb-12">
          <h1 className="font-display text-foreground mb-8 tracking-tight">
            <span className="block text-xl sm:text-3xl md:text-4xl font-medium text-foreground/90 mb-4 animate-slide-in-left uppercase tracking-[0.2em]"
              style={getTextStyle(siteContent, 'hero.headline.part1')}>
              {content.headline.part1}
            </span>
            <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gradient-energy animate-slide-in-left animation-delay-200 leading-[1.1] uppercase"
              style={getTextStyle(siteContent, 'hero.headline.gradient')}>
              {content.headline.gradient}
            </span>
            <span className="block text-lg sm:text-2xl md:text-3xl font-bold text-foreground/90 mt-6 animate-slide-in-left animation-delay-400 leading-tight max-w-4xl mx-auto italic"
              style={getTextStyle(siteContent, 'hero.headline.part2')}>
              {content.headline.part2}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/90 italic max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-up animation-delay-500"
            style={getTextStyle(siteContent, 'hero.description')}>
            {siteContent.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up animation-delay-600 items-center relative z-20">
            <Button
              variant="default"
              size="xl"
              className="group min-w-[200px] shadow-button hover:shadow-lg transition-all animate-energy-pulse rounded-full hover:scale-105 cursor-pointer"
              onClick={() => {
                const element = document.getElementById('produkty');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {siteContent.hero.cta.primary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform ml-2" />
            </Button>

            <Button
              variant="default"
              size="xl"
              className="bg-secondary text-foreground border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 min-w-[200px] shadow-button hover:shadow-lg animate-energy-pulse rounded-full hover:scale-105 cursor-pointer"
              onClick={() => {
                const element = document.getElementById('mise');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {siteContent.hero.cta.secondary}
            </Button>

            <Button
              variant="default"
              size="xl"
              className="bg-secondary text-terracotta border-2 border-terracotta hover:bg-terracotta hover:text-white transition-all duration-300 min-w-[200px] shadow-button hover:shadow-lg animate-energy-pulse rounded-full hover:scale-105 cursor-pointer"
              onClick={() => {
                const element = document.getElementById('3b');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {siteContent.hero.cta.concept3b}
            </Button>
          </div>

          {siteContent.hero.testimonial && (
            <div className="mt-8 animate-fade-up animation-delay-800">
              <h2 className="sr-only">Recenze a doporučení</h2>
              <p className="text-xl md:text-2xl text-foreground/90 italic max-w-3xl mx-auto leading-relaxed">
                {siteContent.hero.testimonial}
              </p>
            </div>
          )}
        </div>

        {/* Product Image - Centered below text */}
        <div className="relative animate-fade-up animation-delay-300 mb-8 sm:mb-16">
          <div className="relative max-w-3xl mx-auto">
            {/* Top radial gradient for depth - slightly lightened for #17 */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-lime/10 to-transparent pointer-events-none opacity-80" />
            {/* Multiple glow layers for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-lime/30 via-olive/15 to-terracotta/15 blur-3xl scale-125 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange/20 to-transparent blur-2xl scale-110 pointer-events-none" />

            {/* Product Image */}
            <img
              src={bottlesHero}
              alt="BoostUp Pure Shot - 3 příchutě energetického nápoje"
              className="relative w-full max-w-2xl mx-auto drop-shadow-xl"
            />
          </div>
        </div>

        {/* Trust Badges - Below image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 sm:gap-6 justify-center items-center animate-fade-up animation-delay-800 relative z-30">
          {(content.trustBadges || []).map((badge, idx) => {
            const colors = ["bg-olive", "bg-lime", "bg-terracotta", "bg-orange"];
            const detailKeys = ['stimulants', 'electrolytes', 'adaptogens', 'vitamins'];
            const key = detailKeys[idx % detailKeys.length];

            return (
              <button
                key={badge}
                onClick={() => {
                  setSelectedIngredient(key);
                  setIsDialogOpen(true);
                }}
                aria-label={`Zjistit více o ${badge}`}
                className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-2xl sm:rounded-full shadow-card hover:shadow-lg hover:scale-105 transition-all cursor-pointer border border-transparent hover:border-primary/20 group"
              >
                <div className={`w-4 h-4 rounded-full ${colors[idx % colors.length]} animate-pulse group-hover:scale-125 transition-transform`} style={{ animationDelay: `${idx * 200}ms` }} />
                <span className="text-sm font-bold text-foreground">{badge}</span>
                <span className="ml-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-black" aria-hidden="true">ZJISTIT VÍCE</span>
              </button>
            );
          })}
        </div>

        <IngredientDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          data={selectedIngredient ? (siteContent.ingredientDetails as any)[selectedIngredient] : null}
          colorClass={
            selectedIngredient === 'stimulants' ? 'bg-lime' :
              selectedIngredient === 'electrolytes' ? 'bg-blue-400' :
                selectedIngredient === 'adaptogens' ? 'bg-terracotta' :
                  selectedIngredient === 'vitamins' ? 'bg-orange' : 'bg-primary'
          }
        />
      </div>
    </section>
  );
};

export default HeroSection;
