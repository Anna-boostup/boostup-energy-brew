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
    { src: bottleLemon, alt: "Lemon", rotate: -12, top: "-15%" },
    { src: bottleRed, alt: "Red", rotate: 8, top: "4%" },
    { src: bottleSilky, alt: "Silky", rotate: -8, top: "23%" },
    { src: bottleLemon, alt: "Lemon", rotate: 12, top: "42%" },
    { src: bottleRed, alt: "Red", rotate: -10, top: "61%" },
    { src: bottleSilky, alt: "Silky", rotate: 12, top: "80%" },
    { src: bottleLemon, alt: "Lemon", rotate: -8, top: "99%" },
  ];

  return (
    <div className={`relative w-full h-[600px] md:h-[800px] lg:h-[900px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow - Minimal */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[120px] rounded-full opacity-5 bg-primary pointer-events-none h-2/3" />

      <div className="relative h-full w-full flex justify-center">
        {bottleStrip.map((bottle, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="absolute left-1/2 -translate-x-1/2 flex justify-center w-full"
            style={{ top: bottle.top, zIndex: 20 - index }}
          >
            <div className="relative flex justify-center w-[300px] md:w-[450px] lg:w-[750px]">
                <img
                    src={bottle.src}
                    alt={bottle.alt}
                    className="w-[180%] max-w-none h-auto select-none pointer-events-none"
                    style={{ 
                        transform: `rotate(${bottle.rotate}deg)`,
                        clipPath: 'inset(0 32% 0 32%)', // Aggressively clip the sides where shadows usually sit
                        filter: 'brightness(1.05) contrast(1.01)'
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
