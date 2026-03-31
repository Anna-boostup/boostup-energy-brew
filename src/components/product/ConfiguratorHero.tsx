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
    <div className={`relative flex flex-col items-center justify-center gap-2 md:gap-4 ${className} py-4 w-full max-w-[400px] mx-auto`}>
      {/* Background Glow */}
      <div
         className={`absolute inset-0 blur-3xl scale-110 rounded-full transition-colors duration-1000 opacity-20 pointer-events-none ${
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
        className={`relative w-32 md:w-40 h-auto z-30 transition-shadow duration-500 -rotate-12 ${
            selectedFlavor === 'lemon' 
                ? 'drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]' 
                : 'drop-shadow-xl opacity-90'
        }`}
        width={240}
        height={320}
      />

      {/* Red Bottle */}
      <img
        src={bottleRed}
        alt="BoostUp Red"
        className={`relative w-32 md:w-40 h-auto z-20 transition-shadow duration-500 rotate-6 ${
            selectedFlavor === 'red' 
                ? 'drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]' 
                : 'drop-shadow-xl opacity-90'
        }`}
        width={240}
        height={320}
      />

      {/* Silky Bottle */}
      <img
        src={bottleSilky}
        alt="BoostUp Silky"
        className={`relative w-32 md:w-40 h-auto z-10 transition-shadow duration-500 -rotate-6 translate-x-4 ${
            selectedFlavor === 'silky' 
                ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
                : 'drop-shadow-xl opacity-90'
        }`}
        width={240}
        height={320}
      />
    </div>
  );
};

export default ConfiguratorHero;
