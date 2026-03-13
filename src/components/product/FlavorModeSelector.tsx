
import { Droplet, Blend } from "lucide-react";

type FlavorMode = "single" | "mix";

interface FlavorModeSelectorProps {
  flavorMode: FlavorMode | null;
  onSelectFlavorMode: (mode: FlavorMode) => void;
}

const FlavorModeSelector = ({ flavorMode, onSelectFlavorMode }: FlavorModeSelectorProps) => {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-foreground mb-4 tracking-widest">CHCI</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        <button
          onClick={() => onSelectFlavorMode("single")}
          className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "single"
            ? "bg-primary border-primary text-primary-foreground shadow-button scale-[1.02]"
            : "border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60"
            }`}
        >
          <Droplet className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold text-sm sm:text-base">Jednu příchuť</div>
            <div className={`text-[10px] sm:text-xs ${flavorMode === "single" ? "text-primary-foreground" : "text-foreground/80"}`}>Vyberu si níže</div>
          </div>
        </button>

        <button
          onClick={() => onSelectFlavorMode("mix")}
          className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-300 hover-lift ${flavorMode === "mix"
            ? "bg-gradient-to-r from-lime via-terracotta to-olive border-transparent text-cream shadow-button scale-[1.02]"
            : "border-primary/40 bg-transparent text-muted-foreground hover:border-primary/60"
            }`}
        >
          <Blend className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold text-sm sm:text-base">Mix příchutí</div>
            <div className={`text-[10px] sm:text-xs ${flavorMode === "mix" ? "text-cream" : "text-foreground/80"}`}>Všechny 3 najednou</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FlavorModeSelector;
