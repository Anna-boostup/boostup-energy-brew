
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const InfoTip = ({ text }: { text: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <span role="button" tabIndex={-1} onClick={(e) => e.stopPropagation()} aria-label="Nápověda" className="opacity-70 hover:opacity-100 cursor-help align-middle">
                <Info className="w-3.5 h-3.5 inline" />
            </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
);

type PurchaseType = 'onetime' | 'subscription';

interface PurchaseTypeSelectorProps {
  purchaseType: PurchaseType | null;
  onSelectPurchaseType: (type: PurchaseType) => void;
}

const PurchaseTypeSelector = ({ purchaseType, onSelectPurchaseType }: PurchaseTypeSelectorProps) => {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-foreground mb-4 tracking-widest">MOŽNOSTI NÁKUPU</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        <button
          data-testid="purchase-type-onetime"
          onClick={() => onSelectPurchaseType('onetime')}
          className={`p-4 rounded-2xl border-2 transition-all duration-300 relative ${purchaseType === 'onetime'
            ? "bg-primary border-primary text-primary-foreground shadow-button scale-[1.02]"
            : "border-primary/40 bg-transparent text-muted-foreground hover:bg-transparent hover:border-primary hover:text-foreground hover:shadow-md"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'onetime' ? "border-primary-foreground" : "border-muted-foreground"}`}>
              {purchaseType === 'onetime' && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
            </div>
            <div className="text-left">
              <div className="font-bold text-sm sm:text-base">Jednorázový nákup</div>
              <div className={`text-[10px] sm:text-xs ${purchaseType === 'onetime' ? "text-primary-foreground" : "text-foreground/80"}`}>Standardní cena</div>
            </div>
          </div>
        </button>

        <button
          data-testid="purchase-type-subscription"
          onClick={() => onSelectPurchaseType('subscription')}
          className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${purchaseType === 'subscription'
            ? "bg-amber-500 border-amber-500 text-white shadow-button scale-[1.02]"
            : "border-primary/40 bg-transparent text-muted-foreground hover:bg-transparent hover:border-amber-500 hover:text-foreground hover:shadow-md"
            }`}
        >
          <div className="absolute top-0 right-0 bg-amber-600/20 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl backdrop-blur-sm">
            -10% SLEVA
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscription' ? "border-white" : "border-muted-foreground"}`}>
              {purchaseType === 'subscription' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </div>
            <div className="text-left">
              <div className="font-bold text-sm sm:text-base inline-flex items-center gap-1">Předplatné <InfoTip text="Pravidelné dodávky se slevou. Termín odeslání, dopravu i zrušení spravuješ ve svém účtu; doprava se účtuje u každé zásilky." /></div>
              <div className={`text-[10px] sm:text-xs ${purchaseType === 'subscription' ? "text-white" : "text-foreground/70"}`}>Každý měsíc <span className={`font-bold ${purchaseType === 'subscription' ? "text-white" : "text-amber-600"}`}>-10%</span></div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PurchaseTypeSelector;
