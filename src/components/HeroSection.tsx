import { ArrowRight, Zap, Leaf, Brain, GraduationCap } from "lucide-react";
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
          <div className="w-full lg:w-[60%] text-center lg:text-left animate-fade-up lg:pl-12 xl:pl-20">
            <h1 className="font-display tracking-tight mb-2">
              <span 
                className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-[1.1] mb-1"
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
            <div className="flex flex-col gap-4 mt-8 mb-10 items-center lg:items-start">
              {[
                { icon: <Zap className="w-5 h-5" style={{ color: '#dfdf57' }} />, bold: 'Až 6 hodin energie', text: 'bez pádu na konci', bg: '#f0efd8' },
                { icon: <Leaf className="w-5 h-5" style={{ color: '#3d5a2f' }} />, bold: 'Přírodní extrakty', text: 'bez cukru, bez umělých sladidel', bg: '#e8eedf' },
                { icon: <Brain className="w-5 h-5" style={{ color: '#c27088' }} />, bold: 'Klid pod tlakem', text: 'výkon bez chaosu', bg: '#f0e4e4' },
                { icon: <GraduationCap className="w-5 h-5" style={{ color: '#3d5a2f' }} />, bold: 'Vyvinuto s odborníky', text: 'na Mendelově univerzitě', bg: '#e8eedf' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.bg }}>
                    {item.icon}
                  </div>
                  <p className="text-sm md:text-base" style={{ color: '#3d5a2f' }}>
                    <span className="font-bold">{item.bold}</span>
                    <span className="font-normal"> — {item.text}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="outline"
                size="xl"
                className="rounded-full font-semibold text-base px-8 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ borderColor: '#3d5a2f', color: '#3d5a2f', backgroundColor: 'transparent' }}
                onClick={() => scrollTo('mise')}
              >
                Chci objevit více
              </Button>

              <Button
                size="xl"
                className="group rounded-full font-semibold text-base px-8 hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ backgroundColor: '#3d5a2f', color: '#f4f1e6' }}
                onClick={() => scrollTo('produkty')}
              >
                Chci koupit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform ml-2" />
              </Button>
            </div>

          </div>

          {/* Right column - 40% */}
          <div className="w-full lg:w-[40%] flex justify-center items-center animate-fade-up animation-delay-300 lg:-ml-16">
            <img
              src={bottleHero}
              alt="BoostUp Pure Shot - prémiový energetický shot"
              className="w-[360px] sm:w-[450px] md:w-[520px] lg:max-h-[80vh] lg:w-auto lg:max-w-none object-contain"
              style={{ transform: 'rotate(15deg)' }}
              loading="eager"
              {...({ fetchPriority: "high" } as any)}
            />
          </div>
        </div>

        {/* Tags row - full width below both columns */}
        <div className="flex flex-wrap gap-4 mt-10 justify-center">
          {['SOUSTŘEDĚNÍ', 'STIMULACE', 'ODOLNOST', 'ROVNOVÁHA'].map((label) => (
            <button
              key={label}
              onClick={() => {}}
              className="px-7 py-3 rounded-full text-sm font-semibold tracking-wide transition-opacity hover:opacity-80 cursor-pointer border"
              style={{ borderColor: '#3d5a2f', color: '#3d5a2f', backgroundColor: 'transparent', fontFamily: 'Poppins, sans-serif' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
