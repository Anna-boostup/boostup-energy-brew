import React from "react";
import { motion } from "framer-motion";
import fallingBottles from "@/assets/falling-bottles-column.png";

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-[800px] md:h-[1200px] lg:h-[1800px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[150px] rounded-full opacity-10 bg-primary pointer-events-none h-2/3" />

      <div className="relative w-full flex justify-center py-0 h-full overflow-hidden">
        {/*
            MONUMENTAL FALLING BOTTLES COLUMN (RESTORED):
            - 100% horizontal visibility: w-full h-auto ensures no cropping.
            - Masked with a gradient to 'feather' the top and bottom edges.
        */}
        <div 
          className="relative w-full h-full flex justify-center"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        >
          <img
            src={fallingBottles}
            alt="BoostUp Premium Falling Bottles"
            className="w-full h-auto select-none pointer-events-none object-contain transform-gpu"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
