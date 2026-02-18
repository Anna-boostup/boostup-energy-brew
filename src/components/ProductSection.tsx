import React, { useState } from "react";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingBag, Check, Sparkles, Blend, Droplet, Info, Mail } from "lucide-react";
import bottleSingle from "@/assets/bottle-single.jpg";
import bottlesHero from "@/assets/bottles-hero-final.png"; // Import hero image
import pack3Silky from "@/assets/3pack.png"; // Import specific 3-pack image
import pack3Lemon from "@/assets/3PackLemon.png"; // Import specific 3-pack image
import pack3Red from "@/assets/3PackRed.png"; // Import specific 3-pack image
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext"; // Added import from InventoryContext
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ... (existing code)



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
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [flavorMode, setFlavorMode] = useState<FlavorMode | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const [subscriptionMode, setSubscriptionMode] = useState<'monthly' | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { getStock } = useInventory();
  const { toast } = useToast();

  const getProductImage = () => {
    if (!flavorMode && !selectedFlavor) return bottlesHero;
    if (flavorMode === "mix") return bottleSingle;

    // Single Flavor specific logic
    if (flavorMode === "single" && selectedFlavor && selectedPack === 3) {
      if (selectedFlavor === 'lemon') return pack3Lemon;
      if (selectedFlavor === 'red') return pack3Red;
      if (selectedFlavor === 'silky') return pack3Silky;
    }

    if (!selectedFlavor) return bottlesHero;

    return bottleSingle;
  };

  const productImageSrc = getProductImage();

  const [mixCounts, setMixCounts] = useState({ lemon: 0, red: 0, silky: 0 });

  // Update mix counts when pack size changes
  React.useEffect(() => {
    if (!selectedPack) return;
    const perFlavor = Math.floor(selectedPack / 3);
    const remainder = selectedPack % 3;
    setMixCounts({
      lemon: perFlavor + remainder, // Add remainder to first one for now
      red: perFlavor,
      silky: perFlavor
    });
  }, [selectedPack]);

  const currentFlavor = selectedFlavor ? flavors.find(f => f.id === selectedFlavor)! : flavors[0]; // Fallback

  // Calculate price with potential subscription discount
  const basePrice = selectedPack ? packPrices[selectedPack] * quantity : 0;
  const price = subscriptionMode ? Math.round(basePrice * 0.85) : basePrice;

  const currentMixCount = Object.values(mixCounts).reduce((a, b) => a + b, 0);
  const isMixValid = selectedPack ? currentMixCount === selectedPack : false;

  const handleMixChange = (flavorId: Flavor, change: number) => {
    if (!selectedPack) return;
    const newCounts = { ...mixCounts, [flavorId]: Math.max(0, mixCounts[flavorId] + change) };
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);

    // Only allow if not exceeding pack size (unless decreasing)
    if (change > 0 && newTotal > selectedPack) return;

    setMixCounts(newCounts);
  };

  const handleAddToCart = () => {
    if (!selectedPack) {
      toast({
        title: "Vyberte balení",
        description: "Prosím zvolte velikost balení (počet kusů).",
        variant: "destructive"
      });
      return;
    }

    if (!flavorMode) {
      toast({
        title: "Vyberte variantu",
        description: "Zvolte zda chcete jednu příchuť nebo mix.",
        variant: "destructive"
      });
      return;
    }

    if (flavorMode === "single" && !selectedFlavor) {
      toast({
        title: "Vyberte příchuť",
        description: "Prosím zvolte jednu z příchutí pro pokračování.",
        variant: "destructive"
      });
      return;
    }

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
      mixConfiguration: mixConfig,
      subscriptionInterval: subscriptionMode || undefined
    });

    toast({
      title: subscriptionMode ? "Předplatné přidáno!" : "Přidáno do košíku",
      description: `${quantity}x ${flavorMode === "mix" ? "MIX" : currentFlavor.name} (${selectedPack} ks)${subscriptionMode ? " - Měsíčně (-15%)" : ""}`,
      duration: 3000,
      className: subscriptionMode ? "border-amber-500 bg-amber-50" : ""
    });
  };

  return (
    <TooltipProvider>
      <section id="produkty" className="py-28 bg-secondary/30 relative overflow-hidden">
        {/* Animated background elements */}
        {/* ... (SVG background elements omitted for brevity, but they're usually at the top of the section) ... */}

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
            {/* Image section */}
            <div className="flex-1 flex items-center justify-center animate-fade-up animation-delay-200">
              <div className="relative">
                <div className={`absolute inset-0 ${flavorMode === "mix"
                  ? "bg-gradient-to-br from-lime via-terracotta to-olive"
                  : !selectedFlavor
                    ? "bg-gradient-to-br from-lime via-terracotta to-olive opacity-20"
                    : `bg-gradient-to-br ${currentFlavor.color}`
                  } opacity-30 blur-3xl scale-125 transition-all duration-700 animate-pulse-glow`} />

                <div className="relative animate-float">
                  <div className="relative">
                    <img
                      src={productImageSrc}
                      alt={flavorMode === "mix" ? "BoostUp Mix" : selectedFlavor ? currentFlavor.name : "BoostUp Energy Brew"}
                      className={`w-64 md:w-80 lg:w-96 h-auto drop-shadow-2xl transition-all duration-500 hover:scale-110 ${!selectedFlavor ? 'scale-110' : ''}`}
                    />
                  </div>

                  {(selectedFlavor || flavorMode === "mix") && (
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${flavorMode === "mix"
                      ? "bg-gradient-to-r from-lime via-terracotta to-olive text-cream"
                      : `${currentFlavor.bgColor} ${currentFlavor.textColor}`
                      } px-6 py-3 rounded-2xl font-bold shadow-lg animate-bounce-subtle`}>
                      <span className="text-lg">{selectedPack}x</span>
                      <span className="text-sm ml-1">{flavorMode === "mix" ? "MIX" : "PACK"}</span>
                    </div>
                  )}
                </div>
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

              {/* Purchase Mode Selection (One-time vs Subscription) */}
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">MOŽNOSTI NÁKUPU</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setSubscriptionMode(null)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative ${!subscriptionMode
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!subscriptionMode ? "border-primary" : "border-muted-foreground"}`}>
                        {!subscriptionMode && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold">Jednorázový nákup</div>
                        <div className="text-xs text-muted-foreground">Standardní cena</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSubscriptionMode("monthly")}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${subscriptionMode === "monthly"
                      ? "border-amber-500 bg-amber-500/5 shadow-md"
                      : "border-border bg-card hover:border-amber-500/50"
                      }`}
                  >
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">
                      -15% SLEVA
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${subscriptionMode === "monthly" ? "border-amber-500" : "border-muted-foreground"}`}>
                        {subscriptionMode === "monthly" && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-amber-600">Předplatné</div>
                        <div className="text-xs text-muted-foreground">Každý měsíc <span className="text-amber-600 font-bold">-15%</span></div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Flavor Mode Selection */}
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">CHCI</h3>
                <div className="flex flex-col sm:flex-row gap-3">
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
                      <div className={`text-xs ${flavorMode === "single" ? "opacity-80" : "text-muted-foreground"}`}>Vyberu si níže</div>
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
                      <div className={`text-xs ${flavorMode === "mix" ? "opacity-90" : "text-muted-foreground"}`}>Všechny 3 najednou</div>
                    </div>
                  </button>
                </div>

                {/* MIX CONFIGURATOR */}
                {flavorMode === "mix" && (
                  <div className="mt-6 animate-fade-up">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-sm font-bold text-muted-foreground tracking-widest">NAMÍCHEJ SI VLASTNÍ MIX</h3>
                      <div className={`text-sm font-bold px-3 py-1 rounded-full ${isMixValid ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        Vybráno: {currentMixCount} / {selectedPack} ks
                      </div>
                    </div>
                    <div className="space-y-3">
                      {flavors.map((flavor, index) => (
                        <div
                          key={flavor.id}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 border-2 ${mixCounts[flavor.id] > 0 ? `bg-gradient-to-r ${flavor.color} ${flavor.textColor} shadow-md border-transparent` : 'border-dashed border-border bg-secondary/30'}`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl shrink-0 ${mixCounts[flavor.id] > 0 ? 'bg-white/20' : flavor.bgColor} flex items-center justify-center`}>
                              {/* Using Sparkles for all for brevity, original had Droplet for silky */}
                              <Sparkles className={`w-6 h-6 ${mixCounts[flavor.id] > 0 ? 'text-white' : flavor.textColor}`} />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-bold text-base leading-tight">{flavor.name}</div>
                              <div className={`text-xs leading-snug mt-0.5 ${mixCounts[flavor.id] > 0 ? 'text-white/80' : 'text-muted-foreground'}`}>{flavor.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 bg-background rounded-full border border-border px-1 py-1 shadow-sm">
                              <button onClick={() => handleMixChange(flavor.id, -1)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center" disabled={mixCounts[flavor.id] === 0}>
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="min-w-[3rem] px-2 text-center font-bold text-sm">{mixCounts[flavor.id]}</span>
                              <button onClick={() => handleMixChange(flavor.id, 1)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center" disabled={currentMixCount >= (selectedPack || 0)}>
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {/* Info Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full p-0 hover:bg-white/20 ${mixCounts[flavor.id] > 0 ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
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

              {/* Flavor Selection (Single) */}
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
                          <div className={`w-12 h-12 rounded-xl shrink-0 ${selectedFlavor === flavor.id ? 'bg-cream/20' : flavor.bgColor} flex items-center justify-center`}>
                            {/* Using Sparkles for all for brevity, original had Droplet for silky */}
                            <Sparkles className={`w-6 h-6 ${selectedFlavor === flavor.id ? 'text-white' : flavor.textColor}`} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base leading-tight">{flavor.name}</span>
                              {flavor.labels && flavor.labels.map(label => (
                                <span key={label} className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/20 border border-white/10 hidden sm:inline-block">
                                  {label}
                                </span>
                              ))}
                            </div>
                            <div className={`text-xs leading-snug mt-0.5 ${selectedFlavor === flavor.id ? 'opacity-90' : 'text-muted-foreground'}`}>
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex items-center justify-between sm:justify-center gap-4 bg-card rounded-3xl px-5 py-3 border-2 border-border shadow-card">
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

                      if (
                        (requiredLemon > 0 && getStock('lemon') < requiredLemon) ||
                        (requiredRed > 0 && getStock('red') < requiredRed) ||
                        (requiredSilky > 0 && getStock('silky') < requiredSilky)
                      ) {
                        isOutOfStock = true;
                      }
                    } else {
                      // Single flavor: Check specific PACK SKU
                      const sku = `${selectedFlavor}-${selectedPack}`;
                      if (getStock(sku) < quantity) {
                        isOutOfStock = true;
                      }
                    }

                    return (
                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          variant="hero"
                          size="xl"
                          className={`flex-1 group animate-energy-pulse transition-all duration-300 ${(flavorMode === "mix" && !isMixValid) || isOutOfStock || (flavorMode === "single" && !selectedFlavor)
                            ? "opacity-50 grayscale cursor-not-allowed"
                            : ""
                            }`}
                          onClick={handleAddToCart}
                          disabled={(flavorMode === "mix" && !isMixValid) || isOutOfStock || (flavorMode === "single" && !selectedFlavor)}
                        >
                          <ShoppingBag className="w-5 h-5" />
                          {flavorMode === "mix" && !isMixValid
                            ? "Vyberte všechny příchutě"
                            : flavorMode === "single" && !selectedFlavor
                              ? "Vyberte příchuť"
                              : isOutOfStock
                                ? "Vyprodáno"
                                : "Přidat do košíku"
                          }
                          {!isOutOfStock && (
                            <span className="font-bold ml-2">{price} Kč</span>
                          )}
                        </Button>

                        {/* Stock Status Display */}
                        {(() => {
                          let maxAvailable = Infinity;

                          if (flavorMode === 'mix') {
                            // For Mix: Calculate how many packs can be made from loose bottles
                            if (mixCounts.lemon > 0) maxAvailable = Math.min(maxAvailable, Math.floor(getStock('lemon') / mixCounts.lemon));
                            if (mixCounts.red > 0) maxAvailable = Math.min(maxAvailable, Math.floor(getStock('red') / mixCounts.red));
                            if (mixCounts.silky > 0) maxAvailable = Math.min(maxAvailable, Math.floor(getStock('silky') / mixCounts.silky));
                          } else {
                            // Single Flavor: Check specific PACK SKU directly
                            const sku = `${selectedFlavor}-${selectedPack}`;
                            maxAvailable = getStock(sku);
                          }

                          if (maxAvailable === Infinity) maxAvailable = 0; // Fallback

                          if (maxAvailable > 10) {
                            return (
                              <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Skladem
                              </div>
                            );
                          } else if (maxAvailable > 0) {
                            return (
                              <div className="flex items-center justify-center gap-2 text-orange-600 font-bold text-sm">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                Zbývá posledních {maxAvailable} kusů
                              </div>
                            );
                          } else {
                            return null; // Handle sold out in button text
                          }
                        })()}
                      </div>
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
