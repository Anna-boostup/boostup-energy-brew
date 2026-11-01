import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight, Beaker, Bolt, GraduationCap, Timer } from "lucide-react";
import { Button } from "./ui/button";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/hooks/useMediaQuery";
import { SHOWCASE_FLAVORS, SHOWCASE_FLAVOR_ORDER, type ShowcaseFlavorId } from "@/config/showcase-flavors";
import ShowcaseFlavorStage from "./hero/ShowcaseFlavorStage";

const proofPoints = [
  { icon: GraduationCap, label: "VYVINUTO S ODBORNÍKY", detail: "na Mendelově univerzitě" },
  { icon: Bolt, label: "SÍLA 2,5 ESPRESSA", detail: "v jednom 60 ml shotu" },
  { icon: Timer, label: "READY-TO-DRINK", detail: "když není čas nic míchat" },
  { icon: Beaker, label: "PROMYŠLENÉ SLOŽENÍ", detail: "extrakty · vitamíny · minerály" },
];

const HeroSection = () => {
  const [flavor, setFlavor] = useState<ShowcaseFlavorId>("apple-ginger");
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isWide = useMediaQuery("(min-width: 768px)");
  const animate = isWide && !reducedMotion;
  const theme = SHOWCASE_FLAVORS[flavor];

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFlavor((current) => SHOWCASE_FLAVOR_ORDER[(SHOWCASE_FLAVOR_ORDER.indexOf(current) + 1) % SHOWCASE_FLAVOR_ORDER.length]);
    }, 4600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

  return (
    <section data-flavor={flavor} className="relative isolate overflow-hidden bg-[#33522F] pb-10 pt-28 text-[#E0E561] lg:flex lg:min-h-[min(860px,100svh)] lg:items-center lg:pb-14 lg:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[12%] -top-[22%] h-[78vw] w-[78vw] rounded-full bg-[#E0E561]/15 blur-3xl" />
        <div className="absolute -bottom-[32%] left-[15%] h-[45vw] w-[45vw] rounded-full border border-current/20" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>
      <div className="container relative z-10 mx-auto px-5 sm:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
          <div className="text-center lg:col-span-7 lg:row-start-1 lg:self-end lg:pl-6 lg:text-left xl:pl-12">
            <p className="font-label mb-5 inline-flex items-center gap-2 rounded-full bg-[#E0E561] px-4 py-2 text-[10px] text-[#33522F] sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-[#33522F]" /> BOOSTUP PURE SHOT
            </p>
            <h1 className="max-w-4xl font-display text-balance text-[clamp(3rem,6.2vw,6.65rem)] font-black uppercase leading-[0.88] tracking-[-0.065em]">
              JE 14:37.<br />
              <span className="text-white">A TY UŽ ČTEŠ</span><br />
              STEJNÝ MAIL<br className="hidden sm:block" /> POTŘETÍ.
            </h1>
          </div>
          <div className="order-2 flex justify-center lg:order-none lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <ShowcaseFlavorStage active={flavor} animate={animate} alt={`BoostUp Pure Shot – ${theme.name}`} />
          </div>
          <div className="order-3 text-center lg:col-span-7 lg:row-start-2 lg:self-start lg:pl-6 lg:text-left xl:pl-12">
            <p className="mx-auto max-w-2xl text-lg font-semibold leading-relaxed sm:text-xl lg:mx-0">Funkční shot pro chvíle, kdy hlava jede naplno a potřebuješ zůstat ve svém tempu.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="xl" className="group rounded-full bg-[#E0E561] px-7 text-base font-bold text-[#33522F] hover:bg-white" onClick={() => scrollTo("produkty")}>
                Vybrat příchuť <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="xl" className="rounded-full border-2 border-current bg-transparent px-7 text-base font-bold text-inherit hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] hover:text-inherit" onClick={() => scrollTo("jak-funguje")}>
                Jak BoostUp funguje <ArrowDownRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-7 lg:grid-cols-4">
          {proofPoints.map(({ icon: Icon, label, detail }) => (
            <article key={label} className="flex min-h-24 items-center gap-4 rounded-[1.65rem] border border-current/20 bg-[color-mix(in_srgb,currentColor_10%,transparent)] px-5 py-4 backdrop-blur-sm">
              <Icon className="h-6 w-6 shrink-0" strokeWidth={2.3} aria-hidden="true" />
              <div><p className="font-label text-[10px] leading-tight sm:text-[11px]">{label}</p><p className="mt-1 text-sm font-semibold leading-tight opacity-85">{detail}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
