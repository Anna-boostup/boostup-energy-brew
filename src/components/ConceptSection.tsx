import { Brain, Heart, Scale, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import EnergyChart from "./EnergyChart";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

const concepts = [
  {
    id: "brain",
    title: "BRAIN",
    subtitle: "Kognitivní fokus",
    icon: Brain,
    color: "from-olive to-olive-dark",
    bgColor: "bg-olive",
    textColor: "text-cream",
    description: "Maximální mentální výkon a soustředění po celý pracovní den",
    stats: "Focus +85%",
    fullDescription: `
      BRAIN představuje první pilíř našeho konceptu 3B zaměřený na optimalizaci kognitivních funkcí.
      
      **Co obsahuje:**
      • L-Theanin pro klidnou koncentraci bez nervozity
      • Guarana s postupným uvolňováním energie
      • B-vitamíny pro zdravou funkci nervové soustavy
      
      **Přínosy:**
      • Zvýšená mentální ostrost a jasnost myšlení
      • Lepší schopnost soustředění na náročné úkoly
      • Podpora paměti a rychlosti zpracování informací
      • Žádný "brain fog" ani únava po odeznění účinku
      
      Ideální pro studenty, profesionály a každého, kdo potřebuje maximální mentální výkon.
    `
  },
  {
    id: "body",
    title: "BODY",
    subtitle: "Fyzická energie",
    icon: Heart,
    color: "from-terracotta to-terracotta-dark",
    bgColor: "bg-terracotta",
    textColor: "text-cream",
    description: "Trvalá fyzická energie bez nervozity a crash efektu",
    stats: "Energy +6h",
    fullDescription: `
      BODY je druhým pilířem zaměřeným na udržitelnou fyzickou energii po celý den.
      
      **Co obsahuje:**
      • Přírodní kofein v optimální dávce
      • Taurin pro podporu svalové výkonnosti
      • Elektrolyty pro správnou hydrataci
      
      **Přínosy:**
      • Stabilní energie po dobu 6+ hodin
      • Žádný prudký nástup ani následný "crash"
      • Podpora fyzické výkonnosti a vytrvalosti
      • Rychlejší regenerace po námaze
      
      Perfektní pro sportovce, aktivní lidi i ty, kdo potřebují energii na dlouhé pracovní dny.
    `
  },
  {
    id: "balance",
    title: "BALANCE",
    subtitle: "Harmonie",
    icon: Scale,
    color: "from-lime to-lime-dark",
    bgColor: "bg-lime",
    textColor: "text-foreground",
    description: "Vyvážené složení pro optimální fungování těla i mysli",
    stats: "Stability 100%",
    fullDescription: `
      BALANCE je třetím pilířem, který spojuje BRAIN a BODY do harmonického celku.
      
      **Co obsahuje:**
      • Adaptogeny pro odolnost vůči stresu
      • Antioxidanty pro ochranu buněk
      • Přírodní ingredience bez umělých přísad
      
      **Přínosy:**
      • Synergie mezi mentální a fyzickou složkou
      • Podpora přirozené rovnováhy organismu
      • Snížení negativních účinků stresu
      • Dlouhodobá podpora zdraví a vitality
      
      Klíč k udržitelnému životnímu stylu bez extrémů a kompromisů.
    `
  },
];

const ConceptSection = () => {
  const [selectedConcept, setSelectedConcept] = useState<typeof concepts[0] | null>(null);

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
            NÁŠ PŘÍSTUP
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-foreground mb-6 animate-fade-up animation-delay-100">
            KONCEPT <span className="text-gradient-energy">3B</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up animation-delay-200">
            Na český trh přinášíme unikátní přístup k energii. Tři pilíře, které na trhu chybí.
          </p>
        </div>
        
        {/* Energy Chart */}
        <div className="mb-20 animate-fade-up animation-delay-300">
          <EnergyChart />
        </div>

        {/* 3B Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {concepts.map((concept, index) => (
            <div 
              key={concept.id}
              className="group relative animate-fade-up cursor-pointer"
              style={{ animationDelay: `${400 + index * 150}ms` }}
              onClick={() => setSelectedConcept(concept)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${concept.color} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 blur-xl scale-105`} />
              
              <div className="relative p-8 lg:p-10 rounded-3xl bg-card border-2 border-border hover:border-transparent transition-all duration-500 h-full flex flex-col group-hover:bg-foreground group-hover:text-primary-foreground hover-lift">
                {/* Icon */}
                <div className={`w-18 h-18 rounded-2xl ${concept.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <concept.icon className={`w-10 h-10 ${concept.textColor}`} />
                </div>

                {/* Stats badge */}
                <div className="absolute top-6 right-6 px-4 py-2 bg-lime text-foreground text-xs font-black rounded-full group-hover:bg-lime group-hover:scale-110 transition-all duration-300 shadow-md">
                  {concept.stats}
                </div>

                {/* Content */}
                <h3 className="text-3xl md:text-4xl font-display font-black mb-2">
                  {concept.title}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/70 mb-4 font-bold tracking-widest">
                  {concept.subtitle}
                </p>
                <p className="text-muted-foreground group-hover:text-primary-foreground/80 flex-grow text-lg">
                  {concept.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-8 flex items-center gap-2 text-primary group-hover:text-lime font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Zjistit více</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-up animation-delay-800">
          <Button variant="hero" size="xl" className="group animate-energy-pulse">
            Objevit sílu 3B
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
                    <selectedConcept.icon className={`w-8 h-8 ${selectedConcept.textColor}`} />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-display font-black text-foreground">
                      {selectedConcept.title}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground font-bold tracking-widest">
                      {selectedConcept.subtitle}
                    </p>
                  </div>
                  <div className="ml-auto px-4 py-2 bg-lime text-foreground text-sm font-black rounded-full shadow-md">
                    {selectedConcept.stats}
                  </div>
                </div>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="text-foreground space-y-4 text-base leading-relaxed">
                  {selectedConcept.fullDescription.split('\n').map((line, i) => {
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
                      <p key={i} className="text-muted-foreground">
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
