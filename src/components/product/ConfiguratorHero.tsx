import React from "react";
import { motion } from "framer-motion";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  const bottleStrip = [
    { src: bottleLemon, alt: "Lemon", rotate: -8, top: "-10%" },
    { src: bottleRed, alt: "Red", rotate: 6, top: "15%" },
    { src: bottleSilky, alt: "Silky", rotate: -6, top: "40%" },
    { src: bottleLemon, alt: "Lemon", rotate: 8, top: "65%" },
    { src: bottleRed, alt: "Red", rotate: -6, top: "90%" },
  ];

  return (
    <div className={`relative w-full h-[800px] md:h-[1000px] lg:h-[1100px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow - None */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[150px] rounded-full opacity-5 bg-primary pointer-events-none h-2/3" />

      <div className="relative h-full w-full flex justify-center">
        {bottleStrip.map((bottle, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="absolute left-[8%] flex justify-center w-full"
            style={{ top: bottle.top, zIndex: 10 + index }}
          >
            {/* 
                NON-TOUCHING STRIP: 
                Increased intervals (25%) so bottles don't overlap, 
                plus a 5th bottle to maintain dense strip coverage.
            */}
            <div className="relative overflow-visible w-full max-w-[300px] md:max-w-[450px] lg:max-w-[700px] flex justify-center">
                <img
                  src={bottle.src}
                  alt={bottle.alt}
                  className="w-full h-auto select-none pointer-events-none scale-140"
                  style={{ 
                      transform: `rotate(${bottle.rotate}deg)`,
                      filter: 'contrast(1.05) brightness(1.08)',
                      // 42% clipping on the right to remove all original horizontal shadows
                      clipPath: 'inset(0 42% 0 0)' 
                  }}
                  width={320}
                  height={426}
                />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConfiguratorHero;
