import React from "react";
import { motion } from "framer-motion";
import fallingBottles from "@/assets/falling-bottles.png";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-[800px] md:h-[1100px] lg:h-[1500px] ${className} py-0 px-0 overflow-hidden bg-transparent`}>
      
      {/* Background Glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[150px] rounded-full opacity-10 bg-primary pointer-events-none h-2/3" />

      <div className="relative h-full w-full flex flex-col items-center">
        {/*
            MONUMENTAL FALLING BOTTLES:
            A high-impact composite of 5 bottles. 
            Mix-blend-mode: multiply is used to blend the light background of the image
            into the site's cream theme.
        */}
        <div className="absolute left-0 w-full h-full flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 150, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { duration: 1.8, ease: "easeOut" }
            }}
            className="relative w-full h-full flex justify-center"
          >
            <motion.img
              src={fallingBottles}
              alt="BoostUp Premium Falling Bottles"
              className="h-full w-auto max-w-none select-none pointer-events-none object-contain"
              animate={{ 
                y: [0, -30, 0],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ 
                mixBlendMode: 'multiply',
                filter: 'contrast(1.08) brightness(1.05)'
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
