import { Brain, Heart, Scale, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const concepts = [
  {
    id: "brain",
    title: "BRAIN",
    subtitle: "Kognitivní fokus",
    icon: Brain,
    color: "from-olive to-olive-dark",
    bgColor: "bg-olive",
    description: "Maximální mentální výkon a soustředění po celý pracovní den",
    stats: "Focus +85%"
  },
  {
    id: "body",
    title: "BODY",
    subtitle: "Fyzická energie",
    icon: Heart,
    color: "from-terracotta to-terracotta-dark",
    bgColor: "bg-terracotta",
    description: "Trvalá fyzická energie bez nervozity a crash efektu",
    stats: "Energy +6h"
  },
  {
    id: "balance",
    title: "BALANCE",
    subtitle: "Harmonie",
    icon: Scale,
    color: "from-lime to-lime-dark",
    bgColor: "bg-lime",
    description: "Vyvážené složení pro optimální fungování těla i mysli",
    stats: "Stability 100%"
  },
];

const ConceptSection = () => {
  return (
    <section id="3b" className="py-24 bg-background relative overflow-hidden">
      {/* Background decorative */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6 tracking-wide">
            NÁŠ PŘÍSTUP
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            KONCEPT <span className="text-primary">3B</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Na český trh přinášíme unikátní přístup k energii. Tři pilíře, které na trhu chybí.
          </p>
        </div>

        {/* 3B Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {concepts.map((concept, index) => (
            <div 
              key={concept.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${concept.color} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 blur-xl`} />
              
              <div className="relative p-8 rounded-3xl bg-card border border-border hover:border-transparent transition-all duration-500 h-full flex flex-col group-hover:bg-foreground group-hover:text-primary-foreground">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${concept.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <concept.icon className={`w-8 h-8 ${concept.id === 'balance' ? 'text-foreground' : 'text-primary-foreground'}`} />
                </div>

                {/* Stats badge */}
                <div className="absolute top-6 right-6 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground transition-colors">
                  {concept.stats}
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  {concept.title}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/70 mb-4 font-medium tracking-wide">
                  {concept.subtitle}
                </p>
                <p className="text-muted-foreground group-hover:text-primary-foreground/80 flex-grow">
                  {concept.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center gap-2 text-primary group-hover:text-lime font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Zjistit více</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="xl" className="group">
            Objevit sílu 3B
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConceptSection;
