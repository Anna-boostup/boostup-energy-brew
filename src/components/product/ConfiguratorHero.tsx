import React from "react";
import { motion } from "framer-motion";
import fallingBottles from "@/assets/falling-bottles-column.png";

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-[800px] md:h-[1200px] lg:h-[1800px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime via-terracotta to-olive opacity-20 blur-3xl scale-110 transition-all duration-700" />

      <div className="relative w-full flex justify-center py-0 h-full">
        {/*
            MONUMENTAL FALLING BOTTLES COLUMN (OPTIMIZED):
            - Masked with a gradient to 'feather' the top and bottom edges.
            - Scaled to 1.15 to 'crop' the empty horizontal space from the 1080x3240 strip.
        */}
        <div 
          className="relative w-full h-full flex justify-center overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        >
          <img
            src={fallingBottles}
            alt="BoostUp Premium Falling Bottles"
            className="w-full h-auto select-none pointer-events-none object-cover scale-[1.15] transform-gpu"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
