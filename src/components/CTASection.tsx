import { Button } from "./ui/button";
import { Zap, Mail, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-28 bg-gradient-to-br from-primary via-olive-dark to-foreground relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-lime/10 via-transparent to-terracotta/10" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lime/25 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-terracotta/25 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange/20 rounded-full blur-3xl animate-pulse-glow animation-delay-200" />
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-lime/20 backdrop-blur-sm rounded-full text-lime text-sm font-black mb-10 border border-lime/30 animate-fade-up animate-bounce-subtle">
            <Sparkles className="w-5 h-5" />
            <span>Buď první, kdo to zkusí</span>
            <Zap className="w-5 h-5" />
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-primary-foreground mb-8 leading-tight animate-fade-up animation-delay-100">
            PŘIPRAV SE NA
            <span className="block text-lime animate-slide-in-left animation-delay-300">NOVOU ÉRU ENERGIE</span>
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto animate-fade-up animation-delay-200">
            Přihlaš se k odběru a získej exkluzivní přístup k testerům, slevám a novinkám.
            Buď součástí komunity BoostUp.
          </p>

          {/* Email signup */}
          <div
            className="max-w-xl mx-auto mb-14 animate-fade-up animation-delay-400"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`flex flex-col sm:flex-row items-center gap-4 p-2 rounded-2xl sm:rounded-full bg-primary-foreground/10 backdrop-blur-sm border-2 transition-all duration-500 ${isHovered ? 'border-lime shadow-lg shadow-lime/30 scale-[1.02]' : 'border-primary-foreground/20'}`}>
              <div className="flex-1 flex items-center gap-3 px-5">
                <Mail className={`w-6 h-6 transition-colors duration-300 ${isHovered ? 'text-lime' : 'text-primary-foreground/60'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  className="w-full py-4 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none text-lg font-medium"
                />
              </div>
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto bg-lime hover:bg-lime-dark text-foreground font-black rounded-full px-10 py-6 group shadow-button flex items-center justify-center"
              >
                Přihlásit se
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-10 text-primary-foreground/70 animate-fade-up animation-delay-600">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-lime via-olive to-terracotta border-2 border-foreground animate-pulse-soft"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
              <span className="text-sm font-bold">+500 čeká na launch</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-lime animate-pulse" />
              <span className="text-sm font-bold">Launch Q1 2025</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange" />
              <span className="text-sm font-bold">100% přírodní</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
