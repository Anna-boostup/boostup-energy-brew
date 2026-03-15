import { useState, useEffect } from "react";
import { useContent } from "@/context/ContentContext";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext";
import { useToast } from "@/hooks/use-toast";
import { FLAVORS, PACK_PRICES, PACK_SIZES, type FlavorType } from "@/config/product-data";

// Assets
const bottlesHero = "/hero-vse.webp";
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";

type Flavor = FlavorType;
type Pack = typeof PACK_SIZES[number];
type FlavorMode = "single" | "mix";

export const useProductLogic = () => {
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

    // Reset mix counts when pack size changes
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

    const getMixDescription = (pack: Pack): string => {
        switch (pack) {
            case 3: return "1× Lemon + 1× Red + 1× Silky";
            case 12: return "4× Lemon + 4× Red + 4× Silky";
            case 21: return "7× Lemon + 7× Red + 7× Silky";
            default: return "";
        }
    };

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

    const getDynamicPrice = () => {
        if (!selectedPack) return 0;
        if (flavorMode === "single" && selectedFlavor) {
            const sku = `${selectedFlavor}-${selectedPack}`;
            const product = products.find(p => p.sku === sku);
            if (product) return product.price * quantity;
        }
        return PACK_PRICES[selectedPack as keyof typeof PACK_PRICES] * quantity;
    };

    const handleMixChange = (flavorId: string, change: number) => {
        if (!selectedPack) return;
        const newCounts = { ...mixCounts, [flavorId]: Math.max(0, mixCounts[flavorId] + change) };
        const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);
        if (change > 0 && newTotal > selectedPack) return;
        setMixCounts(newCounts);
    };

    const cleanName = (name: string) => {
        return name
            .replace(/\s*\(.*?\)\s*/g, '')
            .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
            .trim();
    };

    const currentFlavor = selectedFlavor ? FLAVORS.find(f => f.id === selectedFlavor)! : FLAVORS[0];
    const cmsFlavor = selectedFlavor ? content.flavors[selectedFlavor] : content.flavors[FLAVORS[0].id];
    const flavorName = cmsFlavor?.name || currentFlavor.name;

    const basePrice = getDynamicPrice();
    const price = purchaseType === 'subscription' ? Math.round(basePrice * 0.90) : basePrice;

    const currentMixCount = Object.values(mixCounts).reduce((a, b) => a + b, 0);
    const isMixValid = selectedPack ? currentMixCount === selectedPack : false;

    const handleAddToCart = () => {
        if (!selectedPack || !purchaseType || !flavorMode || (flavorMode === "single" && !selectedFlavor) || (flavorMode === "mix" && !isMixValid)) {
            toast({
                title: "Chybějící výběr",
                description: "Prosím dokončete konfiguraci vašeho balení.",
                variant: "destructive"
            });
            return;
        }

        const productImageSrc = getProductImage();
        const mixConfig = flavorMode === "mix" ? mixCounts : undefined;
        const mixIdSuffix = flavorMode === "mix" ? `-${mixCounts.lemon}-${mixCounts.red}-${mixCounts.silky}` : "";
        const sku = flavorMode === "mix" ? `mix-${selectedPack}` : `${selectedFlavor}-${selectedPack}`;
        const effProduct = getEffectiveProduct(sku);
        const displayName = effProduct?.name || (flavorMode === "mix" ? `BoostUp ${selectedPack}x Pack (MIX)` : `BoostUp ${selectedPack}x Pack (${currentFlavor.name})`);
        const displayPrice = effProduct?.price || PACK_PRICES[selectedPack as keyof typeof PACK_PRICES];

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

    const isOutOfStockCheck = () => {
        if (!selectedPack || !purchaseType || !flavorMode || (flavorMode === 'single' && !selectedFlavor) || (flavorMode === 'mix' && !isMixValid)) {
            return false;
        }

        if (flavorMode === 'mix') {
            if (
                (mixCounts.lemon * quantity > 0 && getStock('lemon') < mixCounts.lemon * quantity) ||
                (mixCounts.red * quantity > 0 && getStock('red') < mixCounts.red * quantity) ||
                (mixCounts.silky * quantity > 0 && getStock('silky') < mixCounts.silky * quantity)
            ) return true;
        } else {
            const sku = `${selectedFlavor}-${selectedPack}`;
            if (getStock(sku) < quantity) return true;
        }
        return false;
    };

    const isOutOfStock = isOutOfStockCheck();

    const isValid = !!(selectedPack && purchaseType && flavorMode && (flavorMode === 'single' ? selectedFlavor : isMixValid));

    return {
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
        productImageSrc: getProductImage(),
        content,
        products
    };
};
