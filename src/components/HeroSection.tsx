import { Button } from "./ui/button";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import bottlesHero from "@/assets/bottles-hero-final.png";

import { SITE_CONTENT } from "@/config/site-content";

const HeroSection = () => {
  const content = SITE_CONTENT.hero;

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
            {content.announcement}
            <Sparkles className="w-5 h-5 text-lime" />
          </div>
        </div>

        {/* Centered Text Content */}
        <div className="text-center animate-fade-up z-10 mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-foreground mb-6 leading-[0.9] tracking-tight">
            <span className="block animate-slide-in-left">{content.headline.part1}</span>
            <span className="block text-gradient-energy animate-slide-in-left animation-delay-200">{content.headline.gradient}</span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-muted-foreground mt-4 animate-slide-in-left animation-delay-400">
              {content.headline.part2}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up animation-delay-500">
            {content.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up animation-delay-600 items-center">
            <Button
              variant="hero"
              size="xl"
              className="group min-w-[200px] shadow-lg hover:shadow-xl transition-all"
              onClick={() => document.getElementById('produkty')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {content.cta.primary}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform ml-2" />
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="rounded-full border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 min-w-[200px] shadow-sm hover:shadow-md"
              onClick={() => document.getElementById('mise')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {content.cta.secondary}
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="rounded-full border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white transition-all duration-300 min-w-[200px] shadow-sm hover:shadow-md"
              onClick={() => document.getElementById('3b')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {content.cta.concept3b}
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
              className="relative w-full max-w-2xl mx-auto hover:scale-105 transition-transform duration-700 ease-out animate-float-slow"
              style={{
                filter: 'drop-shadow(0 30px 60px rgba(61, 90, 47, 0.4)) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2))'
              }}
            />

            {/* Soft shadow underneath for levitation effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-8 bg-foreground/20 blur-2xl rounded-full" />
          </div>
        </div>

        {/* Trust Badges - Below image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 sm:gap-6 justify-center items-center animate-fade-up animation-delay-800">
          {content.trustBadges.map((badge, idx) => {
            const colors = ["bg-olive", "bg-lime", "bg-terracotta", "bg-orange"];
            return (
              <div key={badge} className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-2xl sm:rounded-full shadow-card">
                <div className={`w-4 h-4 rounded-full ${colors[idx % colors.length]} animate-pulse`} style={{ animationDelay: `${idx * 200}ms` }} />
                <span className="text-sm font-bold text-foreground">{badge}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
