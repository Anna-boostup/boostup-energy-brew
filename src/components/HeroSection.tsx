import { ArrowDownRight, ArrowRight, Beaker, Bolt, GraduationCap, Timer } from "lucide-react";
import { Button } from "./ui/button";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/hooks/useMediaQuery";
import FlavorDecor from "./hero/FlavorDecor";
import FlavorStage from "./hero/FlavorStage";

const proofPoints = [
  { icon: GraduationCap, label: "VYVINUTO S ODBORNÍKY", detail: "na Mendelově univerzitě", tone: "bg-lime text-olive" },
  { icon: Bolt, label: "SÍLA 2,5 ESPRESSA", detail: "v jednom 60 ml shotu", tone: "bg-orange text-cream" },
  { icon: Timer, label: "READY-TO-DRINK", detail: "když není čas nic míchat", tone: "bg-terracotta text-cream" },
  { icon: Beaker, label: "PROMYŠLENÉ SLOŽENÍ", detail: "extrakty · vitamíny · minerály", tone: "bg-olive text-lime" },
];

const HeroSection = () => {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

  return (
    <section className="relative isolate overflow-hidden bg-cream pb-10 pt-28 text-olive lg:min-h-[min(860px,100svh)] lg:pb-14 lg:pt-32">
      <FlavorDecor active="silky" />
      <div aria-hidden="true" className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-lime/40 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-orange/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-5 sm:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-x-8">
          <div className="text-center lg:col-span-7 lg:text-left xl:pl-8">
            <p className="font-label mb-5 inline-flex items-center gap-2 rounded-full bg-olive px-4 py-2 text-[10px] text-lime sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-lime" /> BOOSTUP PURE SHOT
            </p>
            <h1 className="max-w-4xl font-display text-balance text-[clamp(3.1rem,7.2vw,7.5rem)] font-black uppercase leading-[0.88] tracking-[-0.065em]">
              JE 14:37.<br />
              <span className="text-terracotta">A TY UŽ ČTEŠ</span><br />
              STEJNÝ MAIL<br className="hidden sm:block" /> POTŘETÍ.
            </h1>
          </div>

          <div className="order-2 flex justify-center lg:order-none lg:col-span-5 lg:row-span-2">
            <div className="w-full max-w-[410px] lg:max-w-[490px]">
              <FlavorStage active="silky" animate={false} alt="BoostUp Pure Shot Silky Leaf" />
            </div>
          </div>

          <div className="order-3 text-center lg:col-span-7 lg:text-left xl:pl-8">
            <p className="mx-auto max-w-2xl text-lg font-semibold leading-relaxed text-olive/85 sm:text-xl lg:mx-0">
              Funkční shot pro chvíle, kdy hlava jede naplno a potřebuješ zůstat ve svém tempu.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="xl" className="group rounded-full bg-olive px-7 text-base font-bold text-lime hover:bg-olive-dark" onClick={() => scrollTo("produkty")}>
                Vybrat příchuť <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="ghost" size="xl" className="rounded-full px-7 text-base font-bold text-olive hover:bg-olive/10 hover:text-olive" onClick={() => scrollTo("jak-funguje")}>
                Jak BoostUp funguje <ArrowDownRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-7 lg:grid-cols-4">
          {proofPoints.map(({ icon: Icon, label, detail, tone }) => (
            <article key={label} className={`flex min-h-28 items-center gap-4 rounded-[1.65rem] px-5 py-4 shadow-card ${tone}`}>
              <Icon className="h-7 w-7 shrink-0" strokeWidth={2.3} aria-hidden="true" />
              <div>
                <p className="font-label text-[10px] leading-tight sm:text-[11px]">{label}</p>
                <p className="mt-1 text-sm font-semibold leading-tight opacity-85">{detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
