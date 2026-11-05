import { useEffect, useRef, useState } from "react";
import type { FlavorType } from "@/config/product-data";
import { FLAVOR_THEMES, FLAVOR_ORDER, HERO_IMAGE_SIZES } from "@/config/flavor-themes";

interface FlavorStageProps {
  active: FlavorType;
  /** true = flip + crossfade (desktop bez reduced-motion), false = okamžitá změna */
  animate: boolean;
  alt: string;
}

const FLIP_MS = 650;

const srcSet = (id: FlavorType) => {
  const { sm, lg } = FLAVOR_THEMES[id].image;
  return `${sm} 455w, ${lg} 781w`;
};

/**
 * Produktový render lahve: otočení kolem svislé osy + crossfade (bez deformace etikety).
 * Uživatel řídí změnu; žádné automatické střídání.
 */
const FlavorStage = ({ active, animate, alt }: FlavorStageProps) => {
  const [leaving, setLeaving] = useState<FlavorType | null>(null);
  const prev = useRef<FlavorType>(active);

  // Při změně příchutě nechá odcházející render dohrát animaci
  useEffect(() => {
    if (prev.current === active) return;
    const from = prev.current;
    prev.current = active;
    if (!animate) {
      setLeaving(null);
      return;
    }
    setLeaving(from);
    const t = window.setTimeout(() => setLeaving(null), FLIP_MS + 80);
    return () => window.clearTimeout(t);
  }, [active, animate]);

  // Přednačtení ostatních příchutí po první vykreslení, ať přepnutí nebliká
  useEffect(() => {
    const preload = () =>
      FLAVOR_ORDER.filter((id) => id !== active).forEach((id) => {
        const img = new Image();
        img.sizes = HERO_IMAGE_SIZES;
        img.srcset = srcSet(id);
        img.src = FLAVOR_THEMES[id].image.lg;
      });
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(preload);
    else window.setTimeout(preload, 1200);
  }, []);

  const orbitIndex = FLAVOR_ORDER.indexOf(active);

  return (
    <div className="relative mx-auto flex w-full max-w-[540px] items-center justify-center">
      {/* Orbit: tenký prstenec se třemi uzly, otáčí se o 120° při změně příchutě */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2"
        fill="none"
      >
        <g
          style={{
            transform: `rotate(${orbitIndex * -120}deg)`,
            transformOrigin: "200px 200px",
            transition: animate ? `transform ${FLIP_MS + 150}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
          }}
        >
          <circle cx="200" cy="200" r="178" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.5" />
          {FLAVOR_ORDER.map((id, i) => {
            const a = ((i * 120 - 90) * Math.PI) / 180;
            const isActive = id === active;
            return (
              <circle
                key={id}
                cx={200 + 178 * Math.cos(a)}
                cy={200 + 178 * Math.sin(a)}
                r={isActive ? 7 : 4}
                fill="currentColor"
                fillOpacity={isActive ? 1 : 0.45}
                style={{ transition: animate ? "all 400ms ease" : "none" }}
              />
            );
          })}
        </g>
      </svg>

      <FlavorAccents active={active} />

      {/* Měkký stín pod lahví */}
      <div
        aria-hidden="true"
        className="absolute bottom-[3%] left-1/2 h-8 w-[55%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-xl"
      />

      <div
        className="relative aspect-[781/1100] w-[210px] sm:w-[250px] lg:w-[320px] xl:w-[380px]"
        style={{ perspective: "1400px" }}
      >
        {leaving && (
          <img
            key={`out-${leaving}`}
            src={FLAVOR_THEMES[leaving].image.lg}
            srcSet={srcSet(leaving)}
            sizes={HERO_IMAGE_SIZES}
            alt=""
            aria-hidden="true"
            width={781}
            height={1100}
            className="absolute inset-0 h-full w-full animate-flavor-out object-contain"
            style={{ backfaceVisibility: "hidden" }}
          />
        )}
        <img
          key={`in-${active}`}
          src={FLAVOR_THEMES[active].image.lg}
          srcSet={srcSet(active)}
          sizes={HERO_IMAGE_SIZES}
          alt={alt}
          width={781}
          height={1100}
          loading="eager"
          decoding="async"
          {...({ fetchpriority: "high" } as Record<string, string>)}
          className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_28px_28px_rgba(0,0,0,0.28)] ${
            animate && leaving ? "animate-flavor-in" : ""
          }`}
          style={{ backfaceVisibility: "hidden" }}
        />
      </div>
    </div>
  );
};

/** Drobné dekorativní prvky kolem lahve, jeden set na příchuť. */
const FlavorAccents = ({ active }: { active: FlavorType }) => {
  const show = (id: FlavorType) =>
    `absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${active === id ? "opacity-100" : "opacity-0"}`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg className={show("silky")} viewBox="0 0 400 400" fill="none">
        <path d="M44 120C70 90 110 92 128 118C100 144 66 146 44 120Z" fill="#E0E561" fillOpacity="0.85" />
        <path d="M330 300C350 270 384 270 396 296C374 320 348 322 330 300Z" fill="#E0E561" fillOpacity="0.6" />
        <path d="M60 300C72 284 94 284 104 298C90 312 72 314 60 300Z" fill="#E0E561" fillOpacity="0.45" />
      </svg>
      <svg className={show("lemon")} viewBox="0 0 400 400" fill="none">
        <circle cx="62" cy="110" r="22" stroke="#3F532E" strokeWidth="3" />
        <path d="M62 88V132M40 110H84M46.5 94.5L77.5 125.5M77.5 94.5L46.5 125.5" stroke="#3F532E" strokeWidth="2" strokeLinecap="round" />
        <circle cx="344" cy="290" r="14" fill="#C56232" />
        <circle cx="330" cy="86" r="7" fill="#3F532E" fillOpacity="0.6" />
      </svg>
      <svg className={show("red")} viewBox="0 0 400 400" fill="none">
        <path d="M40 140L70 100M58 160L88 120" stroke="#E0E561" strokeWidth="5" strokeLinecap="round" />
        <circle cx="340" cy="120" r="9" fill="#C56232" />
        <circle cx="356" cy="300" r="15" fill="#E0E561" fillOpacity="0.9" />
        <circle cx="52" cy="290" r="6" fill="#FFFFFF" fillOpacity="0.7" />
      </svg>
    </div>
  );
};

export default FlavorStage;
