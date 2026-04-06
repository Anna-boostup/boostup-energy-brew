import MixStack from "./MixStack";
import ConfiguratorHero from "./ConfiguratorHero";

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
        <div className="w-full lg:w-1/2 flex items-center justify-center animate-fade-up animation-delay-200 lg:sticky lg:top-12">
            <div className="relative w-full max-w-[500px] lg:max-w-[600px] flex justify-center">
                <div className={`absolute inset-0 ${flavorMode === "mix"
                    ? "bg-gradient-to-br from-lime via-terracotta to-olive text-cream"
                    : !selectedFlavor
                        ? "bg-gradient-to-br from-lime via-terracotta to-olive opacity-20"
                        : `bg-gradient-to-br ${currentFlavor.color}`
                    } opacity-20 blur-3xl scale-110 transition-all duration-700`} />

                <div className="relative w-full flex justify-center py-8">
                    <div className="relative w-full max-w-[400px] md:max-w-[500px]">
                        {flavorMode === "mix" ? (
                            <MixStack images={[bottleLemon, bottleRed, bottleSilky]} className="w-full" />
                        ) : (
                            <ConfiguratorHero 
                                className="w-full" 
                                selectedFlavor={selectedFlavor}
                            />
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductImageDisplay;
