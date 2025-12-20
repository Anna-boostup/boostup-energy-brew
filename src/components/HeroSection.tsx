import { Button } from "./ui/button";
import productGreen from "@/assets/product-green.png";
import productRed from "@/assets/product-red.png";
import productYellow from "@/assets/product-yellow.png";

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Announcement Banner */}
      <div className="absolute top-20 left-0 right-0 z-10">
        <div className="flex justify-center">
          <Button variant="announcement" className="animate-pulse-soft">
            BRZY NA TRHU
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left animate-fade-up">
            <p className="text-muted-foreground mb-4 tracking-wide uppercase text-sm">
              Pure Energy • Natural Ingredients
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              Energie na celý den,{" "}
              <span className="text-primary">přirozeně.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              60 ml čisté energie z čajového extraktu. Síla 2,5 espressa bez nervozity. 
              Minimálně 6 hodin soustředění pro ty, kdo chtějí více.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg">
                Objevit produkty
              </Button>
              <Button variant="outline" size="lg" className="rounded-full">
                Naše příběh
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-olive" />
                Čajový extrakt
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-lime" />
                Elektrolyty
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-terracotta" />
                Adaptogeny
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="flex-1 relative">
            <div className="flex items-end justify-center gap-4 md:gap-8">
              <div className="animate-fade-up animation-delay-200">
                <img
                  src={productYellow}
                  alt="Lemon Blast - Citronová příchuť"
                  className="w-28 md:w-36 lg:w-44 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="animate-fade-up animation-delay-400 -mb-4">
                <img
                  src={productGreen}
                  alt="Silky Leaf - Zelený čaj"
                  className="w-32 md:w-44 lg:w-52 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300 animate-float"
                />
              </div>
              <div className="animate-fade-up animation-delay-600">
                <img
                  src={productRed}
                  alt="Red Rush - Červené ovoce"
                  className="w-28 md:w-36 lg:w-44 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-secondary/50 to-transparent" />
    </section>
  );
};

export default HeroSection;
