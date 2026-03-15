import { ArrowRight, Zap, Target, Settings } from "lucide-react";
import { Button } from "./ui/button";
import bottleHero from "@/assets/bottle-silky-hero.png";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="pt-20 relative overflow-hidden" style={{ backgroundColor: '#f4f1e6' }}>
      <div className="container mx-auto px-4 pt-4 md:pt-8 pb-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
          
          {/* Left column - 60% */}
          <div className="w-full lg:w-[60%] text-center lg:text-left animate-fade-up">
            <h1 className="font-display tracking-tight mb-2">
              <span 
                className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.1] mb-1"
                style={{ color: '#3d5a2f' }}
              >
                OBJEVTE NOVÝ STANDARD
              </span>
              <span 
                className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.1]"
                style={{
                  background: 'linear-gradient(to right, #dfdf57, #f29739, #aa263e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                STABILNÍHO SOUSTŘEDĚNÍ
              </span>
            </h1>

            {/* Benefits */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 mb-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#3d5a2f' }}>
                <Zap className="w-4 h-4 flex-shrink-0" style={{ color: '#dfdf57' }} />
                <span>Až 6 hodin soustředění</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#3d5a2f' }}>
                <Target className="w-4 h-4 flex-shrink-0" style={{ color: '#dfdf57' }} />
                <span>Soustředění bez chaosu</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#3d5a2f' }}>
                <Settings className="w-4 h-4 flex-shrink-0" style={{ color: '#dfdf57' }} />
                <span>Chytřejší práce s energií</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="xl"
                className="group rounded-full font-semibold text-base px-8 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ backgroundColor: '#3d5a2f', color: '#f4f1e6' }}
                onClick={() => scrollTo('produkty')}
              >
                Chci koupit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform ml-2" />
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="rounded-full font-semibold text-base px-8 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ borderColor: '#3d5a2f', color: '#3d5a2f', backgroundColor: 'transparent' }}
                onClick={() => scrollTo('mise')}
              >
                Chci objevit více
              </Button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
              {[
                { label: 'SOUSTŘEDĚNÍ', color: '#3d5a2f' },
                { label: 'STIMULACE', color: '#dfdf57' },
                { label: 'ODOLNOST', color: '#aa263e' },
                { label: 'ROVNOVÁHA', color: '#f29739' },
              ].map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-opacity hover:opacity-80 cursor-pointer"
                  style={{ borderColor: '#3d5a2f', color: '#3d5a2f', backgroundColor: 'transparent' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right column - 40% */}
          <div className="w-full lg:w-[40%] flex justify-center items-center animate-fade-up animation-delay-300 lg:-ml-16">
            <img
              src={bottleHero}
              alt="BoostUp Pure Shot - prémiový energetický shot"
              className="w-[320px] sm:w-[400px] md:w-[480px] lg:max-h-[70vh] lg:w-auto lg:max-w-none object-contain"
              style={{ transform: 'rotate(15deg)' }}
              loading="eager"
              {...({ fetchPriority: "high" } as any)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
