import { ShoppingCart, Sparkles } from "lucide-react";
import { startTransition } from "react";
import { Button } from "../ui/button";

interface CartButtonProps {
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  mobile?: boolean;
}

const CartButton = ({ cartCount, setIsCartOpen, mobile = false }: CartButtonProps) => {
  const handleClick = () => {
    if (cartCount === 0) {
      const element = document.getElementById('produkty');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      startTransition(() => {
        setIsCartOpen(true);
      });
    }
  };

  if (mobile) {
    return (
      <Button
        data-testid="header-cart-btn"
        variant="ghost"
        size="icon"
        className="relative rounded-full flex-shrink-0 min-w-[40px] min-h-[40px] hover:bg-lime"
        onClick={handleClick}
        aria-label="Otevřít košík"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 bg-terracotta text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <button
      data-testid="header-cart-btn"
      className="relative inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-button transition-all duration-300 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      onClick={handleClick}
    >
      <ShoppingCart className="w-4 h-4" />
      {cartCount === 0 ? "Nakoupit" : "Košík"}
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white animate-in zoom-in">
          {cartCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;
