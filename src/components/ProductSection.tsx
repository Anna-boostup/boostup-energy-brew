import React, { useState } from "react";
import { useContent } from "@/context/ContentContext";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingBag, Check, Sparkles, Blend, Droplet, Info, Mail } from "lucide-react";
import bottleSingle from "@/assets/bottle-single.jpg";
import bottlesHero from "@/assets/hero-vse.png"; // Import new high-res hero
import bottleLemon from "@/assets/bottle-lemon.png";
import bottleRed from "@/assets/bottle-red.png";
import bottleSilky from "@/assets/bottle-silky.png";
import pack3Silky from "@/assets/3pack.png"; // Keeping old static fallbacks for now just in case
import pack3Lemon from "@/assets/3PackLemon.png";
import pack3Red from "@/assets/3PackRed.png";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext"; // Added import from InventoryContext
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Dynamic component for the "Mix" display
const MixStack = ({ images, className }: { images: string[], className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Right Bottle (Silky) */}
      <img
        src={images[2]}
        alt="BoostUp Silky - energetický shot z čajového extraktu"
        className="w-44 md:w-56 lg:w-64 h-auto drop-shadow-2xl translate-x-16 rotate-[15deg] z-0 opacity-90"
      />
      {/* Left Bottle (Red) */}
      <img
        src={images[1]}
        alt="BoostUp Red - přírodní energy shot s příchutí lesních plodů"
        className="w-44 md:w-56 lg:w-64 h-auto drop-shadow-2xl -translate-x-16 -rotate-[15deg] z-10 opacity-90 absolute"
      />
      {/* Middle Bottle (Lemon) - Front */}
      <img
        src={images[0]}
        alt="BoostUp Lemon - osvěžující energetický shot s citrusy"
        className="w-56 md:w-72 lg:w-80 h-auto drop-shadow-2xl z-20 absolute"
      />
    </div>
  );
};

import { FLAVORS, PACK_PRICES, PACK_SIZES, type FlavorType } from "@/config/product-data";

type Flavor = FlavorType;
type Pack = typeof PACK_SIZES[number];
type FlavorMode = "single" | "mix";

const flavors = FLAVORS;
const packs = PACK_SIZES;
const packPrices = PACK_PRICES;

// Mix description based on pack size
const getMixDescription = (pack: Pack): string => {
  switch (pack) {
    case 3: return "1× Lemon + 1× Red + 1× Silky";
    case 12: return "4× Lemon + 4× Red + 4× Silky";
    case 21: return "7× Lemon + 7× Red + 7× Silky";
  }
};

