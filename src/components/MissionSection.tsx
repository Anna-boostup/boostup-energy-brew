import { Zap, Clock, Shield, Leaf, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Čistá energie",
    stat: "2.5x",
    description: "Síla 2,5 espressa v jednom shotu",
    color: "bg-lime",
    textColor: "text-foreground"
  },
  {
    icon: Clock,
    title: "Dlouhotrvající",
    stat: "6h+",
    description: "Dlouhotrvající soustředění bez crash efektu",
    color: "bg-terracotta",
    textColor: "text-cream"
  },
  {
    icon: Leaf,
    title: "Přírodní složení",
    stat: "100%",
    description: "Čajový extrakt, adaptogeny a vitamíny",
    color: "bg-olive",
    textColor: "text-cream"
  },
  {
    icon: Shield,
    title: "Bez kompromisů",
    stat: "0%",
    description: "Žádná umělá sladidla ani konzervanty",
    color: "bg-orange",
    textColor: "text-foreground"
  }
];

const MissionSection = () => {
  return (
    <section id="mise" className="py-28 bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-lime/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-olive/5 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-lime/20 text-lime rounded-full text-sm font-bold mb-6 tracking-wide animate-fade-up">
            <Sparkles className="w-4 h-4" />
            O NÁS
          </span>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-8 leading-tight animate-fade-up animation-delay-100">
            NAŠE
            <span className="block text-lime">MISE</span>
          </h2>

          <div className="max-w-3xl mx-auto space-y-6 text-lg md:text-xl text-primary-foreground/80 leading-relaxed animate-fade-up animation-delay-200">
            <p>
              Každý z nás zná ten den, kdy se snažíte soustředit, dodělat úkol,
              ale prostě to nejde. <span className="text-lime font-bold">Káva už nepomáhá</span> a klasické energeťáky?
            </p>
            <p>
              Ty vás sice nakopnou, ale za půl hodiny jste zase dolů.
              <span className="text-primary-foreground font-bold"> Chtěli jsme to změnit.</span>
            </p>
            <p>
              Proto jsme vytvořili <span className="text-orange font-black">BoostUp</span> – čistý, efektivní
              shot, který vás drží v kondici celé hodiny.
            </p>
          </div>
        </div>

        {/* Features Grid - Large stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative group animate-fade-up hover-lift"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-30 rounded-3xl blur-xl transition-opacity duration-500`} />

              <div className="relative p-6 lg:p-8 rounded-3xl bg-primary-foreground/5 border border-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-500 h-full flex flex-col items-center text-center">
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.color} ${feature.textColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <feature.icon className="w-8 h-8" />
                </div>

                {/* Stat */}
                <div className="text-4xl lg:text-5xl font-black text-lime mb-2 group-hover:scale-110 transition-transform duration-300">
                  {feature.stat}
                </div>

                {/* Title */}
                <h4 className="font-bold text-lg text-primary-foreground mb-2">{feature.title}</h4>

                {/* Description */}
                <p className="text-sm text-primary-foreground/60">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
