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
            <div className="relative w-full flex justify-center">
                <div className="relative w-full flex justify-center py-0">
                    <div className="relative w-full">
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
