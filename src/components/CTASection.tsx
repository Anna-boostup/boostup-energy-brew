import { Button } from "./ui/button";
import productGreen from "@/assets/product-green.png";

const CTASection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12 rounded-3xl bg-card border border-border shadow-card">
          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={productGreen}
              alt="BoostUp Shot"
              className="w-32 md:w-40 h-auto drop-shadow-lg"
            />
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-muted-foreground mb-2 text-sm">
              Získejte svůj BoostUp shot a zažijte nový level soustředění.
            </p>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Staň se zúčastněncem z naší výhody!
            </h3>
            <p className="text-muted-foreground">
              Přihlaš se k odběru a získej možnost získat tester nebo jiný výhody!
            </p>
          </div>

          {/* Email signup */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="vas@email.cz"
                className="px-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="hero" className="whitespace-nowrap">
                Přihlásit se
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
