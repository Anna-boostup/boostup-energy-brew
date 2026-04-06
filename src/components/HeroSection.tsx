import { useState } from "react";
import { ArrowRight, Zap, Leaf, Brain, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { useContent } from "@/context/ContentContext";
import { lazy, Suspense } from "react";
import bottleSilkyHero from "@/assets/bottle-silky-hero.png";
const IngredientDialog = lazy(() => import("./IngredientDialog"));

const HeroSection = () => {
  const { content: SITE_CONTENT } = useContent();
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null);

  const benefitIcons = [
    <Zap className="w-5 h-5" style={{ color: '#3d5a2f' }} />,
    <Leaf className="w-5 h-5" style={{ color: '#3d5a2f' }} />,
    <Brain className="w-5 h-5" style={{ color: '#3d5a2f' }} />,
    <GraduationCap className="w-5 h-5" style={{ color: '#3d5a2f' }} />,
  ];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="pt-24 relative overflow-hidden" style={{ backgroundColor: '#f4f1e6' }}>
      <div className="container mx-auto px-4 pt-0 pb-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
          
          {/* Left column - 60% */}
          <div className="w-full lg:w-[60%] text-center lg:text-left animate-fade-up lg:pl-12 xl:pl-20">
            <h1 className="font-display tracking-tight mb-2">
              <span 
                className="block text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-[1.1] mb-1"
                style={{ color: '#3d5a2f' }}
              >
                {SITE_CONTENT.hero.headline.part1}
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
                {SITE_CONTENT.hero.headline.gradient}
              </span>
            </h1>

            {/* Benefits */}
            <div className="flex flex-col gap-4 mt-8 mb-10 items-center lg:items-start">
              {SITE_CONTENT.hero.benefits.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8eedf' }}>
                    {benefitIcons[i]}
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
                className="rounded-full font-black text-base px-10 hover:scale-110 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:-rotate-1 active:scale-95"
                style={{ borderColor: '#3d5a2f', color: '#3d5a2f', backgroundColor: 'transparent' }}
                onClick={() => scrollTo('mise')}
              >
                {SITE_CONTENT.hero.cta.secondary}
              </Button>

              <Button
                size="xl"
                className="group rounded-full font-black text-base px-10 hover:scale-110 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl hover:rotate-1 active:scale-95"
                style={{ backgroundColor: '#3d5a2f', color: '#f4f1e6' }}
                onClick={() => scrollTo('produkty')}
              >
                {SITE_CONTENT.hero.cta.primary}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform ml-2" />
              </Button>
            </div>

          </div>

          {/* Right column - 40% */}
          <div className="w-full lg:w-[40%] flex justify-center items-center animate-fade-up animation-delay-300 lg:-ml-16 relative">
            {/* Smoke/fog effect behind bottle */}
            <div className="absolute inset-0 pointer-events-none" style={{ filter: 'blur(50px)', opacity: 0.55 }}>
              <div className="absolute top-[15%] left-[5%] w-[70%] h-[45%] rounded-full" style={{ background: 'radial-gradient(ellipse, #dfdf57, transparent 65%)' }} />
              <div className="absolute top-[30%] left-[20%] w-[65%] h-[40%] rounded-full" style={{ background: 'radial-gradient(ellipse, #f29739, transparent 65%)' }} />
              <div className="absolute top-[45%] left-[10%] w-[70%] h-[40%] rounded-full" style={{ background: 'radial-gradient(ellipse, #aa263e, transparent 65%)' }} />
            </div>
            {/* 
              IMPORTANT: These classes (w-[360px] sm:w-[480px] md:w-[580px] lg:max-h-[85vh]) 
              must be preserved even if switching back to .webp or different assets 
              to ensure the bottle remains prominent/enlarged as requested.
            */}
            <img
              src={bottleSilkyHero}
              alt="BoostUp Pure Shot - prémiový energetický shot"
              className="w-[360px] sm:w-[480px] md:w-[580px] lg:max-h-[85vh] lg:w-auto lg:max-w-none object-contain relative z-10"
              style={{ transform: 'rotate(15deg)' }}
              loading="eager"
              {...({ fetchPriority: "high" } as any)}
            />
          </div>
        </div>

        {/* Tags row - full width below both columns */}
        <div className="flex flex-wrap gap-4 mt-2 justify-center">
          {SITE_CONTENT.hero.tags.map((item) => (
            <button
              key={item.ingredientId}
              onClick={() => setActiveIngredient(item.ingredientId)}
              className="flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-black tracking-widest transition-all border-0 hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer group hover:rotate-1"
              style={{
                background: 'linear-gradient(135deg, #fffcf0, #f4f1e6)',
                color: '#3d5a2f',
                fontFamily: 'Poppins, sans-serif',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-150 group-hover:animate-pulse" 
                style={{ backgroundColor: item.dotColor }} 
              />
              <span className="uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeIngredient && (
        <Suspense fallback={null}>
          <IngredientDialog
            isOpen={!!activeIngredient}
            onClose={() => setActiveIngredient(null)}
            data={SITE_CONTENT.ingredientDetails[activeIngredient as keyof typeof SITE_CONTENT.ingredientDetails]}
            colorClass={
              activeIngredient === 'stimulants' ? 'bg-lime' :
              activeIngredient === 'electrolytes' ? 'bg-terracotta' :
              activeIngredient === 'adaptogens' ? 'bg-orange' :
              'bg-olive'
            }
          />
        </Suspense>
      )}
    </section>
  );
};

export default HeroSection;
