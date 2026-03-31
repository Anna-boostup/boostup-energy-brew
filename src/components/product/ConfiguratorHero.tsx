import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className, selectedFlavor }: ConfiguratorHeroProps) => {
  // Define positions and properties based on selection
  const getBottleProps = (flavor: string) => {
    const isSelected = selectedFlavor === flavor;
    
    // Default positions (when nothing or 'lemon' is selected)
    if (!selectedFlavor || selectedFlavor === 'lemon') {
      if (flavor === 'lemon') return { z: 30, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
      if (flavor === 'red') return { z: 20, x: -60, y: 30, rotate: -12, scale: 0.85, opacity: 0.9 };
      if (flavor === 'silky') return { z: 10, x: 60, y: -20, rotate: 12, scale: 0.85, opacity: 0.8 };
    }

    if (selectedFlavor === 'red') {
      if (flavor === 'red') return { z: 30, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
      if (flavor === 'lemon') return { z: 20, x: 60, y: 30, rotate: 12, scale: 0.85, opacity: 0.9 };
      if (flavor === 'silky') return { z: 10, x: -60, y: -20, rotate: -12, scale: 0.85, opacity: 0.8 };
    }

    if (selectedFlavor === 'silky') {
      if (flavor === 'silky') return { z: 30, x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
      if (flavor === 'lemon') return { z: 20, x: -60, y: 30, rotate: -12, scale: 0.85, opacity: 0.9 };
      if (flavor === 'red') return { z: 10, x: 60, y: -20, rotate: 12, scale: 0.85, opacity: 0.8 };
    }

    return { z: 10, x: 0, y: 0, rotate: 0, scale: 0.8, opacity: 1 };
  };

  const lemonProps = getBottleProps('lemon');
  const redProps = getBottleProps('red');
  const silkyProps = getBottleProps('silky');

  return (
    <div className={`relative flex items-center justify-center ${className} h-[400px] md:h-[500px] w-full max-w-[400px] mx-auto`}>
      {/* Dynamic Glow Background */}
      <AnimatePresence mode="wait">
        <motion.div
           key={selectedFlavor || 'default'}
           initial={{ opacity: 0 }}
           animate={{ opacity: 0.2 }}
           exit={{ opacity: 0 }}
           className={`absolute inset-0 blur-3xl scale-110 rounded-full transition-colors duration-1000 ${
             selectedFlavor === 'lemon' ? 'bg-yellow-400' :
             selectedFlavor === 'red' ? 'bg-red-500' :
             selectedFlavor === 'silky' ? 'bg-emerald-500' :
             'bg-primary'
           }`}
        />
      </AnimatePresence>

      {/* Silky Bottle */}
      <motion.img
        animate={{ 
          zIndex: silkyProps.z,
          x: silkyProps.x,
          y: silkyProps.y,
          rotate: silkyProps.rotate,
          scale: silkyProps.scale,
          opacity: silkyProps.opacity
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
        src={bottleSilky}
        alt="BoostUp Silky"
        className="absolute w-36 md:w-48 h-auto drop-shadow-2xl"
      />

      {/* Red Bottle */}
      <motion.img
        animate={{ 
          zIndex: redProps.z,
          x: redProps.x,
          y: redProps.y,
          rotate: redProps.rotate,
          scale: redProps.scale,
          opacity: redProps.opacity
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
        src={bottleRed}
        alt="BoostUp Red"
        className="absolute w-36 md:w-48 h-auto drop-shadow-2xl"
      />

      {/* Lemon Bottle */}
      <motion.img
        animate={{ 
          zIndex: lemonProps.z,
          x: lemonProps.x,
          y: lemonProps.y,
          rotate: lemonProps.rotate,
          scale: lemonProps.scale,
          opacity: lemonProps.opacity
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
        src={bottleLemon}
        alt="BoostUp Lemon"
        className="absolute w-36 md:w-48 h-auto drop-shadow-2xl"
      />

      {/* High-end Reflection Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent z-40" />
    </div>
  );
};

export default ConfiguratorHero;
