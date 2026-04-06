import React from "react";
import { motion } from "framer-motion";
import bottleComposite from "@/assets/bottle-composite-nobg.png";

interface ConfiguratorHeroProps {
  className?: string;
  selectedFlavor?: string | null;
}

const ConfiguratorHero = ({ className }: ConfiguratorHeroProps) => {
  return (
    <div className={`relative w-full h-[800px] md:h-[1000px] lg:h-[1100px] ${className} py-0 px-0 overflow-hidden`}>
      
      {/* Background Glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 blur-[150px] rounded-full opacity-5 bg-primary pointer-events-none h-2/3" />

      <div className="relative h-full w-full flex flex-col items-center">
        {/*
            FALLING BOTTLES COLUMN:
            We use three instances of the transparent composite image vertically
            to cover the full height. Styled as a seamless monumental column of falling products.
        */}
        <div className="absolute left-[5%] md:left-[8%] w-full flex flex-col items-center gap-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[800px] flex justify-center -mt-10"
          >
            <img
              src={bottleComposite}
              alt="BoostUp Falling Bottles 1"
              className="w-full h-auto select-none pointer-events-none"
              style={{ filter: 'contrast(1.02) brightness(1.05)' }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[800px] flex justify-center -mt-5"
          >
            <img
              src={bottleComposite}
              alt="BoostUp Falling Bottles 2"
              className="w-full h-auto select-none pointer-events-none"
              style={{ filter: 'contrast(1.02) brightness(1.05)' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[800px] flex justify-center -mt-5"
          >
            <img
              src={bottleComposite}
              alt="BoostUp Falling Bottles 3"
              className="w-full h-auto select-none pointer-events-none"
              style={{ filter: 'contrast(1.02) brightness(1.05)' }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
