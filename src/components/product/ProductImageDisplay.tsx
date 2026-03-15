import React from "react";
import MixStack from "./MixStack";

// Assets
const bottlesHero = "/hero-vse.webp";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleLemonMobile from "@/assets/bottle-lemon-mobile.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleRedMobile from "@/assets/bottle-red-mobile.webp";
import bottleSilky from "@/assets/bottle-silky.webp";
import bottleSilkyMobile from "@/assets/bottle-silky-mobile.webp";

interface ProductImageDisplayProps {
    flavorMode: "single" | "mix" | null;
    selectedFlavor: string | null;
    selectedPack: number | null;
    productImageSrc: string;
    flavorName: string;
    currentFlavor: {
        color: string;
        bgColor: string;
        textColor: string;
    };
}

const ProductImageDisplay: React.FC<ProductImageDisplayProps> = ({
    flavorMode,
    selectedFlavor,
    selectedPack,
    productImageSrc,
    flavorName,
    currentFlavor
}) => {
    return (
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

                    {(selectedFlavor || flavorMode === "mix") && selectedPack && (
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
    );
};

export default ProductImageDisplay;
