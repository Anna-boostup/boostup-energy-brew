import { Button } from "./ui/button";
import { Zap, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-24 bg-gradient-to-br from-primary via-olive-dark to-foreground relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-lime/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl animate-pulse-soft animation-delay-400" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-primary-foreground text-sm font-semibold mb-8 border border-primary-foreground/20">
            <Zap className="w-4 h-4 text-lime" />
            <span>Buď první, kdo to zkusí</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-6 leading-tight">
            PŘIPRAV SE NA
            <span className="block text-lime">NOVOU ÉRU ENERGIE</span>
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Přihlaš se k odběru a získej exkluzivní přístup k testerům, slevám a novinkám. 
            Buď součástí komunity BoostUp.
          </p>

          {/* Email signup */}
          <div 
            className="max-w-xl mx-auto mb-12"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`flex flex-col sm:flex-row gap-4 p-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border-2 transition-all duration-300 ${isHovered ? 'border-lime shadow-lg shadow-lime/20' : 'border-primary-foreground/20'}`}>
              <div className="flex-1 flex items-center gap-3 px-4">
                <Mail className="w-5 h-5 text-primary-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  className="w-full py-3 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none text-lg"
                />
              </div>
              <Button 
                variant="default" 
                size="lg" 
                className="bg-lime hover:bg-lime-dark text-foreground font-bold rounded-full px-8 group"
              >
                Přihlásit se
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-olive border-2 border-foreground"
                  />
                ))}
              </div>
              <span className="text-sm">+500 čeká na launch</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-terracotta" />
              <span className="text-sm">Launch Q1 2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
