import React from "react";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className, selectedFlavor }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative flex flex-col items-center justify-between gap-8 lg:gap-14 ${className} py-4 w-full h-full min-h-[500px] lg:min-h-[750px]`}>
      {/* Background Glow */}
      <div
         className={`absolute inset-0 blur-[100px] scale-110 rounded-[4rem] transition-colors duration-1000 opacity-20 pointer-events-none ${
           selectedFlavor === 'lemon' ? 'bg-yellow-400' :
           selectedFlavor === 'red' ? 'bg-red-500' :
           selectedFlavor === 'silky' ? 'bg-emerald-500' :
           'bg-primary'
         }`}
      />

      {/* Lemon Bottle */}
      <img
        src={bottleLemon}
        alt="BoostUp Lemon"
        className={`relative w-44 md:w-60 lg:w-72 xl:w-80 h-auto z-30 transition-all duration-500 -rotate-[8deg] -translate-x-4 ${
            selectedFlavor === 'lemon' 
                ? 'drop-shadow-[0_0_40px_rgba(250,204,21,0.5)] scale-105' 
                : 'drop-shadow-2xl opacity-90'
        }`}
        width={320}
        height={426}
      />

      {/* Red Bottle */}
      <img
        src={bottleRed}
        alt="BoostUp Red"
        className={`relative w-44 md:w-60 lg:w-72 xl:w-80 h-auto z-20 transition-all duration-500 rotate-[6deg] translate-x-6 ${
            selectedFlavor === 'red' 
                ? 'drop-shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-105' 
                : 'drop-shadow-2xl opacity-90'
        }`}
        width={320}
        height={426}
      />

      {/* Silky Bottle */}
      <img
        src={bottleSilky}
        alt="BoostUp Silky"
        className={`relative w-44 md:w-60 lg:w-72 xl:w-80 h-auto z-10 transition-all duration-500 -rotate-[6deg] -translate-x-2 ${
            selectedFlavor === 'silky' 
                ? 'drop-shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105' 
                : 'drop-shadow-2xl opacity-90'
        }`}
        width={320}
        height={426}
      />
    </div>
  );
};

export default ConfiguratorHero;
