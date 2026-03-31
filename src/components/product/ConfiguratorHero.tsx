import React from "react";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative flex flex-col items-center justify-between gap-8 lg:gap-14 ${className} py-4 w-full h-full min-h-[500px] lg:min-h-[750px]`}>
      
      {/* Background Glow - Static generic glow without flavor reaction */}
      <div className="absolute inset-0 blur-[100px] scale-110 rounded-[4rem] opacity-10 bg-primary pointer-events-none" />

      {/* Lemon Bottle */}
      <img
        src={bottleLemon}
        alt="BoostUp Lemon"
        className="relative w-44 md:w-60 lg:w-72 xl:w-80 h-auto z-30 -rotate-[8deg] -translate-x-4 drop-shadow-2xl"
        width={320}
        height={426}
      />

      {/* Red Bottle */}
      <img
        src={bottleRed}
        alt="BoostUp Red"
        className="relative w-44 md:w-60 lg:w-72 xl:w-80 h-auto z-20 rotate-[6deg] translate-x-6 drop-shadow-2xl"
        width={320}
        height={426}
      />

      {/* Silky Bottle */}
      <img
        src={bottleSilky}
        alt="BoostUp Silky"
        className="relative w-44 md:w-60 lg:w-72 xl:w-80 h-auto z-10 -rotate-[6deg] -translate-x-2 drop-shadow-2xl"
        width={320}
        height={426}
      />
    </div>
  );
};

export default ConfiguratorHero;
