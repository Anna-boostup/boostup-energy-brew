import { Button } from "./ui/button";
import { ArrowRight, Zap } from "lucide-react";
import bottlesHero from "@/assets/bottles-hero.jpg";

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-20 relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-olive/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lime/10 rounded-full blur-3xl animate-pulse-soft animation-delay-400" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl animate-pulse-soft animation-delay-200" />
      </div>

      <div className="container mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* Announcement Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-semibold text-sm tracking-wide animate-fade-up shadow-lg">
            <Zap className="w-4 h-4" />
            BRZY NA TRHU
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left animate-fade-up z-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-foreground mb-6 leading-[0.95] tracking-tight">
              <span className="block">ENERGIE</span>
              <span className="block text-primary">NA CELÝ DEN</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl font-medium text-muted-foreground mt-2">
                přirozeně.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              <span className="text-foreground font-semibold">60 ml čisté energie</span> z čajového extraktu. 
              Síla 2,5 espressa bez nervozity. Minimálně{" "}
              <span className="text-primary font-semibold">6 hodin soustředění</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button variant="hero" size="xl" className="group">
                Objevit produkty
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl" className="rounded-full border-2">
                Náš příběh
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">60ml</div>
                <div className="text-sm text-muted-foreground">Pure Shot</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-lime-dark">6h+</div>
                <div className="text-sm text-muted-foreground">Energie</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-terracotta">2.5x</div>
                <div className="text-sm text-muted-foreground">Síla espressa</div>
              </div>
            </div>
          </div>

          {/* Product Image - Hero */}
          <div className="flex-1 relative animate-fade-up animation-delay-200">
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-t from-lime/20 via-olive/10 to-terracotta/10 blur-3xl scale-110" />
              
              <img
                src={bottlesHero}
                alt="BoostUp Pure Shot - 3 příchutě energetického nápoje"
                className="relative w-full max-w-xl mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/5 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-8 justify-center items-center">
            <div className="flex items-center gap-3 px-6 py-3 bg-background/80 backdrop-blur-sm rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-olive animate-pulse" />
              <span className="text-sm font-medium text-foreground">Čajový extrakt</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-background/80 backdrop-blur-sm rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-lime animate-pulse animation-delay-200" />
              <span className="text-sm font-medium text-foreground">Elektrolyty</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-background/80 backdrop-blur-sm rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-terracotta animate-pulse animation-delay-400" />
              <span className="text-sm font-medium text-foreground">Adaptogeny</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
