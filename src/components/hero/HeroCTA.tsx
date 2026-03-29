import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

interface HeroCTAProps {
  cta: {
    primary: string;
    secondary: string;
    concept3b: string;
  };
}

const HeroCTA = ({ cta }: HeroCTAProps) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up animation-delay-600 items-center relative z-20">
      <Button
        variant="default"
        size="xl"
        className="bg-secondary text-foreground border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 min-w-[200px] shadow-button hover:shadow-lg animate-energy-pulse rounded-full hover:scale-105 cursor-pointer"
        onClick={() => scrollTo('mise')}
      >
        {cta.secondary}
      </Button>

      <Button
        variant="default"
        size="xl"
        className="group min-w-[200px] shadow-button hover:shadow-lg transition-all animate-energy-pulse rounded-full hover:scale-105 cursor-pointer"
        onClick={() => scrollTo('produkty')}
      >
        {cta.primary}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform ml-2" />
      </Button>

      <Button
        variant="default"
        size="xl"
        className="bg-secondary text-terracotta border-2 border-terracotta hover:bg-terracotta hover:text-white transition-all duration-300 min-w-[200px] shadow-button hover:shadow-lg animate-energy-pulse rounded-full hover:scale-105 cursor-pointer"
        onClick={() => scrollTo('3b')}
      >
        {cta.concept3b}
      </Button>
    </div>
  );
};

export default HeroCTA;
