import React from "react";
import { motion } from "framer-motion";
import fallingBottles from "@/assets/falling-bottles-column.png";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-[800px] md:h-[1200px] lg:h-[1800px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime via-terracotta to-olive opacity-20 blur-3xl scale-110 transition-all duration-700" />

      <div className="relative w-full flex justify-center py-0">
        <div className="relative w-full">
          <img
            src={fallingBottles}
            alt="BoostUp Premium Falling Bottles"
            className="w-full h-auto select-none pointer-events-none object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
