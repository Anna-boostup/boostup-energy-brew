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
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[150px] rounded-full opacity-10 bg-primary pointer-events-none h-2/3" />

      <div className="relative h-full w-full flex flex-col items-center">
        {/*
            MONUMENTAL FALLING BOTTLES COLUMN:
            Using the high-impact vertical strip provided by the user.
            No animations (static as requested).
        */}
        <div className="absolute inset-0 flex justify-center items-center">
          <img
            src={fallingBottles}
            alt="BoostUp Premium Falling Bottles"
            className="h-full w-auto max-w-none select-none pointer-events-none object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
