import bottleComposite from "@/assets/bottle-composite.jpg";

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
            COMPOSITE STRIP:
            We use two instances of the 3-bottle composite image vertically
            to cover the full height. Styled as a seamless monumental column.
        */}
        <div className="absolute left-[8%] w-full flex flex-col items-center gap-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[900px] flex justify-center -mt-20"
          >
            <img
              src={bottleComposite}
              alt="BoostUp Bottle Strip"
              className="w-full h-auto select-none pointer-events-none scale-125"
              style={{ 
                  filter: 'contrast(1.02) brightness(1.05)',
                  // Original image might have extra white space, clip specifically
                  clipPath: 'inset(0% 10% 0% 10%)'
              }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[900px] flex justify-center -mt-10"
          >
            <img
              src={bottleComposite}
              alt="BoostUp Bottle Strip 2"
              className="w-full h-auto select-none pointer-events-none scale-125"
              style={{ 
                  filter: 'contrast(1.02) brightness(1.05)',
                  clipPath: 'inset(0% 10% 0% 10%)'
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorHero;
