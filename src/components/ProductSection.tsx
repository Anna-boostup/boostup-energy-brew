import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProductLogic } from "@/hooks/useProductLogic";

// Sub-components
import PackSelector from "./product/PackSelector";
import PurchaseTypeSelector from "./product/PurchaseTypeSelector";
import FlavorModeSelector from "./product/FlavorModeSelector";
import MixConfigurator from "./product/MixConfigurator";
import FlavorSelector from "./product/FlavorSelector";
import QuantitySelector from "./product/QuantitySelector";
import ProductImageDisplay from "./product/ProductImageDisplay";
import AddToCartButton from "./product/AddToCartButton";

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
            <section id="produkty" className="py-16 md:py-20 bg-secondary/30 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="sr-only">Naše produkty a konfigurátor balení</h2>

                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                        <ProductImageDisplay
                            flavorMode={flavorMode}
                            selectedFlavor={selectedFlavor}
                            selectedPack={selectedPack}
                            productImageSrc={productImageSrc}
                            flavorName={flavorName}
                            currentFlavor={currentFlavor}
                        />

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
                                    onSelectFlavor={(id) => setSelectedFlavor(id as any)}
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

                                    <AddToCartButton
                                        isValid={isValid}
                                        isOutOfStock={isOutOfStock}
                                        price={price}
                                        onAddToCart={handleAddToCart}
                                    />
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
