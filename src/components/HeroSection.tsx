import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import flavorsImage from "@/assets/boostup-four-flavors.png";
import { Button } from "./ui/button";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/hooks/useMediaQuery";

const FLAVORS = [
  { id: "apple-ginger", name: "Jablko & zázvor", eyebrow: "PŘIROZENĚ OSTRÝ START", note: "Svěží jablko, zázvor a čistá energie pro dny, kdy chceš zůstat v tempu.", dot: "#E0E561", crop: { left: "0%", top: "0%" } },
  { id: "apple-cinnamon", name: "Jablko & skořice", eyebrow: "HŘEJIVÝ RYTMUS", note: "Jemné jablko, skořice a soustředění, které nekončí po první hodině.", dot: "#F49548", crop: { left: "-100%", top: "0%" } },
  { id: "blackcurrant", name: "Černý rybíz", eyebrow: "TEMNĚ OVOCNÁ VLNA", note: "Výrazný rybíz pro chvíle, kdy hlava jede naplno a potřebuješ držet směr.", dot: "#A55BB8", crop: { left: "0%", top: "-100%" } },
  { id: "raspberry", name: "Malina", eyebrow: "JASNÝ ČERVENÝ IMPULZ", note: "Šťavnatá malina a funkční energie bez zbytečného hluku kolem.", dot: "#BB2E4A", crop: { left: "-100%", top: "-100%" } },
] as const;

type FlavorId = (typeof FLAVORS)[number]["id"];

const HeroSection = () => {
  const [flavor, setFlavor] = useState<FlavorId>("apple-ginger");
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const activeFlavor = FLAVORS.find(({ id }) => id === flavor) ?? FLAVORS[0];

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setFlavor((current) => {
        const index = FLAVORS.findIndex(({ id }) => id === current);
        return FLAVORS[(index + 1) % FLAVORS.length].id;
      });
    }, 5600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

  return (
    <section aria-label="BoostUp Pure Shot" className="relative isolate min-h-[max(760px,100svh)] overflow-hidden bg-[#33522F] pb-12 pt-28 text-[#E0E561] lg:flex lg:min-h-[min(920px,100svh)] lg:items-center lg:pb-16 lg:pt-32">
      <div aria-hidden="true" className="absolute inset-0 bg-[#33522F]">
        {FLAVORS.map((item) => (
          <div key={item.id} className={`absolute inset-0 overflow-hidden transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${item.id === flavor ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`}>
            <img src={flavorsImage} alt="" className="absolute h-[200%] w-[200%] max-w-none" style={item.crop} />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#33522F_0%,#33522F_25%,rgba(51,82,47,0.97)_38%,rgba(51,82,47,0.5)_54%,rgba(51,82,47,0.03)_74%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(51,82,47,0.82),transparent)]" />
      </div>

      <div className="container relative z-10 mx-auto px-5 sm:px-8">
        <div className="max-w-[43rem] pt-8 lg:pl-6 xl:pl-12">
          <p className="font-label mb-5 inline-flex items-center gap-2 rounded-full border border-[#E0E561]/25 bg-[#33522F]/80 px-4 py-2 text-[10px] tracking-[0.16em] backdrop-blur-sm sm:text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeFlavor.dot }} />
            {activeFlavor.eyebrow}
          </p>
          <h1 className="font-display max-w-xl text-balance text-[clamp(3.1rem,6.3vw,6.65rem)] font-black uppercase leading-[0.87] tracking-[-0.065em]">
            ENERGIE,<br />
            KTERÁ <span className="text-white">DRŽÍ</span><br />
            KROK.
          </h1>
          <div className="mt-7 max-w-md">
            <p className="font-label text-xs uppercase tracking-[0.18em] text-[#E0E561]/70">{activeFlavor.name}</p>
            <p className="mt-3 text-base font-semibold leading-relaxed text-white/85 sm:text-lg">{activeFlavor.note}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" className="group rounded-full bg-[#E0E561] px-7 text-base font-bold text-[#33522F] hover:bg-white" onClick={() => scrollTo("produkty")}>
              Vybrat příchuť <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="xl" className="rounded-full border-2 border-[#E0E561]/80 bg-transparent px-7 text-base font-bold text-[#E0E561] hover:bg-[#E0E561]/10 hover:text-[#E0E561]" onClick={() => scrollTo("jak-funguje")}>
              Jak BoostUp funguje <ArrowDownRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 right-5 z-20 flex items-center gap-2 rounded-full bg-[#33522F]/80 px-3 py-2 backdrop-blur-md sm:bottom-10 sm:right-8 lg:right-12">
        <span className="sr-only">Vyber příchuť</span>
        {FLAVORS.map((item) => {
          const selected = item.id === flavor;
          return (
            <button key={item.id} type="button" onClick={() => setFlavor(item.id)} className="group relative flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={`Zobrazit příchuť ${item.name}`} aria-pressed={selected}>
              <span className={`block rounded-full transition-all duration-300 ${selected ? "h-4 w-4 ring-2 ring-white ring-offset-2 ring-offset-[#33522F]" : "h-2.5 w-2.5 group-hover:h-3.5 group-hover:w-3.5"}`} style={{ backgroundColor: item.dot }} />
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default HeroSection;
