import { useContent } from "@/context/ContentContext";
import { Brain, Heart, Scale, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useState, lazy, Suspense } from "react";
const EnergyChart = lazy(() => import("./EnergyChart"));
import { getTextStyle } from "@/lib/textStyles";
import { ConceptCard } from "./concept/ConceptCard";
import { ConceptDetailDialog } from "./concept/ConceptDetailDialog";

const ConceptSection = () => {
  const { content: SITE_CONTENT } = useContent();
  const content = SITE_CONTENT.concept3b;
  const [selectedConcept, setSelectedConcept] = useState<any>(null);

  const iconMap: Record<string, any> = {
    brain: Brain,
    body: Heart,
    balance: Scale
  };

  const colorMap: Record<string, any> = {
    brain: { color: "from-olive to-olive-dark", bgColor: "bg-olive", textColor: "text-cream" },
    body: { color: "from-terracotta to-terracotta-dark", bgColor: "bg-terracotta", textColor: "text-cream" },
    balance: { color: "from-lime to-lime-dark", bgColor: "bg-lime", textColor: "text-foreground" }
  };

  return (
    <section id="3b" className="py-28 bg-background relative overflow-hidden">
      {/* Background decorative */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/50 to-transparent" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-lime/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with hero image */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold mb-6 tracking-wide animate-fade-up shadow-button" style={getTextStyle(SITE_CONTENT, 'concept3b.badge')}>
            <Sparkles className="w-4 h-4" />
            {content.badge}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-foreground mb-6 animate-fade-up animation-delay-100" style={getTextStyle(SITE_CONTENT, 'concept3b.headline')}>
            {content.headline.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-gradient-energy"> {word}</span> : word)}
          </h2>
          <p className="text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto animate-fade-up animation-delay-200" style={getTextStyle(SITE_CONTENT, 'concept3b.description')}>
            {content.description}
          </p>
        </div>

        {/* Energy Chart */}
        <div className="mb-20 animate-fade-up animation-delay-300 min-h-[400px]">
          <Suspense fallback={<div className="h-[400px] w-full flex items-center justify-center bg-secondary/20 rounded-3xl animate-pulse">Načítání grafu...</div>}>
            <EnergyChart />
          </Suspense>
        </div>

        {/* 3B Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {(content.concepts || []).map((concept, index) => {
            const Icon = iconMap[concept.id];
            const colors = colorMap[concept.id];

            return (
              <ConceptCard
                key={concept.id}
                concept={concept}
                index={index}
                SITE_CONTENT={SITE_CONTENT}
                iconMap={iconMap}
                colorMap={colorMap}
                onClick={() => setSelectedConcept({ ...concept, ...colors, Icon })}
              />
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-up animation-delay-800">
          <Button
            variant="default"
            size="xl"
            className="group animate-energy-pulse shadow-button hover:shadow-lg rounded-full hover:scale-105 cursor-pointer"
            onClick={() => {
              const element = document.getElementById('produkty');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            style={getTextStyle(SITE_CONTENT, 'concept3b.cta')}
          >
            {content.cta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <ConceptDetailDialog
        selectedConcept={selectedConcept}
        onClose={() => setSelectedConcept(null)}
        SITE_CONTENT={SITE_CONTENT}
      />
    </section >
  );
};

export default ConceptSection;
