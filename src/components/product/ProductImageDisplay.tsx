import ConfiguratorHero from "./ConfiguratorHero";

// Assets
const bottlesHero = "/hero-vse.webp";

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
            {/* 3-Color Atmospheric Mist (Glow representing the brand trio) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] opacity-70 blur-[140px] pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-lime/40 via-terracotta/40 to-olive/40 rounded-full scale-y-125" />
            </div>

            <div className="relative w-full flex justify-center py-0 overflow-hidden z-10">
                <div className="relative w-full flex justify-center py-0">
                    <div className="relative w-full">
                        <ConfiguratorHero 
                            className="w-full" 
                            selectedFlavor={selectedFlavor}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductImageDisplay;
