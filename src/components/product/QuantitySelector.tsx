
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

const QuantitySelector = ({ quantity, onQuantityChange }: QuantitySelectorProps) => {
  return (
    <div className="flex items-center justify-between gap-4 bg-card rounded-3xl px-6 py-4 border-2 border-border shadow-card h-full min-h-[76px]">
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 text-foreground"
        aria-label="Snížit množství"
      >
        <Minus className="w-5 h-5" />
      </button>
      <span className="w-12 text-center font-bold text-2xl text-foreground">{quantity}</span>
      <button
        onClick={() => onQuantityChange(quantity + 1)}
        className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 text-foreground"
        aria-label="Zvýšit množství"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default QuantitySelector;
