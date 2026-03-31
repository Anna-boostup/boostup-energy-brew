import { useContent } from "@/context/ContentContext";
import { Button } from "./ui/button";
import { Zap, Mail, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { getTextStyle, isBadgeVisible } from "@/lib/textStyles";

import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CTASection = () => {
  const { content: SITE_CONTENT } = useContent();
  const content = SITE_CONTENT.cta;
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Neplatný e-mail",
        description: "Prosím zadejte platnou e-mailovou adresu.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save to Supabase database
      const { error: dbError } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (dbError) {
        console.error('Supabase DB error:', dbError);
        // Note: Even if DB save fails, we continue with the email notification as fallback
      }

      // 2. Send email notification to the team
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@drinkboostup.cz',
          type: 'newsletter_signup',
          subscriberEmail: email
        })
      });

      if (!response.ok) throw new Error('Email notification failed');

      toast({
        title: "Úspěšně přihlášeno!",
        description: "Děkujeme za váš zájem o BoostUp.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se nás přihlásit. Zkuste to prosím později.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isBadgeVisible(SITE_CONTENT, 'cta.badge') && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-lime/20 backdrop-blur-sm rounded-full text-lime text-sm font-black mb-10 border border-lime/30 animate-fade-up"
              style={getTextStyle(SITE_CONTENT, 'cta.badge')}>
              <Sparkles className="w-5 h-5" />
              <span>{content.badge}</span>
              <Zap className="w-5 h-5" />
            </div>
          )}

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-primary-foreground mb-8 leading-tight animate-fade-up animation-delay-100">
            <span style={getTextStyle(SITE_CONTENT, 'cta.headline.part1')}>{content.headline.part1}</span>
            <span className="block text-lime animate-slide-in-left animation-delay-300" style={getTextStyle(SITE_CONTENT, 'cta.headline.highlight')}>{content.headline.highlight}</span>
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto animate-fade-up animation-delay-200"
            style={getTextStyle(SITE_CONTENT, 'cta.description')}>
            {content.description}
          </p>

          {/* Email signup */}
          <div
            className="max-w-xl mx-auto mb-14 animate-fade-up animation-delay-400"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <form onSubmit={handleSubscribe} className={`flex flex-col sm:flex-row items-center gap-4 p-2 rounded-2xl sm:rounded-full bg-primary-foreground/10 backdrop-blur-sm border-2 transition-all duration-500 ${isHovered ? 'border-lime shadow-lg shadow-lime/30 scale-[1.02]' : 'border-primary-foreground/20'}`}>
              <div className="flex-1 flex items-center gap-3 px-5 w-full">
                <Mail className={`w-6 h-6 transition-colors duration-300 ${isHovered ? 'text-lime' : 'text-primary-foreground/60'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.placeholder}
                  className="w-full py-4 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none text-lg font-medium"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-lime hover:bg-lime-dark text-foreground font-black rounded-full px-10 py-6 group shadow-button flex items-center justify-center transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {content.button}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-6 text-sm text-primary-foreground/60 max-w-lg mx-auto animate-fade-up animation-delay-500 leading-relaxed">
              Kliknutím na tlačítko souhlasíte se zpracováním osobních údajů pro účely zasílání newsletteru. 
              Podrobné informace o tom, jak vaše údaje chráníme, naleznete v našich 
              <Link to="/ochrana-osobnich-udaju" className="underline hover:text-lime transition-colors ml-1">Zásadách ochrany osobních údajů</Link>.
            </p>
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
              <span className="text-sm font-bold">{content.socialProof.waiting}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-lime animate-pulse" />
              <span className="text-sm font-bold">{content.socialProof.launch}</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange" />
              <span className="text-sm font-bold">{content.socialProof.natural}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
