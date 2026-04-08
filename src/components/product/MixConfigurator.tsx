
import { Minus, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ProductSpecsDialog from "./ProductSpecsDialog";
import { FLAVORS, type FlavorConfig } from "@/config/product-data";

interface MixConfiguratorProps {
  selectedPack: number;
  mixCounts: Record<string, number>;
  onMixChange: (flavorId: string, change: number) => void;
  isMixValid: boolean;
  content: any;
  getEffectiveProduct: (sku: string) => any;
  cleanName: (name: string) => string;
  products: any[];
}

const MixConfigurator = ({
  selectedPack,
  mixCounts,
  onMixChange,
  isMixValid,
  content,
  getEffectiveProduct,
  cleanName,
  products
}: MixConfiguratorProps) => {
  const currentMixCount = Object.values(mixCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-6 animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-sm font-bold text-foreground tracking-widest">NAMÍCHEJ SI VLASTNÍ MIX</h3>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${isMixValid ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
          Vybráno: {currentMixCount} / {selectedPack} ks
        </div>
      </div>
      <div className="space-y-3">
        {FLAVORS.filter(f => {
          const product = products.find(p => p.sku === f.id);
          return product?.is_active !== false;
        }).map((flavor, index) => (
          <div
            key={flavor.id}
            className={`w-full p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 border-2 ${mixCounts[flavor.id] > 0 ? `bg-gradient-to-r ${flavor.color} ${flavor.textColor} shadow-md border-transparent` : 'border-dashed border-border bg-secondary/30'}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="text-left min-w-0 flex-1 pr-10">
                <div className="font-bold text-base leading-tight">
                  {content.flavors[flavor.id]?.name || (getEffectiveProduct(flavor.id) ? cleanName(getEffectiveProduct(flavor.id)!.name) : flavor.name)}
                  {flavor.labels && (content.flavors[flavor.id]?.labels || flavor.labels).map(label => (
                    <span key={label} className="ml-2 text-[8px] uppercase font-bold px-1 py-0.5 rounded-full bg-white/10 border border-white/5 inline-block align-middle">
                      {label}
                    </span>
                  ))}
                </div>
                <div className={`text-xs leading-snug mt-0.5 text-balance min-h-[2.5em] flex items-center ${mixCounts[flavor.id] > 0 ? (flavor.id === 'lemon' ? 'text-primary' : 'text-white') : 'text-foreground/90 font-medium'}`}>
                  {getEffectiveProduct(flavor.id)?.description || content.flavors[flavor.id]?.description || flavor.description}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 !bg-white rounded-full border border-border px-1 py-1 shadow-sm z-10 relative">
                <button
                  onClick={() => onMixChange(flavor.id, -1)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-foreground"
                  disabled={mixCounts[flavor.id] === 0}
                  aria-label={`Odebrat ${flavor.name}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="min-w-[3rem] px-2 text-center font-bold text-sm text-foreground">
                  {mixCounts[flavor.id]}
                </span>
                <button
                  onClick={() => onMixChange(flavor.id, 1)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-foreground"
                  disabled={currentMixCount >= (selectedPack || 0)}
                  aria-label={`Přidat ${flavor.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col items-end gap-1">
                <ProductSpecsDialog
                  flavorName={content.flavors[flavor.id]?.name || flavor.name}
                  specs={content.flavors[flavor.id]?.fullSpecs}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {!isMixValid && (
        <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm text-center flex items-center justify-center gap-2 animate-pulse">
          <Info className="w-4 h-4" />
          <span>Prosím vyberte ještě {selectedPack - currentMixCount} ks do naplnění balení.</span>
        </div>
      )}
    </div>
  );
};

export default MixConfigurator;
