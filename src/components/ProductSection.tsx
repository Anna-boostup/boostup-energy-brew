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
  const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscription' | null>(null);
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
  const price = purchaseType === 'subscription' ? Math.round(basePrice * 0.85) : basePrice;

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

    if (!purchaseType) {
      toast({
        title: "Vyberte typ nákupu",
        description: "Zvolte zda chcete jednorázový nákup nebo předplatné.",
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
      mixConfiguration: mixConfig,
      subscriptionInterval: purchaseType === 'subscription' ? 'monthly' : undefined
    });

    toast({
      title: purchaseType === 'subscription' ? "Předplatné přidáno!" : "Přidáno do košíku",
      description: `${quantity}x ${flavorMode === "mix" ? "MIX" : currentFlavor.name} (${selectedPack} ks)${purchaseType === 'subscription' ? " - Měsíčně (-15%)" : ""}`,
      duration: 3000,
      className: purchaseType === 'subscription' ? "border-amber-500 bg-amber-50" : ""
    });
  };

  return (
    <TooltipProvider>
      <section id="produkty" className="py-28 bg-secondary/30 relative overflow-hidden">
        {/* Animated background elements */}
        {/* ... (SVG background elements omitted for brevity, but they're usually at the top of the section) ... */}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">

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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {packs.map((pack, index) => (
                    <button
                      key={pack}
                      onClick={() => setSelectedPack(pack)}
                      className={`py-4 sm:py-5 px-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover-lift ${selectedPack === pack
                        ? "bg-primary text-primary-foreground shadow-button"
                        : "bg-card text-foreground border-2 border-border hover:border-primary"
                        }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {pack}x
                      <span className="block text-xs sm:text-sm font-semibold opacity-80">
                        {packPrices[pack]} Kč
                      </span>
                    </button>
                  ))}
                </div>

              </div>

              {/* Purchase Mode Selection (One-time vs Subscription) */}
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">MOŽNOSTI NÁKUPU</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">

                  <button
                    onClick={() => setPurchaseType('onetime')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative ${purchaseType === 'onetime'
                      ? "bg-primary text-primary-foreground shadow-button scale-[1.02]"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'onetime' ? "border-primary-foreground" : "border-muted-foreground"}`}>
                        {purchaseType === 'onetime' && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm sm:text-base">Jednorázový nákup</div>
                        <div className={`text-[10px] sm:text-xs ${purchaseType === 'onetime' ? "text-primary-foreground/80" : "text-muted-foreground"}`}>Standardní cena</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPurchaseType('subscription')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${purchaseType === 'subscription'
                      ? "bg-amber-500 text-white shadow-button scale-[1.02] border-amber-500"
                      : "border-border bg-card hover:border-amber-500/50"
                      }`}
                  >
                    <div className="absolute top-0 right-0 bg-amber-600/20 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl backdrop-blur-sm">
                      -15% SLEVA
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscription' ? "border-white" : "border-muted-foreground"}`}>
                        {purchaseType === 'subscription' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm sm:text-base">Předplatné</div>
                        <div className={`text-[10px] sm:text-xs ${purchaseType === 'subscription' ? "text-white/80" : "text-muted-foreground"}`}>Každý měsíc <span className={`font-bold ${purchaseType === 'subscription' ? "text-white" : "text-amber-600"}`}>-15%</span></div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Flavor Mode Selection */}
              <div>
                <h3 className="font-display text-sm font-bold text-muted-foreground mb-4 tracking-widest">CHCI</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">

                  <button
                    onClick={() => setFlavorMode("single")}
                    className={`p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "single"
                      ? "bg-primary text-primary-foreground shadow-button scale-[1.02]"
                      : "bg-card text-foreground border-2 border-border hover:border-primary"
                      }`}
                  >
                    <Droplet className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold text-sm sm:text-base">Jednu příchuť</div>
                      <div className={`text-[10px] sm:text-xs ${flavorMode === "single" ? "opacity-80" : "text-muted-foreground"}`}>Vyberu si níže</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFlavorMode("mix")}
                    className={`p-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "mix"
                      ? "bg-gradient-to-r from-lime via-terracotta to-olive text-cream shadow-button scale-[1.02]"
                      : "bg-card text-foreground border-2 border-border hover:border-primary"
                      }`}
                  >
                    <Blend className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold text-sm sm:text-base">Mix příchutí</div>
                      <div className={`text-[10px] sm:text-xs ${flavorMode === "mix" ? "opacity-90" : "text-muted-foreground"}`}>Všechny 3 najednou</div>
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
                              <div className="font-bold text-base leading-tight">{flavor.name}</div>
                              <div className={`text-xs leading-snug mt-0.5 text-balance min-h-[2.5em] flex items-center ${mixCounts[flavor.id] > 0 ? 'text-white/80' : 'text-muted-foreground'}`}>{flavor.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 !bg-white rounded-full border border-border px-1 py-1 shadow-sm z-10 relative" style={{ backgroundColor: 'white', color: 'hsl(var(--foreground))' }}>
                              <button
                                onClick={() => handleMixChange(flavor.id, -1)}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                                style={{ color: 'hsl(var(--foreground))' }}
                                disabled={mixCounts[flavor.id] === 0}
                              >
                                <Minus className="w-3.5 h-3.5" style={{ color: 'hsl(var(--foreground))' }} />
                              </button>
                              <span className="min-w-[3rem] px-2 text-center font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                                {mixCounts[flavor.id]}
                              </span>
                              <button
                                onClick={() => handleMixChange(flavor.id, 1)}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                                style={{ color: 'hsl(var(--foreground))' }}
                                disabled={currentMixCount >= (selectedPack || 0)}
                              >
                                <Plus className="w-3.5 h-3.5" style={{ color: 'hsl(var(--foreground))' }} />
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
                            <div className={`text-xs leading-snug mt-0.5 text-balance min-h-[2.5em] flex items-center ${selectedFlavor === flavor.id ? 'opacity-90' : 'text-muted-foreground'}`}>
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
                {/* Container for Quantity and Button in one row */}
                <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-[76px] items-stretch w-full">

                  {/* Quantity Selector - Fixed height matching button */}
                  <div className="flex items-center justify-between gap-4 bg-card rounded-3xl px-6 py-4 border-2 border-border shadow-card h-full min-h-[76px]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
                    >
                      <Minus className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
                    </button>
                    <span className="w-8 text-center font-bold text-2xl" style={{ color: 'hsl(var(--foreground))' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
                    >
                      <Plus className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
                    </button>
                  </div>

                  {/* Add to Cart Button Logic - Flex 1 to take remaining space */}
                  {(() => {
                    // Only render button if ALL selections are made
                    if (!selectedPack || !purchaseType || !flavorMode || (flavorMode === 'mix' && !isMixValid) || (flavorMode === 'single' && !selectedFlavor)) {
                      return <div className="flex-1 bg-secondary/20 rounded-3xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground font-medium text-sm p-4 text-center min-h-[76px]">
                        Dokončete výběr pro nákup
                      </div>;
                    }

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
                      <Button
                        variant="hero"
                        size="xl"
                        className={`flex-1 h-full min-h-[76px] group animate-energy-pulse transition-all duration-300 !text-xl rounded-3xl ${isOutOfStock
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : ""
                          }`}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                      >
                        <ShoppingBag className="w-6 h-6 mr-2" />
                        {isOutOfStock
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

                {/* Stock Status Display - Full Width Below */}
                <div className="w-full text-center">
                  {(() => {
                    // Only show stock if selections valid
                    if (!selectedPack || !purchaseType || !flavorMode || (flavorMode === 'mix' && !isMixValid) || (flavorMode === 'single' && !selectedFlavor)) {
                      return null;
                    }

                    let maxAvailable = Infinity;

                    if (flavorMode === 'mix') {
                      if (mixCounts.lemon > 0) maxAvailable = Math.min(maxAvailable, Math.floor(getStock('lemon') / mixCounts.lemon));
                      if (mixCounts.red > 0) maxAvailable = Math.min(maxAvailable, Math.floor(getStock('red') / mixCounts.red));
                      if (mixCounts.silky > 0) maxAvailable = Math.min(maxAvailable, Math.floor(getStock('silky') / mixCounts.silky));
                    } else {
                      const sku = `${selectedFlavor}-${selectedPack}`;
                      maxAvailable = getStock(sku);
                    }

                    if (maxAvailable === Infinity) maxAvailable = 0;

                    if (maxAvailable > 10) {
                      return (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-sm animate-fade-up">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Skladem (ihned k odeslání)
                        </div>
                      );
                    } else if (maxAvailable > 0) {
                      return (
                        <div className="flex items-center justify-center gap-2 text-orange-600 font-bold text-sm animate-fade-up">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          Zbývá posledních {maxAvailable} kusů
                        </div>
                      );
                    } else {
                      return null;
                    }
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
