import React from "react";
import { motion } from "framer-motion";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";

interface ConfiguratorHeroProps {
  className?: string;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className} h-[400px] md:h-[500px] w-full max-w-[340px] mx-auto`}>
      {/* Back Bottle (Silky - Teal/Green) */}
      <motion.img
        initial={{ opacity: 0, x: 20, y: 40, rotate: 15 }}
        animate={{ opacity: 1, x: 40, y: -20, rotate: 12 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        src={bottleSilky}
        alt="BoostUp Silky"
        className="absolute w-32 md:w-44 h-auto drop-shadow-2xl z-0 opacity-80"
        width={208}
        height={280}
      />

      {/* Middle Bottle (Red) */}
      <motion.img
        initial={{ opacity: 0, x: -20, y: 40, rotate: -15 }}
        animate={{ opacity: 1, x: -40, y: 10, rotate: -10 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        src={bottleRed}
        alt="BoostUp Red"
        className="absolute w-32 md:w-44 h-auto drop-shadow-2xl z-10 opacity-90"
        width={208}
        height={280}
      />

      {/* Front Bottle (Lemon - Yellow) */}
      <motion.img
        initial={{ opacity: 0, scale: 0.8, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        src={bottleLemon}
        alt="BoostUp Lemon"
        className="relative w-40 md:w-52 h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-20 cursor-pointer"
        width={240}
        height={320}
      />

      {/* Glossy Overlay/Sparkle Effects */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-primary/5 to-transparent blur-3xl rounded-full scale-110 z-0" />
    </div>
  );
};

export default ConfiguratorHero;
