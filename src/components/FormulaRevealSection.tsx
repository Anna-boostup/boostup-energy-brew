import { useEffect, useRef, useState } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { useMediaQuery, REDUCED_MOTION_QUERY } from "@/hooks/useMediaQuery";
import { FLAVOR_THEMES } from "@/config/flavor-themes";

const layers = [
  { title: "ZŮSTAT V TEMPU", text: "Plynulá energie místo krátkého impulzu.", ingredients: "Guarana · přírodní kofein", className: "bg-lime text-olive", vector: "translate(-55%, -105%) rotate(-7deg)" },
  { title: "UDRŽET HLAVU ČISTOU", text: "Když potřebuješ dokončit, ne jen začít.", ingredients: "L-theanin · vitamíny B", className: "bg-olive text-lime", vector: "translate(48%, -38%) rotate(6deg)" },
  { title: "USTÁT TLAK", text: "Pro dny plné změn, termínů a rozhodování.", ingredients: "Ashwagandha · rhodiola · meduňka", className: "bg-orange text-cream", vector: "translate(-52%, 38%) rotate(6deg)" },
  { title: "NESPOLEHNOUT SE NA NÁHODU", text: "Promyšlené složení pro dlouhý den.", ingredients: "Hořčík · draslík · vitamín C", className: "bg-terracotta text-cream", vector: "translate(50%, 105%) rotate(-7deg)" },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const FormulaRevealSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const image = FLAVOR_THEMES.silky.image.lg;

  useEffect(() => {
    if (reducedMotion) return;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      setProgress(clamp(-rect.top / Math.max(1, rect.height - window.innerHeight)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [reducedMotion]);

  const reveal = reducedMotion ? 1 : clamp((progress - 0.16) / 0.56);
  const activeLayer = reducedMotion ? 4 : Math.min(4, Math.floor(reveal * 4) + 1);

  return (
    <section id="jak-funguje" ref={sectionRef} className="relative min-h-[230vh] bg-olive text-cream">
      <div className="sticky top-0 flex min-h-svh items-center overflow-hidden py-20">
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[min(68vw,850px)] w-[min(68vw,850px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/15 blur-[100px]" />
        <div className="container relative z-10 mx-auto grid items-center gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-5">
          <div className="text-center lg:col-span-4 lg:text-left xl:pl-8">
            <p className="font-label mb-5 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-[10px] text-olive sm:text-xs"><Sparkles className="h-3.5 w-3.5" /> JAK TO FUNGUJE</p>
            <h2 className="text-balance font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-5xl xl:text-6xl">PROČ JSME PŘI VÝVOJI NEŘEŠILI JEN MNOŽSTVÍ KOFEINU?</h2>
            <p className="mt-6 max-w-md text-base font-semibold leading-relaxed text-cream/75 lg:text-lg">Protože dlouhý den nevyřeší jeden rychlý impulz.</p>
          </div>

          <div className="relative order-first mx-auto h-[360px] w-full max-w-[330px] lg:order-none lg:col-span-4 lg:h-[600px] lg:max-w-[440px]" aria-label="BoostUp shot se při scrollování rozkládá do čtyř vrstev složení">
            <div className="absolute left-1/2 top-1/2 h-[330px] w-[234px] -translate-x-1/2 -translate-y-1/2 lg:h-[510px] lg:w-[362px]" style={{ transform: `translate(-50%, calc(-50% + ${(0.34 - progress) * 74}px))`, transition: "transform 80ms linear" }}>
              {layers.map((layer, index) => {
                const start = index * 0.2;
                const segmentReveal = reducedMotion ? 1 : clamp((reveal - start) / 0.2);
                const clipTop = index * 25;
                const clipBottom = 75 - index * 25;
                return (
                  <img key={layer.title} src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_28px_24px_rgba(0,0,0,0.36)]" style={{ clipPath: `inset(${clipTop}% 0 ${clipBottom}% 0)`, transform: `translate(${segmentReveal * (index % 2 ? 34 : -34)}%, ${segmentReveal * (index < 2 ? -31 : 31)}%) rotate(${segmentReveal * (index % 2 ? 5 : -5)}deg)`, transition: "transform 80ms linear" }} />
                );
              })}
            </div>
            <p className={`pointer-events-none absolute bottom-0 left-1/2 w-max -translate-x-1/2 font-label text-[10px] text-lime transition-opacity duration-300 ${reveal > 0.12 ? "opacity-0" : "opacity-80"}`}>Scrolluj a objev složení</p>
          </div>

          <div className="lg:col-span-4">
            <div className="grid gap-3">
              {layers.map((layer, index) => {
                const isActive = index < activeLayer;
                return (
                  <article key={layer.title} className={`rounded-[1.5rem] p-5 transition-all duration-500 ${layer.className} ${isActive ? "translate-x-0 opacity-100" : "translate-x-10 opacity-20"}`}>
                    <p className="font-label text-xs">0{index + 1}</p>
                    <h3 className="mt-2 font-display text-xl font-black tracking-[-0.03em] sm:text-2xl">{layer.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-snug opacity-85">{layer.text}</p>
                    <p className="mt-3 border-t border-current/20 pt-3 text-xs font-bold uppercase tracking-wide">{layer.ingredients}</p>
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
