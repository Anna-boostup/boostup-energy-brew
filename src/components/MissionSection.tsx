import { Zap, Clock, Shield, Leaf } from "lucide-react";
import bottlesHero from "@/assets/bottles-hero.jpg";

const features = [
  {
    icon: Zap,
    title: "Čistá energie",
    description: "Síla 2,5 espressa v jednom shotu"
  },
  {
    icon: Clock,
    title: "6+ hodin",
    description: "Dlouhotrvající soustředění bez crash efektu"
  },
  {
    icon: Leaf,
    title: "Přírodní složení",
    description: "Čajový extrakt, adaptogeny a vitamíny"
  },
  {
    icon: Shield,
    title: "Bez kompromisů",
    description: "Žádná umělá sladidla ani konzervanty"
  }
];

const MissionSection = () => {
  return (
    <section id="mise" className="py-24 bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content */}
          <div className="flex-1 order-2 lg:order-1">
            <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-6 tracking-wide">
              O NÁS
            </span>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
              NAŠE
              <span className="block text-lime">MISE</span>
            </h2>
            
            <div className="space-y-6 text-lg text-primary-foreground/80 leading-relaxed mb-10">
              <p>
                Každý z nás zná ten den, kdy se snažíte soustředit, dodělat úkol, 
                ale prostě to nejde. <span className="text-lime font-medium">Káva už nepomáhá</span> a klasické energeťáky?
              </p>
              <p>
                Ty vás sice nakopnou, ale za půl hodiny jste zase dolů.
                <span className="text-primary-foreground font-semibold"> Chtěli jsme to změnit.</span>
              </p>
              <p>
                Proto jsme vytvořili <span className="text-terracotta font-bold">BoostUp</span> – čistý, efektivní 
                shot, který vás drží v kondici celé hodiny.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={feature.title} 
                  className="p-4 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors duration-300 group"
                >
                  <feature.icon className="w-8 h-8 text-lime mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold text-primary-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-primary-foreground/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -inset-8 bg-gradient-to-br from-olive/20 via-lime/10 to-terracotta/20 rounded-3xl blur-2xl" />
              <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-lime/30 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-terracotta/30 rounded-full" />
              
              <img
                src={bottlesHero}
                alt="BoostUp produkty - tři příchutě energetického shotu"
                className="relative rounded-2xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-lime text-foreground px-6 py-4 rounded-2xl shadow-xl font-bold">
                <div className="text-2xl">60ml</div>
                <div className="text-sm font-normal opacity-80">Pure Energy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
