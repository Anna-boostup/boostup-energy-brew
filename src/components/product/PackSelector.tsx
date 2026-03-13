
import { PACK_SIZES, PACK_PRICES } from "@/config/product-data";

type Pack = typeof PACK_SIZES[number];

interface PackSelectorProps {
  selectedPack: Pack | null;
  onSelectPack: (pack: Pack) => void;
}

const PackSelector = ({ selectedPack, onSelectPack }: PackSelectorProps) => {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-foreground/80 mb-4 tracking-widest">VYBERTE BALENÍ</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PACK_SIZES.map((pack, index) => (
          <button
            key={pack}
            onClick={() => onSelectPack(pack)}
            className={`relative py-4 sm:py-5 px-4 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all duration-300 hover-lift ${selectedPack === pack
              ? "bg-primary border-primary text-primary-foreground shadow-button"
              : "border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60"
              }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {pack === 3 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-olive text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-20 whitespace-nowrap">
                76 KČ / SHOT
              </div>
            )}
            {pack === 12 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-20 whitespace-nowrap">
                70,80 KČ / SHOT
              </div>
            )}
            {pack === 21 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm z-20 whitespace-nowrap">
                66,60 KČ / SHOT
              </div>
            )}
            {pack}x
            <span className="block text-xs sm:text-sm font-semibold">
              {PACK_PRICES[pack]} Kč
            </span>
            {pack === 21 && (
              <span className="block text-[9px] font-bold text-green-600 mt-1 uppercase leading-none">
                + Doprava zdarma
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PackSelector;
