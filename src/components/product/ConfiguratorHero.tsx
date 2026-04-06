import React from "react";
import { motion } from "framer-motion";
import fallingBottles from "@/assets/falling-bottles-column.png";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-auto ${className} py-0 px-0 overflow-hidden`}>
      <div className="relative w-full flex justify-center py-0 overflow-hidden">
        {/*
            MONUMENTAL FALLING BOTTLES COLUMN (HEIGHT OPTIMIZED):
            - h-auto ensures no surplus empty space; container perfectly wraps the image.
            - Masked with a gradient to 'feather' the top and bottom edges.
        */}
        <div 
          className="relative w-full flex justify-center"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
          }}
        >
          <img
            src={fallingBottles}
            alt="BoostUp Premium Falling Bottles"
            className="w-full h-auto select-none pointer-events-none object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
