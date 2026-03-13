
interface MixStackProps {
  images: string[];
  className?: string;
}

const MixStack = ({ images, className }: MixStackProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className} min-h-[300px] md:min-h-[400px]`}>
      {/* Right Bottle (Silky) */}
      <img
        src={images[2]}
        alt="BoostUp Silky"
        className="w-32 md:w-44 lg:w-52 h-auto drop-shadow-2xl translate-x-12 rotate-[12deg] z-0 opacity-90 transition-transform duration-700"
        loading="lazy"
      />
      {/* Left Bottle (Red) */}
      <img
        src={images[1]}
        alt="BoostUp Red"
        className="w-32 md:w-44 lg:w-52 h-auto drop-shadow-2xl -translate-x-12 -rotate-[12deg] z-10 opacity-90 absolute transition-transform duration-700"
        loading="lazy"
      />
      {/* Middle Bottle (Lemon) - Front */}
      <img
        src={images[0]}
        alt="BoostUp Lemon"
        className="w-40 md:w-52 lg:w-60 h-auto drop-shadow-2xl z-20 absolute transition-transform duration-700 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};

export default MixStack;
