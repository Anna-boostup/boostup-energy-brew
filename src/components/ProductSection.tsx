import { useState } from "react";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import productGreen from "@/assets/product-green.png";
import productRed from "@/assets/product-red.png";
import productYellow from "@/assets/product-yellow.png";

type Flavor = "lemon" | "red" | "silky";
type Pack = 3 | 12 | 21;

const flavors = [
  { id: "lemon" as Flavor, name: "LEMON BLAST", image: productYellow, color: "flavor-lemon" },
  { id: "red" as Flavor, name: "RED RUSH", image: productRed, color: "flavor-red" },
  { id: "silky" as Flavor, name: "SILKY LEAF", image: productGreen, color: "flavor-green" },
];

const packs: Pack[] = [3, 12, 21];

const ProductSection = () => {
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor>("lemon");
  const [selectedPack, setSelectedPack] = useState<Pack>(12);
  const [quantity, setQuantity] = useState(1);

  const currentFlavor = flavors.find(f => f.id === selectedFlavor)!;

  return (
    <section id="produkty" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 rounded-3xl" />
              <img
                src={currentFlavor.image}
                alt={currentFlavor.name}
                className="w-48 md:w-64 h-auto drop-shadow-2xl transition-all duration-500"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-8">
            {/* Pack Selection */}
            <div>
              <div className="flex gap-3 mb-6">
                {packs.map((pack) => (
                  <button
                    key={pack}
                    onClick={() => setSelectedPack(pack)}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                      selectedPack === pack
                        ? "bg-primary text-primary-foreground shadow-button"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {pack} shotů
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Selection */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Jedna příchuť</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="mix" className="accent-primary w-4 h-4" defaultChecked />
                  <span className="text-muted-foreground">Mix příchutí</span>
                </label>
              </div>
            </div>

            {/* Flavor Buttons */}
            <div className="space-y-3">
              {flavors.map((flavor) => (
                <Button
                  key={flavor.id}
                  variant={flavor.color as any}
                  className={`w-full justify-start text-left transition-all duration-300 ${
                    selectedFlavor === flavor.id ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedFlavor(flavor.id)}
                >
                  <span className="flex items-center justify-between w-full">
                    <span>{flavor.name}</span>
                    {selectedFlavor === flavor.id && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuantity(Math.max(1, quantity - 1));
                          }}
                          className="p-1 hover:bg-foreground/10 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center">{quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuantity(quantity + 1);
                          }}
                          className="p-1 hover:bg-foreground/10 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
