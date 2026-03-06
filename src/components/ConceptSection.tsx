import { useContent } from "@/context/ContentContext";
import { Brain, Heart, Scale, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import EnergyChart from "./EnergyChart";
import { useState } from "react";
import { getTextStyle } from "@/lib/textStyles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

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
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold mb-6 tracking-wide animate-fade-up shadow-button">
            <Sparkles className="w-4 h-4" />
            {content.badge}
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-foreground mb-6 animate-fade-up animation-delay-100">
            {content.headline.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-gradient-energy"> {word}</span> : word)}
          </h2>
          <p className="text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto animate-fade-up animation-delay-200">
            {content.description}
          </p>
        </div>

        {/* Energy Chart */}
        <div className="mb-20 animate-fade-up animation-delay-300">
          <EnergyChart />
        </div>

        {/* 3B Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {(content.concepts || []).map((concept, index) => {
            const Icon = iconMap[concept.id];
            const colors = colorMap[concept.id];

            return (
              <div
                key={concept.id}
                className="group relative animate-fade-up cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
                style={{ animationDelay: `${400 + index * 150}ms` }}
                onClick={() => setSelectedConcept({ ...concept, ...colors, Icon })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedConcept({ ...concept, ...colors, Icon });
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${concept.title}: ${concept.subtitle}. Zjistit více.`}
              >
                {/* Intense Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-40 rounded-3xl transition-all duration-700 blur-2xl scale-100 group-hover:scale-110`} />

                <div className="relative p-8 lg:p-10 rounded-3xl bg-card border-2 border-border hover-lift shadow-sm h-full flex flex-col group-hover:bg-foreground group-hover:text-primary-foreground transition-all duration-500">
                  {/* Icon */}
                  <div className={`w-18 h-18 rounded-2xl ${colors.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon className={`w-10 h-10 ${colors.textColor}`} />
                  </div>

                  {/* Stats badge */}
                  <div className="absolute top-6 right-6 px-4 py-2 bg-lime text-foreground text-xs font-black rounded-full shadow-md">
                    {concept.stats}
                  </div>

                  {/* Content */}
                  <h3 className="text-3xl md:text-4xl font-display font-black mb-2 group-hover:text-lime transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-sm text-foreground group-hover:text-primary-foreground mb-4 font-bold tracking-widest uppercase" style={getTextStyle(SITE_CONTENT, `concept3b.${concept.id}.subtitle`)}>
                    {concept.subtitle}
                  </p>
                  <p className="text-foreground/90 group-hover:text-primary-foreground flex-grow text-lg leading-relaxed" style={getTextStyle(SITE_CONTENT, `concept3b.${concept.id}.description`)}>
                    {concept.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-8 flex items-center gap-2 text-primary group-hover:text-lime font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-sm tracking-wide">ZJISTIT VÍCE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
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
          >
            {content.cta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedConcept} onOpenChange={() => setSelectedConcept(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-2 border-border">
          {selectedConcept && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${selectedConcept.bgColor} flex items-center justify-center shadow-lg`}>
                    <selectedConcept.Icon className={`w-8 h-8 ${selectedConcept.textColor}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-display font-black text-foreground">
                      {selectedConcept.title}
                    </DialogTitle>
                    <p className="text-sm text-foreground/70 font-bold tracking-widest">
                      {selectedConcept.subtitle}
                    </p>
                  </div>
                  <div className="ml-auto px-4 py-2 bg-lime text-foreground text-sm font-black rounded-full shadow-md">
                    {selectedConcept.stats}
                  </div>
                </div>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="text-foreground space-y-4 text-base leading-relaxed" style={getTextStyle(SITE_CONTENT, `concept3b.${selectedConcept.id}.fullDescription`)}>
                  {selectedConcept.fullDescription.split('\n').map((line: string, i: number) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;
                    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                      return (
                        <h4 key={i} className="font-bold text-lg mt-6 mb-2 text-foreground">
                          {trimmedLine.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    if (trimmedLine.startsWith('•')) {
                      return (
                        <p key={i} className="pl-4 text-muted-foreground">
                          {trimmedLine}
                        </p>
                      );
                    }
                    return (
                      <p key={i} className="text-foreground/80">
                        {trimmedLine}
                      </p>
                    );
                  })}
                </div>
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ConceptSection;
