import { useEffect, useRef, useState } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/hooks/useMediaQuery";
import FlavorStage from "./hero/FlavorStage";

const layers = [
  { title: "ZŮSTAT V TEMPU", text: "Energie pro chvíle, kdy den ještě nekončí.", className: "bg-lime text-olive" },
  { title: "UDRŽET HLAVU ČISTOU", text: "Když potřebuješ dokončit, ne jen začít.", className: "bg-olive text-lime" },
  { title: "USTÁT TLAK", text: "Pro dny plné změn, termínů a rozhodování.", className: "bg-orange text-cream" },
  { title: "NESPOLEHNOUT SE NA NÁHODU", text: "Promyšlené složení místo dalšího impulzu.", className: "bg-terracotta text-cream" },
];

const FormulaRevealSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    if (reducedMotion) return;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [reducedMotion]);

  const activeLayer = reducedMotion ? 4 : Math.min(4, Math.floor(progress * 5) + 1);

  return (
    <section id="jak-funguje" ref={sectionRef} className="relative min-h-[190vh] bg-olive text-cream">
      <div className="sticky top-0 flex min-h-svh items-center overflow-hidden py-20">
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[min(68vw,850px)] w-[min(68vw,850px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/15 blur-[100px]" />
        <div className="container relative z-10 mx-auto grid items-center gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-5">
          <div className="text-center lg:col-span-4 lg:text-left xl:pl-8">
            <p className="font-label mb-5 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-[10px] text-olive sm:text-xs"><Sparkles className="h-3.5 w-3.5" /> JAK TO FUNGUJE</p>
            <h2 className="text-balance font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-5xl xl:text-6xl">
              PROČ JSME PŘI VÝVOJI NEŘEŠILI JEN MNOŽSTVÍ KOFEINU?
            </h2>
            <p className="mt-6 max-w-md text-base font-semibold leading-relaxed text-cream/75 lg:text-lg">Protože dlouhý den nevyřeší jeden rychlý impulz.</p>
          </div>

          <div className="relative order-first mx-auto w-full max-w-[280px] lg:order-none lg:col-span-4 lg:max-w-[370px]" style={{ transform: `translateY(${reducedMotion ? 0 : (0.5 - progress) * 58}px)`, transition: "transform 80ms linear" }}>
            <FlavorStage active="silky" animate={false} alt="BoostUp Pure Shot Silky Leaf" />
          </div>

          <div className="lg:col-span-4">
            <div className="grid gap-3">
              {layers.map((layer, index) => {
                const isActive = index < activeLayer;
                return (
                  <article key={layer.title} className={`rounded-[1.5rem] p-5 transition-all duration-500 ${layer.className} ${isActive ? "translate-x-0 opacity-100" : "translate-x-10 opacity-20"}`}>
                    <p className="font-label text-xs">0{index + 1}</p>
                    <h3 className="mt-2 font-display text-xl font-black tracking-[-0.03em] sm:text-2xl">{layer.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-snug opacity-80">{layer.text}</p>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-lime/80 lg:justify-start"><ArrowDown className="h-4 w-4 animate-bounce" /> Scrolluj dál</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormulaRevealSection;
