
import { useContent } from "@/context/ContentContext";
import { Button } from "./ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";
import bottlesHero from "@/assets/hero-vse.webp"; 
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleLemonMobile from "@/assets/bottle-lemon-mobile.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleRedMobile from "@/assets/bottle-red-mobile.webp";
import bottleSilky from "@/assets/bottle-silky.webp";
import bottleSilkyMobile from "@/assets/bottle-silky-mobile.webp";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext"; 
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";

// Sub-components
import MixStack from "./product/MixStack";
import PackSelector from "./product/PackSelector";
import PurchaseTypeSelector from "./product/PurchaseTypeSelector";
import FlavorModeSelector from "./product/FlavorModeSelector";
import MixConfigurator from "./product/MixConfigurator";
import FlavorSelector from "./product/FlavorSelector";
import QuantitySelector from "./product/QuantitySelector";

import { FLAVORS, PACK_PRICES, PACK_SIZES, type FlavorType } from "@/config/product-data";

type Flavor = FlavorType;
type Pack = typeof PACK_SIZES[number];
type FlavorMode = "single" | "mix";

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
  const [mixCounts, setMixCounts] = useState<Record<string, number>>({ lemon: 0, red: 0, silky: 0 });

  const { addToCart } = useCart();
  const { getStock, products } = useInventory();
  const { toast } = useToast();

  const getEffectiveProduct = (sku: string) => {
    if (sku.startsWith('mix-')) {
      const packSize = parseInt(sku.split('-')[1]) as Pack;
      return {
        sku,
        name: `BoostUp ${packSize}x Pack (MIX)`,
        price: PACK_PRICES[packSize] || 0,
        description: getMixDescription(packSize),
        tooltip: "Ochutnejte všechny příchutě v jednom balení",
        is_on_sale: false,
        image_url: null,
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
    return name
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .trim();
  };

  const isBrokenImage = (url: string | null | undefined) => {
    if (!url) return true;
    const brokenPlaceholders = ['https://drinkboostup.cz/bottles.png', 'bottles.png', 'Lemon', 'Red', 'Silky', 'null', 'undefined'];
    return brokenPlaceholders.includes(url) || url.length < 5;
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
    if (selectedFlavor === 'lemon') return bottleLemon;
    if (selectedFlavor === 'red') return bottleRed;
    if (selectedFlavor === 'silky') return bottleSilky;
    return bottlesHero;
  };

  const productImageSrc = getProductImage();

  useEffect(() => {
    if (!selectedPack) return;
    const perFlavor = Math.floor(selectedPack / 3);
    const remainder = selectedPack % 3;
    setMixCounts({
      lemon: perFlavor + remainder,
      red: perFlavor,
      silky: perFlavor
    });
  }, [selectedPack]);

  const currentFlavor = selectedFlavor ? FLAVORS.find(f => f.id === selectedFlavor)! : FLAVORS[0];
  const cmsFlavor = selectedFlavor ? content.flavors[selectedFlavor] : content.flavors[FLAVORS[0].id];
  const flavorName = cmsFlavor?.name || currentFlavor.name;

  const getDynamicPrice = () => {
    if (!selectedPack) return 0;
    if (flavorMode === "single" && selectedFlavor) {
      const sku = `${selectedFlavor}-${selectedPack}`;
      const product = products.find(p => p.sku === sku);
      if (product) return product.price * quantity;
    }
    return PACK_PRICES[selectedPack] * quantity;
  };

  const basePrice = getDynamicPrice();
  const price = purchaseType === 'subscription' ? Math.round(basePrice * 0.90) : basePrice;

  const currentMixCount = Object.values(mixCounts).reduce((a, b) => a + b, 0);
  const isMixValid = selectedPack ? currentMixCount === selectedPack : false;

  const handleMixChange = (flavorId: string, change: number) => {
    if (!selectedPack) return;
    const newCounts = { ...mixCounts, [flavorId]: Math.max(0, mixCounts[flavorId] + change) };
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);
    if (change > 0 && newTotal > selectedPack) return;
    setMixCounts(newCounts);
  };

  const handleAddToCart = () => {
    if (!selectedPack || !purchaseType || !flavorMode || (flavorMode === "single" && !selectedFlavor) || (flavorMode === "mix" && !isMixValid)) {
      toast({
        title: "Chybějící výběr",
        description: "Prosím dokončete konfiguraci vašeho balení.",
        variant: "destructive"
      });
      return;
    }

    const mixConfig = flavorMode === "mix" ? mixCounts : undefined;
    const mixIdSuffix = flavorMode === "mix" ? `-${mixCounts.lemon}-${mixCounts.red}-${mixCounts.silky}` : "";
    const sku = flavorMode === "mix" ? `mix-${selectedPack}` : `${selectedFlavor}-${selectedPack}`;
    const effProduct = getEffectiveProduct(sku);
    const displayName = effProduct?.name || (flavorMode === "mix" ? `BoostUp ${selectedPack}x Pack (MIX)` : `BoostUp ${selectedPack}x Pack (${currentFlavor.name})`);
    const displayPrice = effProduct?.price || PACK_PRICES[selectedPack];

    addToCart({
      id: flavorMode === "mix" ? `mix-${selectedPack}${mixIdSuffix}` : `${selectedFlavor}-${selectedPack}`,
      name: displayName,
      price: displayPrice,
      quantity: quantity,
      flavor: flavorMode === "mix" ? "MIX" : flavorName,
      pack: selectedPack,
      flavorMode: flavorMode,
      image: productImageSrc,
      mixConfiguration: mixConfig as { lemon: number; red: number; silky: number },
      subscriptionInterval: purchaseType === 'subscription' ? 'monthly' : undefined
    });

    toast({
      title: purchaseType === 'subscription' ? "Předplatné přidáno!" : "Přidáno do košíku",
      description: `${quantity}x ${flavorMode === "mix" ? "MIX" : flavorName} (${selectedPack} ks)`,
      duration: 3000,
      className: purchaseType === 'subscription' ? "border-amber-500 bg-amber-50" : ""
    });
  };

  return (
    <TooltipProvider>
      <section id="produkty" className="py-16 md:py-20 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="sr-only">Naše produkty a konfigurátor balení</h2>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Image section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center animate-fade-up animation-delay-200">
              <div className="relative w-full max-w-[400px] flex justify-center">
                <div className={`absolute inset-0 ${flavorMode === "mix"
                  ? "bg-gradient-to-br from-lime via-terracotta to-olive text-cream"
                  : !selectedFlavor
                    ? "bg-gradient-to-br from-lime via-terracotta to-olive opacity-20"
                    : `bg-gradient-to-br ${currentFlavor.color}`
                  } opacity-20 blur-3xl scale-110 transition-all duration-700`} />
                
                <div className="relative w-full flex justify-center py-8">
                  <div className="relative w-full max-w-[300px] md:max-w-[340px]">
                    {flavorMode === "mix" ? (
                      <MixStack images={[bottleLemon, bottleRed, bottleSilky]} className="w-full" />
                    ) : (
                      <img
                        src={productImageSrc}
                        srcSet={
                          selectedFlavor === 'lemon'
                            ? `${bottleLemonMobile} 500w, ${bottleLemon} 1000w`
                            : selectedFlavor === 'red'
                              ? `${bottleRedMobile} 500w, ${bottleRed} 1000w`
                              : selectedFlavor === 'silky'
                                ? `${bottleSilkyMobile} 500w, ${bottleSilky} 1000w`
                                : `${bottlesHero} 1000w`
                        }
                        sizes="(max-width: 640px) 100vw, 340px"
                        alt={selectedFlavor ? `BoostUp Pure Shot - ${flavorName}` : "BoostUp Supplements - Pure Shot 60ml"}
                        className="w-full h-auto object-contain drop-shadow-2xl transition-all duration-500 hover:scale-[1.03]"
                        width={340}
                        height={450}
                        loading="lazy"
                      />
                    )}
                  </div>

                  {(selectedFlavor || flavorMode === "mix") && (
                    <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${flavorMode === "mix"
                      ? "bg-gradient-to-r from-lime via-terracotta to-olive text-cream"
                      : `${currentFlavor.bgColor} ${currentFlavor.textColor}`
                      } px-5 py-2.5 rounded-2xl font-bold shadow-lg z-30 flex items-baseline gap-1 animate-in zoom-in-50 duration-300`}>
                      <span className="text-lg leading-none">{selectedPack}x</span>
                      <span className="text-[10px] uppercase tracking-wider">{flavorMode === "mix" ? "MIX" : "PACK"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-8 max-w-lg animate-fade-up animation-delay-400">
              <PackSelector selectedPack={selectedPack} onSelectPack={setSelectedPack} />
              
              <PurchaseTypeSelector purchaseType={purchaseType} onSelectPurchaseType={setPurchaseType} />

              <FlavorModeSelector flavorMode={flavorMode} onSelectFlavorMode={(mode) => {
                setFlavorMode(mode);
                if (mode === 'mix') setSelectedFlavor(null);
                else setFlavorMode('single');
              }} />

              {flavorMode === "mix" && selectedPack && (
                <MixConfigurator
                  selectedPack={selectedPack}
                  mixCounts={mixCounts}
                  onMixChange={handleMixChange}
                  isMixValid={isMixValid}
                  content={content}
                  getEffectiveProduct={getEffectiveProduct}
                  cleanName={cleanName}
                />
              )}

              {flavorMode === "single" && (
                <FlavorSelector
                  selectedFlavor={selectedFlavor}
                  onSelectFlavor={(id) => setSelectedFlavor(id as Flavor)}
                  selectedPack={selectedPack}
                  content={content}
                  getEffectiveProduct={getEffectiveProduct}
                  cleanName={cleanName}
                  products={products}
                />
              )}

              <div className="space-y-4 pt-6">
                <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-[76px] items-stretch w-full">
                  <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />

                  {(() => {
                    const isValid = selectedPack && purchaseType && flavorMode && (flavorMode === 'single' ? selectedFlavor : isMixValid);
                    if (!isValid) {
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
                    if (flavorMode === 'mix') {
                      if (
                        (mixCounts.lemon * quantity > 0 && getStock('lemon') < mixCounts.lemon * quantity) ||
                        (mixCounts.red * quantity > 0 && getStock('red') < mixCounts.red * quantity) ||
                        (mixCounts.silky * quantity > 0 && getStock('silky') < mixCounts.silky * quantity)
                      ) isOutOfStock = true;
                    } else {
                      const sku = `${selectedFlavor}-${selectedPack}`;
                      if (getStock(sku) < quantity) isOutOfStock = true;
                    }

                    return (
                      <Button
                        variant="hero"
                        onClick={handleAddToCart}
                        className={`flex-1 h-full min-h-[76px] px-6 py-2 border-2 border-transparent group animate-energy-pulse transition-all duration-300 rounded-3xl whitespace-normal leading-tight text-center ${isOutOfStock
                          ? "opacity-50 grayscale cursor-not-allowed"
                          : "hover:scale-105"
                          }`}
                        disabled={isOutOfStock}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <div className="flex items-center gap-2 font-display text-xl font-black italic tracking-tight">
                            <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {isOutOfStock ? "VYPRODÁNO" : "PŘIDAT DO KOŠÍKU"}
                          </div>
                          {!isOutOfStock && (
                            <div className="flex items-center gap-2 text-[10px] font-bold opacity-90 tracking-widest uppercase">
                              <span>Celkem {price} Kč</span>
                              <Sparkles className="w-3 h-3 text-lime" />
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })()}
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
