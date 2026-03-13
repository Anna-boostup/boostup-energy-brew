import { useState } from "react";
import IngredientDialog from "./IngredientDialog";
import { useContent } from "@/context/ContentContext";

// Sub-components
import HeroBackground from "./hero/HeroBackground";
import AnnouncementBadge from "./hero/AnnouncementBadge";
import HeroContent from "./hero/HeroContent";
import HeroCTA from "./hero/HeroCTA";
import HeroImage from "./hero/HeroImage";
import TrustBadges from "./hero/TrustBadges";

const HeroSection = () => {
  const { content: siteContent } = useContent();
  const content = siteContent.hero;
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="min-h-screen pt-20 relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      <HeroBackground />

      <div className="container mx-auto px-4 pt-8 pb-32 relative z-10">
        <AnnouncementBadge siteContent={siteContent} content={content} />

        <div className="text-center animate-fade-up z-10 mb-12">
          <HeroContent siteContent={siteContent} content={content} />
          
          <HeroCTA cta={siteContent.hero.cta} />

          {siteContent.hero.testimonial && (
            <div className="mt-8 animate-fade-up animation-delay-800">
              <h2 className="sr-only">Recenze a doporučení</h2>
              <p className="text-xl md:text-2xl text-foreground/90 italic max-w-3xl mx-auto leading-relaxed">
                {siteContent.hero.testimonial}
              </p>
            </div>
          )}
        </div>

        <HeroImage />

        <TrustBadges 
          badges={content.trustBadges} 
          onSelectIngredient={setSelectedIngredient} 
          setIsDialogOpen={setIsDialogOpen} 
        />

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
