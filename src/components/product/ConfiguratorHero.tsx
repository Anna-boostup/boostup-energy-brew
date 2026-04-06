import React from "react";
import { motion } from "framer-motion";
import fallingBottles from "@/assets/bottle-composite-nobg.png";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-[800px] md:h-[1000px] lg:h-[1300px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[150px] rounded-full opacity-10 bg-primary pointer-events-none h-2/3" />

      <div className="relative h-full w-full flex flex-col items-center">
        {/*
            MONUMENTAL FALLING BOTTLES:
            We use a single high-impact composite image that fills the vertical space
            with a dynamic "falling" arrangement of BoostUp bottles.
        */}
        <div className="absolute left-0 w-full h-full flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { duration: 1.5, ease: "easeOut" }
            }}
            className="relative w-full h-full flex justify-center"
          >
            <motion.img
              src={fallingBottles}
              alt="BoostUp Premium Falling Bottles"
              className="h-full w-auto max-w-none select-none pointer-events-none object-contain"
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ 
                filter: 'contrast(1.05) brightness(1.02) drop-shadow(0 20px 50px rgba(0,0,0,0.15))' 
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
