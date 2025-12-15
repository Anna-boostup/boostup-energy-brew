import { Brain, Heart, Scale } from "lucide-react";

const concepts = [
  {
    id: "brain",
    title: "Brain",
    icon: Brain,
    color: "bg-primary",
    description: "Kognitivní fokus a mentální výkon"
  },
  {
    id: "body",
    title: "Body",
    icon: Heart,
    color: "bg-red-rush",
    description: "Fyzická energie a vitalita"
  },
  {
    id: "balance",
    title: "Balance",
    icon: Scale,
    color: "bg-lemon",
    description: "Harmonické složení bez crash efektu"
  },
];

const ConceptSection = () => {
  return (
    <section id="3b" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* 3B Visualization */}
          <div className="flex-1">
            <div className="relative flex items-center justify-center">
              {/* Connecting lines */}
              <svg className="absolute w-80 h-80" viewBox="0 0 320 320">
                <path
                  d="M160 60 L260 220 L60 220 Z"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              </svg>
              
              {/* Circles */}
              <div className="relative w-80 h-80">
                {/* Brain - Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-soft">
                    <Brain className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <span className="mt-3 font-display font-bold text-lg text-foreground">Brain</span>
                </div>
                
                {/* Body - Bottom Left */}
                <div className="absolute bottom-8 left-0 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-red-rush flex items-center justify-center shadow-lg animate-pulse-soft animation-delay-200">
                    <Heart className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <span className="mt-3 font-display font-bold text-lg text-foreground">Body</span>
                </div>
                
                {/* Balance - Bottom Right */}
                <div className="absolute bottom-8 right-0 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-lemon flex items-center justify-center shadow-lg animate-pulse-soft animation-delay-400">
                    <Scale className="w-10 h-10 text-foreground" />
                  </div>
                  <span className="mt-3 font-display font-bold text-lg text-foreground">Balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <span className="text-primary font-medium tracking-wide uppercase text-sm">
              Náš přístup
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-6">
              Koncept 3B
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Na český trh přinášíme unikátní přístup k energii. Věříme, že skutečný 
              výkon vychází z harmonie tří pilířů, které na trhu chybí:
            </p>
            
            <div className="space-y-4">
              {concepts.map((concept) => (
                <div key={concept.id} className="flex items-start gap-4 p-4 rounded-xl bg-background shadow-card">
                  <div className={`w-10 h-10 rounded-lg ${concept.color} flex items-center justify-center flex-shrink-0`}>
                    <concept.icon className={`w-5 h-5 ${concept.id === "balance" ? "text-foreground" : "text-primary-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{concept.title}</h3>
                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground italic">
                <strong className="text-foreground">Komentář:</strong> Koněv + Zásobek stejný jako 
                příchutím - Lahvička
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConceptSection;
