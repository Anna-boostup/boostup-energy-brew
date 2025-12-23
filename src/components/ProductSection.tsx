import { useState } from "react";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingBag, Check, Sparkles, Blend, Droplet } from "lucide-react";
import bottleSingle from "@/assets/bottle-single.jpg";

type Flavor = "lemon" | "red" | "silky";
type Pack = 3 | 12 | 21;
type FlavorMode = "single" | "mix";

const flavors = [
  { 
    id: "lemon" as Flavor, 
    name: "LEMON BLAST", 
    color: "from-lime to-lime-dark",
    bgColor: "bg-lime",
    borderColor: "border-lime",
    textColor: "text-foreground",
    description: "Citrusová svěžest pro jasnou mysl"
  },
  { 
    id: "red" as Flavor, 
    name: "RED RUSH", 
    color: "from-terracotta to-terracotta-dark",
    bgColor: "bg-terracotta",
    borderColor: "border-terracotta",
    textColor: "text-cream",
    description: "Červené ovoce pro rychlý start"
  },
  { 
    id: "silky" as Flavor, 
    name: "SILKY LEAF", 
    color: "from-olive to-olive-dark",
    bgColor: "bg-olive",
    borderColor: "border-olive",
    textColor: "text-cream",
    description: "Jemný zelený čaj pro dlouhotrvající energii"
  },
];

const packs: Pack[] = [3, 12, 21];
const packPrices = { 3: 149, 12: 499, 21: 799 };

// Mix description based on pack size
const getMixDescription = (pack: Pack): string => {
  switch (pack) {
    case 3: return "1× Lemon + 1× Red + 1× Silky";
    case 12: return "4× Lemon + 4× Red + 4× Silky";
    case 21: return "7× Lemon + 7× Red + 7× Silky";
  }
};

const ProductSection = () => {
  const [flavorMode, setFlavorMode] = useState<FlavorMode>("single");
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor>("silky");
  const [selectedPack, setSelectedPack] = useState<Pack>(12);
  const [quantity, setQuantity] = useState(1);

  const currentFlavor = flavors.find(f => f.id === selectedFlavor)!;
  const price = packPrices[selectedPack] * quantity;

  return (
    <section id="produkty" className="py-28 bg-secondary/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-lime/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-terracotta/10 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-olive/5 rounded-full blur-3xl animate-pulse-soft" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold mb-6 tracking-wide shadow-button">
            <Sparkles className="w-4 h-4" />
            PRODUKTY
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6">
            VYBER SI SVOU
            <span className="block text-gradient-energy">ENERGII</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
          {/* Product Image with Levitation Effect */}
          <div className="flex-1 flex items-center justify-center animate-fade-up animation-delay-200">
            <div className="relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 ${flavorMode === "mix" ? "bg-gradient-to-br from-lime via-terracotta to-olive" : `bg-gradient-to-br ${currentFlavor.color}`} opacity-30 blur-3xl scale-125 transition-all duration-700 animate-pulse-glow`} />
              
              {/* Main product with levitation */}
              <div className="relative animate-float">
                <div className="relative">
                  <img
                    src={bottleSingle}
                    alt={flavorMode === "mix" ? "BoostUp Mix" : currentFlavor.name}
                    className="w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl transition-all duration-500 hover:scale-110"
                    style={{
                      filter: 'drop-shadow(0 40px 40px rgba(61, 90, 47, 0.3))'
                    }}
                  />
                </div>
                
                {/* Floating badge */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${flavorMode === "mix" ? "bg-gradient-to-r from-lime via-terracotta to-olive" : currentFlavor.bgColor} ${flavorMode === "mix" ? "text-cream" : currentFlavor.textColor} px-6 py-3 rounded-2xl font-bold shadow-lg animate-bounce-subtle`}>
                  <span className="text-lg">{selectedPack}x</span>
                  <span className="text-sm ml-1">{flavorMode === "mix" ? "MIX" : "PACK"}</span>
                </div>
              </div>
              
              {/* Shadow on ground */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-foreground/20 rounded-full blur-xl" />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-8 max-w-lg animate-fade-up animation-delay-400">
            {/* Pack Selection */}
            <div>
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">VYBERTE BALENÍ</h3>
              <div className="flex gap-3">
                {packs.map((pack, index) => (
                  <button
                    key={pack}
                    onClick={() => setSelectedPack(pack)}
                    className={`flex-1 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover-lift ${
                      selectedPack === pack
                        ? "bg-primary text-primary-foreground shadow-button scale-105"
                        : "bg-card text-foreground border-2 border-border hover:border-primary"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {pack}x
                    <span className="block text-sm font-semibold opacity-80">
                      {packPrices[pack]} Kč
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Mode Selection - NEW */}
            <div>
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">CHCI</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setFlavorMode("single")}
                  className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${
                    flavorMode === "single"
                      ? "bg-primary text-primary-foreground shadow-button scale-[1.02]"
                      : "bg-card text-foreground border-2 border-border hover:border-primary"
                  }`}
                >
                  <Droplet className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">Jednu příchuť</div>
                    <div className={`text-xs ${flavorMode === "single" ? "opacity-80" : "text-muted-foreground"}`}>
                      Vyberu si níže
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setFlavorMode("mix")}
                  className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${
                    flavorMode === "mix"
                      ? "bg-gradient-to-r from-lime via-terracotta to-olive text-cream shadow-button scale-[1.02]"
                      : "bg-card text-foreground border-2 border-border hover:border-primary"
                  }`}
                >
                  <Blend className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-bold">Mix příchutí</div>
                    <div className={`text-xs ${flavorMode === "mix" ? "opacity-90" : "text-muted-foreground"}`}>
                      Všechny 3 najednou
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Mix description */}
              {flavorMode === "mix" && (
                <div className="mt-4 p-4 rounded-xl bg-card border-2 border-dashed border-lime/50 animate-fade-up">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
                    <Blend className="w-4 h-4 text-lime" />
                    Složení mixu:
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getMixDescription(selectedPack)}
                  </div>
                </div>
              )}
            </div>

            {/* Flavor Selection - only show when single mode */}
            {flavorMode === "single" && (
              <div className="animate-fade-up">
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">VYBERTE PŘÍCHUŤ</h3>
                <div className="space-y-3">
                  {flavors.map((flavor, index) => (
                    <button
                      key={flavor.id}
                      onClick={() => setSelectedFlavor(flavor.id)}
                      className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover-lift ${
                        selectedFlavor === flavor.id
                          ? `bg-gradient-to-r ${flavor.color} ${flavor.textColor} shadow-lg scale-[1.02]`
                          : `bg-card border-2 ${flavor.borderColor} hover:scale-[1.01]`
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-14 h-14 rounded-xl ${selectedFlavor === flavor.id ? 'bg-cream/20' : flavor.bgColor} flex items-center justify-center transition-transform duration-300 ${selectedFlavor === flavor.id ? 'scale-110' : ''}`}>
                        {selectedFlavor === flavor.id ? (
                          <Check className="w-7 h-7" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-cream/50" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-lg">{flavor.name}</div>
                        <div className={`text-sm ${selectedFlavor === flavor.id ? 'opacity-90' : 'text-muted-foreground'}`}>
                          {flavor.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to cart */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-4 bg-card rounded-full px-5 py-3 border-2 border-border shadow-card">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-10 text-center font-bold text-2xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button variant="hero" size="xl" className="flex-1 group animate-energy-pulse">
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
