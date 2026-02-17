import React, { useState } from "react";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingBag, Check, Sparkles, Blend, Droplet, Info, Mail } from "lucide-react";
import bottleSingle from "@/assets/bottle-single.jpg";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext"; // Added import from InventoryContext
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    description: "Citrusová svěžest a energie pro jasnou a soustředěnou mysl",
    ingredients: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    labels: ["Bez cukru", "Vegan"]
  },
  {
    id: "red" as Flavor,
    name: "RED RUSH",
    color: "from-terracotta to-terracotta-dark",
    bgColor: "bg-terracotta",
    borderColor: "border-terracotta",
    textColor: "text-cream",
    description: "Červené ovoce a guarana pro tvůj rychlý a efektivní start",
    ingredients: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    labels: ["Vitamíny", "Rychlý nástup"]
  },
  {
    id: "silky" as Flavor,
    name: "SILKY LEAF",
    color: "from-olive to-olive-dark",
    bgColor: "bg-olive",
    borderColor: "border-olive",
    textColor: "text-cream",
    description: "Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii",
    ingredients: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    labels: ["Antioxidanty", "Klidná síla"]
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

  const { addToCart } = useCart();
  const { getStock } = useInventory(); // Added access to getStock from useInventory
  const { toast } = useToast();

  const [mixCounts, setMixCounts] = useState({ lemon: 0, red: 0, silky: 0 });

  // Update mix counts when pack size changes
  React.useEffect(() => {
    const perFlavor = Math.floor(selectedPack / 3);
    const remainder = selectedPack % 3;
    setMixCounts({
      lemon: perFlavor + remainder, // Add remainder to first one for now
      red: perFlavor,
      silky: perFlavor
    });
  }, [selectedPack]);

  const currentFlavor = flavors.find(f => f.id === selectedFlavor)!;
  const price = packPrices[selectedPack] * quantity;
  const currentMixCount = Object.values(mixCounts).reduce((a, b) => a + b, 0);
  const isMixValid = currentMixCount === selectedPack;

  const handleMixChange = (flavorId: Flavor, change: number) => {
    const newCounts = { ...mixCounts, [flavorId]: Math.max(0, mixCounts[flavorId] + change) };
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);

    // Only allow if not exceeding pack size (unless decreasing)
    if (change > 0 && newTotal > selectedPack) return;

    setMixCounts(newCounts);
  };

  const handleAddToCart = () => {
    if (flavorMode === "mix" && !isMixValid) {
      toast({
        title: "Nelze přidat do košíku",
        description: `Prosím vyberte přesně ${selectedPack} kusů. Aktuálně máte vybráno ${currentMixCount}.`,
        variant: "destructive"
      });
      return;
    }

    const mixConfig = flavorMode === "mix" ? mixCounts : undefined;
    const mixIdSuffix = flavorMode === "mix" ? `-${mixCounts.lemon}-${mixCounts.red}-${mixCounts.silky}` : "";

    addToCart({
      id: flavorMode === "mix" ? `mix-${selectedPack}${mixIdSuffix}` : `${selectedFlavor}-${selectedPack}`,
      name: flavorMode === "mix" ? `BoostUp ${selectedPack}x Pack (MIX)` : `BoostUp ${selectedPack}x Pack (${currentFlavor.name})`,
      price: packPrices[selectedPack],
      quantity: quantity,
      flavor: flavorMode === "mix" ? "MIX" : currentFlavor.name,
      pack: selectedPack,
      flavorMode: flavorMode,
      image: bottleSingle,
      mixConfiguration: mixConfig
    });

    toast({
      title: "Přidáno do košíku",
      description: `${quantity}x ${flavorMode === "mix" ? "MIX" : currentFlavor.name} (${selectedPack} ks)`,
    });
  };

  return (
    <TooltipProvider>
      <section id="produkty" className="py-28 bg-secondary/30 relative overflow-hidden">
        {/* Animated background elements */}
        {/* ... (keep background elements) ... */}

        <div className="container mx-auto px-4 relative z-10">
          {/* ... (keep header) ... */}

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
            {/* ... (keep image section) ... */}
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
                      className={`flex-1 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover-lift ${selectedPack === pack
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

              {/* Flavor Mode Selection */}
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">CHCI</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFlavorMode("single")}
                    className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "single"
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
                    className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "mix"
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

                {/* MIX CONFIGURATOR - Enhanced */}
                {flavorMode === "mix" && (
                  <div className="mt-6 animate-fade-up">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-sm font-bold text-muted-foreground tracking-widest">
                        NAMÍCHEJ SI VLASTNÍ MIX
                      </h3>
                      <div className={`text-sm font-bold px-3 py-1 rounded-full ${isMixValid ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        Vybráno: {currentMixCount} / {selectedPack} ks
                      </div>
                    </div>

                    <div className="space-y-3">
                      {flavors.map((flavor, index) => (
                        <div
                          key={flavor.id}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 border-2 ${mixCounts[flavor.id] > 0 ? flavor.borderColor + ' bg-card' : 'border-dashed border-border bg-secondary/30'}`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl shrink-0 ${flavor.bgColor} flex items-center justify-center`}>
                              {flavor.id === "lemon" && <Sparkles className={`w-6 h-6 ${flavor.textColor}`} />}
                              {flavor.id === "red" && <Sparkles className={`w-6 h-6 ${flavor.textColor}`} />}
                              {flavor.id === "silky" && <Droplet className={`w-6 h-6 ${flavor.textColor}`} />}
                              {/* Using generic icon if specialized ones aren't imported or available, but utilizing colors */}
                            </div>

                            {/* Text Info */}
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-bold text-base leading-tight">{flavor.name}</div>
                              <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                                {flavor.description}
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Counter */}
                            <div className="flex items-center gap-2 bg-background rounded-full border border-border px-1 py-1 shadow-sm">
                              <button
                                onClick={() => handleMixChange(flavor.id, -1)}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                                disabled={mixCounts[flavor.id] === 0}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="min-w-[3rem] px-2 text-center font-bold text-sm tabular-nums">
                                {mixCounts[flavor.id]} <span className="text-muted-foreground font-normal">/ {selectedPack}</span>
                              </span>
                              <button
                                onClick={() => handleMixChange(flavor.id, 1)}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                                disabled={currentMixCount >= selectedPack}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Info Tooltip (reused) */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <p className="font-bold mb-1">Složení ({flavor.name}):</p>
                                <p>{flavor.ingredients}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isMixValid && (
                      <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm text-center flex items-center justify-center gap-2 animate-pulse">
                        <Info className="w-4 h-4" />
                        <span>Prosím vyberte ještě {selectedPack - currentMixCount} ks do naplnění balení.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Flavor Selection - only show when single mode */}
              {flavorMode === "single" && (
                <div className="animate-fade-up">
                  <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">VYBERTE PŘÍCHUŤ</h3>
                  <div className="space-y-3">
                    {flavors.map((flavor, index) => (
                      <div key={flavor.id} className="relative group/flavor">
                        <button
                          onClick={() => setSelectedFlavor(flavor.id)}
                          className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 hover-lift ${selectedFlavor === flavor.id
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
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{flavor.name}</span>
                              {flavor.labels && flavor.labels.map(label => (
                                <span key={label} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/10 hidden sm:inline-block">
                                  {label}
                                </span>
                              ))}
                            </div>
                            <div className={`text-sm ${selectedFlavor === flavor.id ? 'opacity-90' : 'text-muted-foreground'}`}>
                              {flavor.description}
                            </div>
                          </div>
                        </button>

                        {/* Info Tooltip */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 rounded-full ${selectedFlavor === flavor.id ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p className="font-bold mb-1">Složení ({flavor.name}):</p>
                              <p>{flavor.ingredients}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to cart */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-4">
                  {/* Global Quantity Counter */}
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


                  {/* Stock Logic Calculation Helper */}
                  {(() => {
                    let isOutOfStock = false;
                    let requiredLemon = 0;
                    let requiredRed = 0;
                    let requiredSilky = 0;

                    if (flavorMode === 'mix') {
                      requiredLemon = mixCounts.lemon * quantity;
                      requiredRed = mixCounts.red * quantity;
                      requiredSilky = mixCounts.silky * quantity;
                    } else {
                      // Single flavor
                      const packSize = selectedPack; // 3, 12, 21
                      if (selectedFlavor === 'lemon') requiredLemon = packSize * quantity;
                      else if (selectedFlavor === 'red') requiredRed = packSize * quantity;
                      else if (selectedFlavor === 'silky') requiredSilky = packSize * quantity;
                    }

                    if (
                      (requiredLemon > 0 && getStock('lemon') < requiredLemon) ||
                      (requiredRed > 0 && getStock('red') < requiredRed) ||
                      (requiredSilky > 0 && getStock('silky') < requiredSilky)
                    ) {
                      isOutOfStock = true;
                    }

                    return (
                      <Button
                        variant="hero"
                        size="xl"
                        className={`flex-1 group animate-energy-pulse transition-all duration-300 ${(flavorMode === "mix" && !isMixValid) || isOutOfStock
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : ""
                          }`}
                        onClick={handleAddToCart}
                        disabled={(flavorMode === "mix" && !isMixValid) || isOutOfStock}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        {flavorMode === "mix" && !isMixValid
                          ? "Vyberte všechny příchutě"
                          : isOutOfStock
                            ? "Vyprodáno"
                            : "Přidat do košíku"
                        }
                        {!isOutOfStock && (
                          <span className="font-bold ml-2">{price} Kč</span>
                        )}
                      </Button>
                    );
                  })()}
                </div>

                {/* Individual Offer Link */}
                <div className="text-center">
                  <a href="#kontakt" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary/50 pb-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    Máte zájem o větší odběr? Individuální nabídka
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default ProductSection;
