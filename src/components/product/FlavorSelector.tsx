
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NutritionalFactsDialog from "./NutritionalFactsDialog";
import { FLAVORS, type FlavorConfig } from "@/config/product-data";

interface FlavorSelectorProps {
  selectedFlavor: string | null;
  onSelectFlavor: (flavorId: string) => void;
  selectedPack: number | null;
  content: any;
  getEffectiveProduct: (sku: string) => any;
  cleanName: (name: string) => string;
  products: any[];
}

const FlavorSelector = ({
  selectedFlavor,
  onSelectFlavor,
  selectedPack,
  content,
  getEffectiveProduct,
  cleanName,
  products
}: FlavorSelectorProps) => {
  return (
    <div className="animate-fade-up">
      <h3 className="font-display text-sm font-bold text-foreground mb-4 tracking-widest">VYBERTE PŘÍCHUŤ</h3>
      <div className="space-y-3">
        {FLAVORS.map((flavor, index) => {
          const sku = selectedPack ? `${flavor.id}-${selectedPack}` : flavor.id;
          const isSelected = selectedFlavor === flavor.id;
          const eff = getEffectiveProduct(sku);
          
          return (
            <div key={flavor.id} className="relative group/flavor">
              <button
                onClick={() => onSelectFlavor(flavor.id)}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all duration-300 hover-lift ${isSelected
                  ? `bg-gradient-to-r ${flavor.color} ${flavor.textColor} border-transparent shadow-lg scale-[1.02]`
                  : `border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60 hover:scale-[1.01]`
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-base leading-tight">
                      {content.flavors[flavor.id]?.name || (eff ? cleanName(eff.name) : flavor.name)}
                    </span>
                    {eff?.is_on_sale && (
                      <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        AKCE
                      </span>
                    )}
                    {flavor.labels && (content.flavors[flavor.id]?.labels || flavor.labels).map(label => (
                      <span key={label} className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/20 border border-white/10 hidden sm:inline-block">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className={`text-xs leading-snug mt-0.5 text-balance min-h-[2.5em] flex items-center ${isSelected ? 'text-white' : 'text-foreground/80 font-medium'}`}>
                    {products.find(p => p.sku === sku)?.description || content.flavors[flavor.id]?.description || flavor.description}
                  </div>
                </div>
                {/* Info Tooltip & Nutrition */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${isSelected ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Informace o příchuti ${flavor.name}`}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>{eff?.tooltip || flavor.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <NutritionalFactsDialog
                    flavorName={content.flavors[flavor.id]?.name || flavor.name}
                    data={content.flavors[flavor.id]?.nutritionalFacts || (flavor as any).nutritionalFacts || ""}
                  />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlavorSelector;
