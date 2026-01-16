import { Button } from "./ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import bottlesHero from "@/assets/bottles-hero-nobg.png";

const HeroSection = () => {
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
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm tracking-wide animate-fade-up shadow-button animate-bounce-subtle">
            <Zap className="w-5 h-5 text-lime" />
            BRZY NA TRHU
            <Sparkles className="w-5 h-5 text-lime" />
          </div>
        </div>

        {/* Centered Text Content */}
        <div className="text-center animate-fade-up z-10 mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-foreground mb-6 leading-[0.9] tracking-tight">
            <span className="block animate-slide-in-left">ENERGIE</span>
            <span className="block text-gradient-energy animate-slide-in-left animation-delay-200">NA CELÝ DEN</span>
            <span className="block text-3xl md:text-4xl lg:text-5xl font-semibold text-muted-foreground mt-4 animate-slide-in-left animation-delay-400">
              přirozeně.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up animation-delay-500">
            <span className="text-foreground font-bold">60 ml čisté energie</span> z čajového extraktu. 
            Síla 2,5 espressa bez nervozity. Minimálně{" "}
            <span className="text-terracotta font-bold">6 hodin soustředění</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up animation-delay-600">
            <Button variant="hero" size="xl" className="group animate-energy-pulse">
              Objevit produkty
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="rounded-full border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              Náš příběh
            </Button>
          </div>
        </div>

        {/* Product Image - Centered below text */}
        <div className="relative animate-fade-up animation-delay-300 mb-16">
          <div className="relative max-w-3xl mx-auto">
            {/* Multiple glow layers for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-lime/30 via-olive/15 to-terracotta/15 blur-3xl scale-125 animate-pulse-glow" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange/20 to-transparent blur-2xl scale-110 animate-pulse-glow animation-delay-200" />
            
            <img
              src={bottlesHero}
              alt="BoostUp Pure Shot - 3 příchutě energetického nápoje"
              className="relative w-full max-w-2xl mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out animate-float-slow"
            />
          </div>
        </div>

        {/* Trust Badges - Below image */}
        <div className="flex flex-wrap gap-6 justify-center items-center animate-fade-up animation-delay-800">
          <div className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-full shadow-card hover-lift cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-olive animate-pulse" />
            <span className="text-sm font-bold text-foreground">Čajový extrakt</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-full shadow-card hover-lift cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-lime animate-pulse animation-delay-200" />
            <span className="text-sm font-bold text-foreground">Elektrolyty</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-full shadow-card hover-lift cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-terracotta animate-pulse animation-delay-400" />
            <span className="text-sm font-bold text-foreground">Adaptogeny</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-full shadow-card hover-lift cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-orange animate-pulse animation-delay-600" />
            <span className="text-sm font-bold text-foreground">Vitamíny</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
