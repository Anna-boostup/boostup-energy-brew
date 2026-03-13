
interface MixStackProps {
  images: string[];
  className?: string;
}

const MixStack = ({ images, className }: MixStackProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Right Bottle (Silky) */}
      <img
        src={images[2]}
        alt="BoostUp Silky - energetický shot z čajového extraktu"
        className="w-44 md:w-56 lg:w-64 h-auto drop-shadow-2xl translate-x-16 rotate-[15deg] z-0 opacity-90"
        loading="lazy"
        width={300}
        height={400}
      />
      {/* Left Bottle (Red) */}
      <img
        src={images[1]}
        alt="BoostUp Red - přírodní energy shot s příchutí lesních plodů"
        className="w-44 md:w-56 lg:w-64 h-auto drop-shadow-2xl -translate-x-16 -rotate-[15deg] z-10 opacity-90 absolute"
        loading="lazy"
        width={300}
        height={400}
      />
      {/* Middle Bottle (Lemon) - Front */}
      <img
        src={images[0]}
        alt="BoostUp Lemon - osvěžující energetický shot s citrusy"
        className="w-56 md:w-72 lg:w-80 h-auto drop-shadow-2xl z-20 absolute"
        loading="lazy"
        width={400}
        height={500}
      />
    </div>
  );
};

export default MixStack;
