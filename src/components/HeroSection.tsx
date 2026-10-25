import { useEffect, useState, lazy, Suspense } from "react";
import { ArrowRight, Zap, Leaf, Brain, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { useContent } from "@/context/ContentContext";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/hooks/useMediaQuery";
import { FLAVOR_THEMES } from "@/config/flavor-themes";
import type { FlavorType } from "@/config/product-data";
import FlavorDecor from "./hero/FlavorDecor";
import FlavorStage from "./hero/FlavorStage";
import { FLAVOR_ORDER } from "@/config/flavor-themes";

const IngredientDialog = lazy(() => import("./IngredientDialog"));

const benefitIcons = [Zap, Leaf, Brain, GraduationCap];

/**
 * Hero "Flavor Orbit": barevné světy se střídají samy v klidném rytmu.
 * Texty zůstávají z CMS beze změny.
 */
const HeroSection = () => {
  const { content: SITE_CONTENT } = useContent();
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null);
  const [flavor, setFlavor] = useState<FlavorType>("silky");

  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isWide = useMediaQuery("(min-width: 768px)");
  // Flip + pohyb jen na větší obrazovce a bez prefers-reduced-motion
  const animate = isWide && !reducedMotion;

  // Automatická, nenásilná rotace příchutí. Respektuje systémové nastavení
  // omezení pohybu a nepokračuje na skryté kartě prohlížeče.
  useEffect(() => {
    if (reducedMotion) return;

    const advance = () => {
      if (document.hidden) return;
      setFlavor((current) => FLAVOR_ORDER[(FLAVOR_ORDER.indexOf(current) + 1) % FLAVOR_ORDER.length]);
    };

    const timer = window.setInterval(advance, 4600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const theme = FLAVOR_THEMES[flavor];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  const imageAlt = `BoostUp Pure Shot - prémiový energetický shot (${theme.name})`;

  return (
    <section
      data-flavor={flavor}
      className="relative isolate m-2 overflow-hidden rounded-[2rem] pt-28 pb-10 transition-colors duration-700 motion-reduce:transition-none sm:m-3 sm:rounded-[2.5rem] lg:flex lg:min-h-[min(820px,calc(100svh-1.5rem))] lg:items-center lg:pb-14 lg:pt-32"
      style={{ backgroundColor: theme.base, color: theme.text }}
    >
      <FlavorDecor active={flavor} />

      <div className="container relative z-10 mx-auto px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
          {/* Nadpis a texty z CMS beze změny; na mobilu je lahev hned pod nadpisem */}
          <div className="text-center lg:col-span-7 lg:row-start-1 lg:self-end lg:pl-6 lg:text-left xl:pl-12">
            <h1 className="font-display">
              <span className="block text-xl font-medium uppercase leading-[1.1] sm:text-2xl md:text-3xl lg:text-4xl">
                {SITE_CONTENT.hero.headline.part1}
              </span>
              <span
                className="mt-2 block text-3xl font-medium uppercase leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl"
              >
                <span
                  className="underline decoration-4 underline-offset-[0.2em] motion-safe:transition-[color,text-decoration-color] motion-safe:duration-700"
                  style={{ color: theme.headlineAccent, textDecorationColor: theme.underline }}
                >
                  {SITE_CONTENT.hero.headline.gradient}
                </span>
              </span>
            </h1>
          </div>

          {/* Pravý sloupec: dominantní lahev se samovolně střídajícími příchutěmi */}
          <div className="flex flex-col items-center gap-8 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <FlavorStage active={flavor} animate={animate} alt={imageAlt} />
          </div>

          <div className="text-center lg:col-span-7 lg:row-start-2 lg:self-start lg:pl-6 lg:text-left xl:pl-12">
            <ul className="mx-auto mb-9 mt-2 flex max-w-xl flex-col gap-4 lg:mx-0 lg:mt-9">
              {SITE_CONTENT.hero.benefits.map((item, i) => {
                const Icon = benefitIcons[i] ?? Zap;
                return (
                  <li key={i} className="flex items-center gap-4 text-left">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,currentColor_14%,transparent)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="text-sm md:text-base">
                      <span className="font-bold">{item.bold}</span>
                      <span> — {item.text}</span>
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                variant="outline"
                size="xl"
                className="rounded-full border-2 border-current bg-transparent px-8 text-base font-bold text-inherit hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] hover:text-inherit focus-visible:ring-current focus-visible:ring-offset-0"
                onClick={() => scrollTo("mise")}
              >
                {SITE_CONTENT.hero.cta.secondary}
              </Button>

              <Button
                size="xl"
                className="group rounded-full px-8 text-base font-bold transition-[background-color,color,box-shadow,transform] duration-500 hover:brightness-95 focus-visible:ring-current focus-visible:ring-offset-0 motion-safe:hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.ctaBg,
                  color: theme.ctaText,
                  boxShadow: `0 14px 30px -12px color-mix(in srgb, ${theme.ctaBg} 70%, transparent)`,
                }}
                onClick={() => scrollTo("produkty")}
              >
                {SITE_CONTENT.hero.cta.primary}
                <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
              </Button>
            </div>
          </div>
        </div>

        {/* Štítky složení (otevírají detail složky) */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 lg:mt-12">
          {SITE_CONTENT.hero.tags.map((item) => (
            <button
              key={item.ingredientId}
              type="button"
              onClick={() => setActiveIngredient(item.ingredientId)}
              className="font-label group flex min-h-[44px] items-center gap-2.5 rounded-full border border-[color-mix(in_srgb,currentColor_35%,transparent)] px-5 py-2 text-xs transition-colors hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current motion-reduce:transition-none"
            >
              <span aria-hidden="true" className="h-2 w-2 flex-shrink-0 rounded-full bg-current" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeIngredient && (
        <Suspense fallback={null}>
          <IngredientDialog
            isOpen={!!activeIngredient}
            onClose={() => setActiveIngredient(null)}
            data={SITE_CONTENT.ingredientDetails[activeIngredient as keyof typeof SITE_CONTENT.ingredientDetails]}
            colorClass={
              activeIngredient === "stimulants"
                ? "bg-lime"
                : activeIngredient === "electrolytes"
                  ? "bg-terracotta"
                  : activeIngredient === "adaptogens"
                    ? "bg-orange"
                    : "bg-olive"
            }
          />
        </Suspense>
      )}
    </section>
  );
};

export default HeroSection;
