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
  return (
    <div className={`relative w-full h-[600px] md:h-[800px] lg:h-[900px] ${className} py-8 px-4 overflow-visible`}>
      
      {/* Background Glow - Static generic glow without flavor reaction */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[120px] scale-150 rounded-full opacity-10 bg-primary pointer-events-none h-2/3" />

      {/* Lemon Bottle - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotate: -20 }}
        animate={{ opacity: 1, x: 0, rotate: -12, y: [0, -15, 0] }}
        transition={{ 
          opacity: { duration: 0.8 },
          rotate: { duration: 0.8 },
          x: { duration: 0.8 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-0 left-[-5%] z-30"
      >
        <img
          src={bottleLemon}
          alt="BoostUp Lemon"
          className="w-40 md:w-56 lg:w-72 h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          width={320}
          height={426}
        />
      </motion.div>

      {/* Red Bottle - Middle Right */}
      <motion.div
        initial={{ opacity: 0, x: 50, rotate: 20 }}
        animate={{ opacity: 1, x: 0, rotate: 8, y: [0, 15, 0] }}
        transition={{ 
          opacity: { duration: 0.8, delay: 0.2 },
          rotate: { duration: 0.8, delay: 0.2 },
          x: { duration: 0.8, delay: 0.2 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-[35%] right-[-10%] md:right-[0%] z-20"
      >
        <img
          src={bottleRed}
          alt="BoostUp Red"
          className="w-44 md:w-60 lg:w-80 h-auto drop-shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
          width={320}
          height={426}
        />
      </motion.div>

      {/* Silky Bottle - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -15 }}
        animate={{ opacity: 1, y: 0, rotate: -6, y: [0, -10, 0] }}
        transition={{ 
          opacity: { duration: 0.8, delay: 0.4 },
          rotate: { duration: 0.8, delay: 0.4 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-0 left-[5%] z-10"
      >
        <img
          src={bottleSilky}
          alt="BoostUp Silky"
          className="w-48 md:w-64 lg:w-88 h-auto scale-110 drop-shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
          width={320}
          height={426}
        />
      </motion.div>
    </div>
  );
};

export default ConfiguratorHero;
