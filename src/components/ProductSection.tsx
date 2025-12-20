import { useState } from "react";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import productGreen from "@/assets/product-green.png";
import productRed from "@/assets/product-red.png";
import productYellow from "@/assets/product-yellow.png";

type Flavor = "lemon" | "red" | "silky";
type Pack = 3 | 12 | 21;

const flavors = [
  { 
    id: "lemon" as Flavor, 
    name: "LEMON BLAST", 
    image: productYellow, 
    color: "from-lime to-lime-dark",
    bgColor: "bg-lime",
    textColor: "text-lime-dark",
    description: "Citrusová svěžest pro jasnou mysl"
  },
  { 
    id: "red" as Flavor, 
    name: "RED RUSH", 
    image: productRed, 
    color: "from-terracotta to-terracotta-dark",
    bgColor: "bg-terracotta",
    textColor: "text-terracotta-dark",
    description: "Červené ovoce pro rychlý start"
  },
  { 
    id: "silky" as Flavor, 
    name: "SILKY LEAF", 
    image: productGreen, 
    color: "from-olive to-olive-dark",
    bgColor: "bg-olive",
    textColor: "text-olive-dark",
    description: "Jemný zelený čaj pro dlouhotrvající energii"
  },
];

const packs: Pack[] = [3, 12, 21];
const packPrices = { 3: 149, 12: 499, 21: 799 };

const ProductSection = () => {
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor>("silky");
  const [selectedPack, setSelectedPack] = useState<Pack>(12);
  const [quantity, setQuantity] = useState(1);

  const currentFlavor = flavors.find(f => f.id === selectedFlavor)!;
  const price = packPrices[selectedPack] * quantity;

  return (
    <section id="produkty" className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-background to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6 tracking-wide">
            PRODUKTY
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            VYBER SI SVOU <span className="text-primary">ENERGII</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Product Image */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentFlavor.color} opacity-20 blur-3xl scale-150 transition-all duration-500`} />
              
              {/* Main product */}
              <div className="relative">
                <img
                  src={currentFlavor.image}
                  alt={currentFlavor.name}
                  className="w-56 md:w-72 lg:w-80 h-auto drop-shadow-2xl transition-all duration-500 hover:scale-105"
                />
                
                {/* Floating badge */}
                <div className={`absolute -bottom-4 -right-4 ${currentFlavor.bgColor} text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-lg`}>
                  {selectedPack}x PACK
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-8 max-w-lg">
            {/* Pack Selection */}
            <div>
              <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4 tracking-wide">VYBERTE BALENÍ</h3>
              <div className="flex gap-3">
                {packs.map((pack) => (
                  <button
                    key={pack}
                    onClick={() => setSelectedPack(pack)}
                    className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      selectedPack === pack
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-card text-foreground border-2 border-border hover:border-primary"
                    }`}
                  >
                    {pack}x
                    <span className="block text-xs font-normal opacity-70">
                      {packPrices[pack]} Kč
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Selection */}
            <div>
              <h3 className="font-display text-sm font-semibold text-muted-foreground mb-4 tracking-wide">VYBERTE PŘÍCHUŤ</h3>
              <div className="space-y-3">
                {flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavor(flavor.id)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${
                      selectedFlavor === flavor.id
                        ? `bg-gradient-to-r ${flavor.color} text-primary-foreground shadow-lg`
                        : "bg-card border-2 border-border hover:border-primary"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${selectedFlavor === flavor.id ? 'bg-primary-foreground/20' : flavor.bgColor} flex items-center justify-center`}>
                      {selectedFlavor === flavor.id ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <img src={flavor.image} alt="" className="w-8 h-8 object-contain" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold">{flavor.name}</div>
                      <div className={`text-sm ${selectedFlavor === flavor.id ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {flavor.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-4 bg-card rounded-full px-4 py-2 border-2 border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button variant="hero" size="xl" className="flex-1 group">
                <ShoppingBag className="w-5 h-5" />
                Přidat do košíku
                <span className="font-bold ml-2">{price} Kč</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
