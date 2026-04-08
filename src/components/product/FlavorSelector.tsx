import ProductSpecsDialog from "./ProductSpecsDialog";
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
        {FLAVORS.filter(f => {
          const product = products.find(p => p.sku === f.id);
          return product?.is_active !== false;
        }).map((flavor, index) => {
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
                    {flavor.labels && (content.flavors[flavor.id]?.labels || flavor.labels).map(label => {
                      const tagStyles = isSelected
                        ? (flavor.id === 'lemon' ? 'text-primary border-primary/20 bg-primary/5' : 'text-white border-white/30 bg-white/10')
                        : 'text-muted-foreground border-primary/10 bg-primary/5';
                      
                      return (
                        <span 
                          key={label} 
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border hidden sm:inline-block transition-colors ${tagStyles}`}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  <div className={`text-xs leading-snug mt-1 text-balance min-h-[2.5em] flex items-center transition-colors ${isSelected 
                    ? (flavor.id === 'lemon' ? 'text-primary font-medium' : 'text-white/90 font-medium') 
                    : 'text-foreground/70 font-medium'
                  }`}>
                    {products.find(p => p.sku === sku)?.description || content.flavors[flavor.id]?.description || flavor.description}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <ProductSpecsDialog
                    flavorName={content.flavors[flavor.id]?.name || flavor.name}
                    specs={content.flavors[flavor.id]?.fullSpecs}
                    isSelected={isSelected}
                    flavorId={flavor.id}
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
