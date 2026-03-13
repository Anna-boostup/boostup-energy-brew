import bottlesHero from "@/assets/hero-vse.webp";
import bottlesHeroMobile from "@/assets/hero-vse-mobile.webp";

const HeroImage = () => {
  return (
    <div className="relative animate-fade-up animation-delay-300 mb-8 sm:mb-16">
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-lime/10 to-transparent pointer-events-none opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-lime/30 via-olive/15 to-terracotta/15 blur-3xl scale-125 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange/20 to-transparent blur-2xl scale-110 pointer-events-none" />

        <img
          src={bottlesHero}
          srcSet={`${bottlesHeroMobile} 600w, ${bottlesHero} 1200w`}
          sizes="(max-width: 600px) 100vw, 800px"
          className="relative w-full max-w-2xl mx-auto drop-shadow-xl"
          width={672}
          height={504}
          loading="eager"
          {...({ fetchPriority: "high" } as any)}
          alt="BoostUp Supplements - Pure Shot Bottles"
        />
      </div>
    </div>
  );
};

export default HeroImage;
