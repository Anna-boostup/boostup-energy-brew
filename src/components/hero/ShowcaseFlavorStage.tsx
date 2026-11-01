import { useEffect, useRef, useState } from "react";
import flavorsImage from "@/assets/boostup-four-flavors.png";
import { SHOWCASE_FLAVORS, SHOWCASE_FLAVOR_ORDER, type ShowcaseFlavorId } from "@/config/showcase-flavors";

interface ShowcaseFlavorStageProps {
  active: ShowcaseFlavorId;
  animate: boolean;
  alt: string;
  className?: string;
}

const FLIP_MS = 650;

const Crop = ({ id, alt, className = "" }: { id: ShowcaseFlavorId; alt: string; className?: string }) => {
  const crop = SHOWCASE_FLAVORS[id].crop;
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img src={flavorsImage} alt={alt} className="absolute h-[200%] w-[200%] max-w-none" style={{ left: crop.x, top: crop.y }} />
    </div>
  );
};

const ShowcaseFlavorStage = ({ active, animate, alt, className = "" }: ShowcaseFlavorStageProps) => {
  const [leaving, setLeaving] = useState<ShowcaseFlavorId | null>(null);
  const previous = useRef(active);
  const orbitIndex = SHOWCASE_FLAVOR_ORDER.indexOf(active);

  useEffect(() => {
    if (previous.current === active) return;
    const from = previous.current;
    previous.current = active;
    if (!animate) return;
    setLeaving(from);
    const timeout = window.setTimeout(() => setLeaving(null), FLIP_MS + 80);
    return () => window.clearTimeout(timeout);
  }, [active, animate]);

  return (
    <div className={`relative mx-auto w-full max-w-[560px] ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 400 300" className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%] max-w-none" fill="none">
        <g style={{ transform: `rotate(${orbitIndex * -90}deg)`, transformOrigin: "200px 150px", transition: animate ? "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)" : "none" }}>
          <ellipse cx="200" cy="150" rx="184" ry="132" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="2 7" />
          {SHOWCASE_FLAVOR_ORDER.map((id, index) => {
            const angle = ((index * 90 - 90) * Math.PI) / 180;
            return <circle key={id} cx={200 + 184 * Math.cos(angle)} cy={150 + 132 * Math.sin(angle)} r={id === active ? 7 : 4} fill="currentColor" fillOpacity={id === active ? 1 : 0.45} />;
          })}
        </g>
      </svg>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 bg-black/15 shadow-[0_28px_40px_rgba(0,0,0,0.26)]">
        {leaving && <Crop id={leaving} alt="" className="animate-flavor-out" />}
        <Crop id={active} alt={alt} className={animate && leaving ? "animate-flavor-in" : ""} />
      </div>
    </div>
  );
};

export { Crop };
export default ShowcaseFlavorStage;