const ProductSection = () => {
  const { content } = useContent();
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [flavorMode, setFlavorMode] = useState<FlavorMode | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscription' | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { getStock, products } = useInventory();
  const { toast } = useToast();

  const getEffectiveProduct = (sku: string) => {
    // Virtual logic for Mix
    if (sku.startsWith('mix-')) {
      const packSize = parseInt(sku.split('-')[1]) as Pack;
      return {
        sku,
        name: `BoostUp ${packSize}x Pack (MIX)`,
        price: PACK_PRICES[packSize] || 0,
        description: getMixDescription(packSize),
        tooltip: "Ochutnejte všechny příchutě v jednom balení",
        is_on_sale: false,
        image_url: null, // MixStack handles visual
      };
    }

    const direct = products.find(p => p.sku === sku);
    const baseSku = sku.includes('-') ? sku.split('-')[0] : sku;
    const base = products.find(p => p.sku === baseSku);

    if (!direct && !base) return null;

    return {
      sku,
      name: direct?.name || base?.name || "",
      price: direct?.price || base?.price || 0,
      description: direct?.description || base?.description || "",
      tooltip: direct?.tooltip || base?.tooltip || "",
      is_on_sale: direct?.is_on_sale || base?.is_on_sale || false,
      image_url: direct?.image_url || base?.image_url || null,
    };
  };

  const cleanName = (name: string) => {
    // Remove text in parentheses and strip emojis from the start/content
    return name
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .trim();
  };

  const isBrokenImage = (url: string | null | undefined) => {
    if (!url) return true;
    // Known broken placeholders from previous migrations/seeds
    const brokenPlaceholders = [
      'https://drinkboostup.cz/bottles.png',
      'bottles.png',
      'Lemon',
      'Red',
      'Silky',
      'null',
      'undefined'
    ];
    return brokenPlaceholders.includes(url) || url.length < 5; // Very short strings are likely not paths
  };

  const getProductImage = () => {
    if (!flavorMode && !selectedFlavor) return bottlesHero;

    if (flavorMode === "mix" && selectedPack) {
      const sku = `mix-${selectedPack}`;
      const eff = getEffectiveProduct(sku);
      if (!isBrokenImage(eff?.image_url)) return eff!.image_url!;
      return bottlesHero;
    }

    if (flavorMode === "single" && selectedFlavor && selectedPack) {
      const sku = `${selectedFlavor}-${selectedPack}`;
      const eff = getEffectiveProduct(sku);
      if (!isBrokenImage(eff?.image_url)) return eff!.image_url!;
    }

    // Static Fallbacks for specific flavors
    if (selectedFlavor === 'lemon') return bottleLemon;
    if (selectedFlavor === 'red') return bottleRed;
    if (selectedFlavor === 'silky') return bottleSilky;

    return bottlesHero;
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

  // Get dynamic flavor data from CMS
  const cmsFlavor = selectedFlavor ? content.flavors[selectedFlavor] : content.flavors[flavors[0].id];
  const flavorName = cmsFlavor?.name || currentFlavor.name;
  const flavorDesc = cmsFlavor?.description || currentFlavor.description;
  const flavorLabels = cmsFlavor?.labels || currentFlavor.labels;

  // Calculate price with potential subscription discount
  const getDynamicPrice = () => {
    if (!selectedPack) return 0;
    if (flavorMode === "single" && selectedFlavor) {
      const sku = `${selectedFlavor}-${selectedPack}`;
      const product = products.find(p => p.sku === sku);
      if (product) return product.price * quantity;
    }
    return packPrices[selectedPack] * quantity;
  };

  const basePrice = getDynamicPrice();
  const price = purchaseType === 'subscription' ? Math.round(basePrice * 0.90) : basePrice;

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

  // Placeholder if needed

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

    const sku = flavorMode === "mix" ? `mix-${selectedPack}` : `${selectedFlavor}-${selectedPack}`;
    const effProduct = getEffectiveProduct(sku);

    const displayName = effProduct?.name || (flavorMode === "mix" ? `BoostUp ${selectedPack}x Pack (MIX)` : `BoostUp ${selectedPack}x Pack (${currentFlavor.name})`);
    const displayPrice = effProduct?.price || packPrices[selectedPack];

    addToCart({
      id: flavorMode === "mix" ? `mix-${selectedPack}${mixIdSuffix}` : `${selectedFlavor}-${selectedPack}`,
      name: displayName,
      price: displayPrice,
      quantity: quantity,
      flavor: flavorMode === "mix" ? "MIX" : flavorName,
      pack: selectedPack,
      flavorMode: flavorMode,
      image: productImageSrc,
      mixConfiguration: mixConfig,
      subscriptionInterval: purchaseType === 'subscription' ? 'monthly' : undefined
    });

    toast({
      title: purchaseType === 'subscription' ? "Předplatné přidáno!" : "Přidáno do košíku",
      description: `${quantity}x ${flavorMode === "mix" ? "MIX" : flavorName} (${selectedPack} ks)${purchaseType === 'subscription' ? " - Měsíčně (-15%)" : ""}`,
      duration: 3000,
      className: purchaseType === 'subscription' ? "border-amber-500 bg-amber-50" : ""
    });
  };

  return (
    <TooltipProvider>
      <section id="produkty" className="py-28 bg-[#1a320f] relative overflow-hidden">
        {/* Animated background elements */}
        {/* ... (SVG background elements omitted for brevity, but they're usually at the top of the section) ... */}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-x-hidden">
          <h2 className="sr-only">Naše produkty a konfigurátor balení</h2>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
            {/* Image section */}
            <div className="flex-1 flex items-center justify-center animate-fade-up animation-delay-200">
              <div className="relative">
                <div className={`absolute inset-0 ${flavorMode === "mix"
                  ? "bg-gradient-to-br from-lime via-terracotta to-olive"
                  : !selectedFlavor
                    ? "bg-gradient-to-br from-lime via-terracotta to-olive opacity-20"
                    : `bg-gradient-to-br ${currentFlavor.color}`
                  } opacity-30 blur-3xl scale-125 transition-all duration-700`} />
                <div className="relative">
                  <div className="relative">
                    {flavorMode === "mix" ? (
                      <img
                        src={bottlesHero}
                        alt="BoostUp Mix balení - kombinace všech příchutí energetických shotů"
                        className="w-80 md:w-96 lg:w-[450px] h-auto drop-shadow-xl"
                      />
                    ) : (
                      <img
                        src={productImageSrc}
                        alt={selectedFlavor ? `BoostUp ${flavorName} - přírodní energy shot` : "BoostUp Supplements - Pure Shot 60ml"}
                        className={`w-64 md:w-80 lg:w-96 h-auto drop-shadow-xl`}
                      />
                    )}
                  </div>

                  {(selectedFlavor || flavorMode === "mix") && (
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${flavorMode === "mix"
                      ? "bg-gradient-to-r from-lime via-terracotta to-olive text-cream"
                      : `${currentFlavor.bgColor} ${currentFlavor.textColor}`
                      } px-6 py-3 rounded-2xl font-bold shadow-lg`}>
                      <span className="text-lg">{selectedPack}x</span>
                      <span className="text-sm ml-1">{flavorMode === "mix" ? "MIX" : "PACK"}</span>
                    </div>
                  )}
                </div>
                {/* Odstraněno: Umělý stín (blur oval) pod lahvičkou, který tvořil dojem vznášení */}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-8 max-w-lg animate-fade-up animation-delay-400">
              {/* Pack Selection */}
              <div>
                <h3 className="font-display text-sm font-bold text-foreground/80 mb-4 tracking-widest">VYBERTE BALENÍ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {packs.map((pack, index) => (
                    <button
                      key={pack}
                      onClick={() => setSelectedPack(pack)}
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
                        {packPrices[pack]} Kč
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

              {/* Purchase Mode Selection (One-time vs Subscription) */}
              <div>
                <h3 className="font-display text-sm font-bold text-foreground mb-4 tracking-widest">MOŽNOSTI NÁKUPU</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">

                  <button
                    onClick={() => setPurchaseType('onetime')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative ${purchaseType === 'onetime'
                      ? "bg-primary border-primary text-primary-foreground shadow-button scale-[1.02]"
                      : "border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'onetime' ? "border-primary-foreground" : "border-muted-foreground"}`}>
                        {purchaseType === 'onetime' && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm sm:text-base">Jednorázový nákup</div>
                        <div className={`text-[10px] sm:text-xs ${purchaseType === 'onetime' ? "text-primary-foreground" : "text-foreground/80"}`}>Standardní cena</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPurchaseType('subscription')}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${purchaseType === 'subscription'
                      ? "bg-amber-500 border-amber-500 text-white shadow-button scale-[1.02]"
                      : "border-primary/40 bg-transparent hover:border-amber-500/60"
                      }`}
                  >
                    <div className="absolute top-0 right-0 bg-amber-600/20 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl backdrop-blur-sm">
                      -10% SLEVA
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscription' ? "border-white" : "border-muted-foreground"}`}>
                        {purchaseType === 'subscription' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm sm:text-base">Předplatné</div>
                        <div className={`text-[10px] sm:text-xs ${purchaseType === 'subscription' ? "text-white" : "text-foreground/70"}`}>Každý měsíc <span className={`font-bold ${purchaseType === 'subscription' ? "text-white" : "text-amber-600"}`}>-10%</span></div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Flavor Mode Selection */}
              <div>
                <h3 className="font-display text-sm font-bold text-foreground mb-4 tracking-widest">CHCI</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">

                  <button
                    onClick={() => setFlavorMode("single")}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "single"
                      ? "bg-primary border-primary text-primary-foreground shadow-button scale-[1.02]"
                      : "border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60"
                      }`}
                  >
                    <Droplet className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold text-sm sm:text-base">Jednu příchuť</div>
                      <div className={`text-[10px] sm:text-xs ${flavorMode === "single" ? "text-primary-foreground" : "text-foreground/80"}`}>Vyberu si níže</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFlavorMode("mix")}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "mix"
                      ? "bg-gradient-to-r from-lime via-terracotta to-olive border-transparent text-cream shadow-button scale-[1.02]"
                      : "border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60"
                      }`}
                  >
                    <Blend className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold text-sm sm:text-base">Mix příchutí</div>
                      <div className={`text-[10px] sm:text-xs ${flavorMode === "mix" ? "text-cream" : "text-foreground/80"}`}>Všechny 3 najednou</div>
                    </div>
                  </button>
                </div>

                {/* MIX CONFIGURATOR */}
                {flavorMode === "mix" && (
                  <div className="mt-6 animate-fade-up">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-sm font-bold text-foreground tracking-widest">NAMÍCHEJ SI VLASTNÍ MIX</h3>
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
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-bold text-base leading-tight">
                                {(() => {
                                  // Prioritized CMS name, fallback to technical data
                                  return content.flavors[flavor.id]?.name || (getEffectiveProduct(flavor.id) ? cleanName(getEffectiveProduct(flavor.id)!.name) : flavor.name);
                                })()}
                                {flavor.labels && (content.flavors[flavor.id]?.labels || flavor.labels).map(label => (
                                  <span key={label} className="ml-2 text-[8px] uppercase font-bold px-1 py-0.5 rounded-full bg-white/10 border border-white/5 inline-block align-middle">
                                    {label}
                                  </span>
                                ))}
                              </div>
                              <div className={`text-xs leading-snug mt-0.5 text-balance min-h-[2.5em] flex items-center ${mixCounts[flavor.id] > 0 ? 'text-white' : 'text-foreground/90 font-medium'}`}>
                                {(() => {
                                  const eff = getEffectiveProduct(flavor.id);
                                  return eff?.description || content.flavors[flavor.id]?.description || flavor.description;
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2 !bg-white rounded-full border border-border px-1 py-1 shadow-sm z-10 relative" style={{ backgroundColor: 'white', color: 'hsl(var(--foreground))' }}>
                              <button
                                onClick={() => handleMixChange(flavor.id, -1)}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                                style={{ color: 'hsl(var(--foreground))' }}
                                disabled={mixCounts[flavor.id] === 0}
                                aria-label={`Odebrat ${flavor.name}`}
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
                                aria-label={`Přidat ${flavor.name}`}
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
                                  className={`h-8 w-8 rounded-full p-0 hover:bg-white/20 ${mixCounts[flavor.id] > 0 ? 'text-white hover:text-white' : 'text-foreground/70 hover:text-foreground'}`}
                                  aria-label={`Informace o příchuti ${flavor.name}`}
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <p>{getEffectiveProduct(flavor.id)?.tooltip || flavor.description}</p>
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
                  <h3 className="font-display text-sm font-bold text-foreground mb-4 tracking-widest">VYBERTE PŘÍCHUŤ</h3>
                  <div className="space-y-3">
                    {flavors.map((flavor, index) => (
                      <div key={flavor.id} className="relative group/flavor">
                        <button
                          onClick={() => setSelectedFlavor(flavor.id)}
                          className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 hover-lift ${selectedFlavor === flavor.id
                            ? `bg-gradient-to-r ${flavor.color} ${flavor.textColor} border-transparent shadow-lg scale-[1.02]`
                            : `border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60 hover:scale-[1.01]`
                            }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="text-left min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-base leading-tight">
                                <span className="font-bold text-base leading-tight">
                                  {content.flavors[flavor.id]?.name || (getEffectiveProduct(selectedPack ? `${flavor.id}-${selectedPack}` : flavor.id) ? cleanName(getEffectiveProduct(selectedPack ? `${flavor.id}-${selectedPack}` : flavor.id)!.name) : flavor.name)}
                                </span>
                              </span>
                              {(() => {
                                const eff = getEffectiveProduct(selectedPack ? `${flavor.id}-${selectedPack}` : flavor.id);
                                return eff?.is_on_sale && (
                                  <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                    AKCE
                                  </span>
                                );
                              })()}
                              {flavor.labels && (content.flavors[flavor.id]?.labels || flavor.labels).map(label => (
                                <span key={label} className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/20 border border-white/10 hidden sm:inline-block">
                                  {label}
                                </span>
                              ))}
                            </div>
                            <div className={`text-xs leading-snug mt-0.5 text-balance min-h-[2.5em] flex items-center ${selectedFlavor === flavor.id ? 'text-white' : 'text-foreground/80 font-medium'}`}>
                              {products.find(p => p.sku === (selectedPack ? `${flavor.id}-${selectedPack}` : flavor.id))?.description || content.flavors[flavor.id]?.description || flavor.description}
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
                                aria-label={`Informace o příchuti ${flavor.name}`}
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p>{getEffectiveProduct(selectedPack ? `${flavor.id}-${selectedPack}` : flavor.id)?.tooltip || flavor.description}</p>
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
                      aria-label="Snížit množství"
                    >
                      <Minus className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
                    </button>
                    <span className="w-12 text-center font-bold text-2xl" style={{ color: 'hsl(var(--foreground))' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
                      aria-label="Zvýšit množství"
                    >
                      <Plus className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
                    </button>
                  </div>

                  {/* Add to Cart Button Logic - Flex 1 to take remaining space */}
                  {(() => {
                    // Only render button if ALL selections are made
                    if (!selectedPack || !purchaseType || !flavorMode || (flavorMode === 'mix' && !isMixValid) || (flavorMode === 'single' && !selectedFlavor)) {
                      return (
                        <Button
                          variant="outline"
                          disabled
                          className="flex-1 h-full min-h-[76px] px-8 rounded-3xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm bg-secondary/20"
                        >
                          Dokončete výběr pro nákup
                        </Button>
                      );
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
                        className={`flex-1 h-full min-h-[76px] px-6 py-2 border-2 border-transparent group animate-energy-pulse transition-all duration-300 rounded-3xl whitespace-normal leading-tight text-center ${isOutOfStock
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : ""
                          }`}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingBag className="w-5 h-5 shrink-0" />
                            <span className="font-semibold text-sm sm:text-base">
                              {isOutOfStock
                                ? "Vyprodáno"
                                : "Přidat do košíku"}
                            </span>
                          </div>
                          {!isOutOfStock && (
                            <span className="font-bold text-base opacity-90">{price} Kč</span>
                          )}
                        </div>
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
                  <a
                    href="#kontakt"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary/50 pb-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Máte zájem o větší odběr? Individuální nabídka
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </TooltipProvider >
  );
};

export default ProductSection;
