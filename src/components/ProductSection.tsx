import React from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProductLogic } from "@/hooks/useProductLogic";
import PackSelector from "./product/PackSelector";
import PurchaseTypeSelector from "./product/PurchaseTypeSelector";
import FlavorModeSelector from "./product/FlavorModeSelector";
import MixConfigurator from "./product/MixConfigurator";
import FlavorSelector from "./product/FlavorSelector";
import QuantitySelector from "./product/QuantitySelector";
import ProductImageDisplay from "./product/ProductImageDisplay";

const ProductSection = () => {
  const {
    selectedPack,
    setSelectedPack,
    flavorMode,
    setFlavorMode,
    selectedFlavor,
    setSelectedFlavor,
    purchaseType,
    setPurchaseType,
    quantity,
    setQuantity,
    mixCounts,
    handleMixChange,
    handleAddToCart,
    getEffectiveProduct,
    cleanName,
    currentFlavor,
    flavorName,
    price,
    isMixValid,
    isOutOfStock,
    isValid,
    productImageSrc,
    content,
    products
  } = useProductLogic();

  return (
    <TooltipProvider>
      <section id="produkty" className="py-16 md:py-32 bg-secondary/30 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
            
            {/* Image Side */}
            <div className="w-full lg:w-1/2 sticky top-24">
              <ProductImageDisplay
                flavorMode={flavorMode}
                selectedFlavor={selectedFlavor}
                selectedPack={selectedPack}
                productImageSrc={productImageSrc}
                flavorName={flavorName}
                currentFlavor={currentFlavor}
              />
            </div>

            {/* Configurator Side */}
            <div className="w-full lg:w-1/2 space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4 animate-fade-in">
                  <Sparkles className="w-3 h-3" />
                  {content.configurator?.badge || "Konfigurátor balení"}
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black text-foreground leading-[0.9] tracking-tighter uppercase whitespace-nowrap">
                  {content.configurator?.headline?.split(' ').slice(0, 2).join(' ') || "VYTVOŘTE SI SVOU"} <br />
                  <span className="text-gradient-energy italic pr-4">{content.configurator?.headline?.split(' ').slice(2).join(' ') || "ENERGII"}</span>
                </h2>
                <p className="text-lg text-foreground/60 max-w-xl font-medium">
                  {content.configurator?.description || "Vyberte si velikost balení, příchuť a způsob doručení. Vše čerstvě připravené pro špičkový výkon."}
                </p>
              </div>

              <div className="space-y-10 animate-fade-up animation-delay-400">
                {/* 1. Pack Size */}
                <div className="space-y-4">
                  <PackSelector selectedPack={selectedPack} onSelectPack={setSelectedPack} />
                </div>

                {/* 2. Purchase Type */}
                <div className="space-y-4">
                  <PurchaseTypeSelector purchaseType={purchaseType} onSelectPurchaseType={setPurchaseType} />
                </div>

                {/* 3. Flavor Selection */}
                <div className="space-y-4">
                  <FlavorModeSelector 
                    flavorMode={flavorMode} 
                    onSelectFlavorMode={(mode) => {
                      setFlavorMode(mode);
                      if (mode === 'mix') setSelectedFlavor(null);
                      else setFlavorMode('single');
                    }} 
                  />

                  <div className="min-h-[200px] transition-all">
                    {flavorMode === "mix" && selectedPack && (
                      <MixConfigurator
                        selectedPack={selectedPack}
                        mixCounts={mixCounts}
                        onMixChange={handleMixChange}
                        isMixValid={isMixValid}
                        content={content}
                        getEffectiveProduct={getEffectiveProduct}
                        cleanName={cleanName}
                        products={products}
                      />
                    )}

                    {flavorMode === "single" && (
                      <FlavorSelector
                        selectedFlavor={selectedFlavor}
                        onSelectFlavor={(id) => setSelectedFlavor(id as any)}
                        selectedPack={selectedPack}
                        content={content}
                        getEffectiveProduct={getEffectiveProduct}
                        cleanName={cleanName}
                        products={products}
                      />
                    )}
                  </div>
                </div>

                {/* 4. Action Area */}
                <div className="pt-8 border-t border-border/10 flex flex-col sm:flex-row gap-4 items-stretch">
                  <div className="w-full sm:w-1/3">
                    <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
                  </div>
                  
                  <div className="w-full sm:w-2/3">
                        <Button 
                          size="lg"
                          onClick={handleAddToCart}
                          disabled={!isValid || isOutOfStock}
                          className={`group relative overflow-hidden w-full h-[76px] rounded-2xl sm:rounded-3xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${
                            isOutOfStock 
                              ? "bg-muted grayscale border-border text-muted-foreground opacity-70"
                              : "bg-[#3d5a2f] text-[#dfdf57] font-black border-2 border-[#dfdf57]/20 transition-all hover:opacity-90 shadow-xl shadow-black/20"
                          }`}
                        >
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-center gap-2 font-display text-xl font-black italic tracking-tight">
                          <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          {isOutOfStock ? (content.configurator?.outOfStock || "VYPRODÁNO") : (content.configurator?.cta || "PŘIDAT DO KOŠÍKU")}
                        </div>
                        {!isOutOfStock && (
                          <div className="flex items-center gap-2 text-[10px] font-bold opacity-90 tracking-widest uppercase">
                            <span>{content.configurator?.total || "Celkem"} {price} Kč</span>
                            <Sparkles className="w-3 h-3 text-lime" />
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
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
