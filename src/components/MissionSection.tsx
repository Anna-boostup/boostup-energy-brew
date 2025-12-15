import productGreen from "@/assets/product-green.png";

const MissionSection = () => {
  return (
    <section id="mise" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Image */}
          <div className="flex-1 relative">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl -rotate-3" />
              <img
                src={productGreen}
                alt="BoostUp produkt"
                className="relative w-64 mx-auto drop-shadow-xl"
              />
            </div>
            <p className="text-center mt-6 text-sm text-muted-foreground italic">
              Tady přibližně sama lahvička a naší cesty
            </p>
          </div>

          {/* Content */}
          <div className="flex-1">
            <span className="text-primary font-medium tracking-wide uppercase text-sm">
              O nás
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-6">
              NAŠE MISE
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Každý z nás zná ten den, kdy se snažíte soustředit, dodělat úkol, 
                ale prostě to nejde. Káva už nepomáhá a klasické energeťáky?
              </p>
              <p>
                Ty vás sice nakopnou, ale za půl hodinu jste zase dolů.
                Chtěli jsme to změnit. Proto jsme vytvořili BoostUp – čistý, efektivní 
                shot, který vás drží v kondici celé hodiny.
              </p>
              <p>
                <strong className="text-foreground">Bez umělých sladidel.</strong> Bez crash efektu. 
                Jen přesně to, co vaše tělo a mysl potřebují.
              </p>
              <p>
                BoostUp pomáhá profesionálům zůstat na špičce jejich výkonu – 
                a to bez kompromisů na zdraví.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
