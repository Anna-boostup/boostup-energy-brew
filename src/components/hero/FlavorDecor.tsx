import type { FlavorType } from "@/config/product-data";
import { FLAVOR_THEMES, FLAVOR_ORDER } from "@/config/flavor-themes";

interface FlavorDecorProps {
  active: FlavorType;
}

const layer = (on: boolean) =>
  `absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`;

/**
 * Atmosféra hero pozadí. Všechny tři světy jsou v DOM a prolínají se přes opacity,
 * takže změna příchutě je plynulá a při reduced-motion okamžitá.
 */
const FlavorDecor = ({ active }: FlavorDecorProps) => {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLAVOR_ORDER.map((id) => {
        const t = FLAVOR_THEMES[id];
        return (
          <div key={id} className={layer(active === id)}>
            {id === "silky" && (
              <svg className="h-full w-full" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" fill="none">
                <path d="M1020 -40C1250 80 1380 300 1330 560C1100 520 960 330 1020 -40Z" fill={t.decorative} />
                <path d="M780 880C640 700 700 470 930 360C1010 600 940 790 780 880Z" fill={t.decorative} opacity="0.75" />
                <path d="M-60 560C80 420 280 420 380 520C260 660 90 700 -60 560Z" fill={t.decorative} opacity="0.7" />
                <path d="M1020 -40C1090 150 1130 330 1330 560" stroke={t.text} strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
                <path d="M930 360C960 500 1000 640 1060 800" stroke={t.text} strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
                <path d="M-40 560C100 540 260 560 380 520" stroke={t.text} strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {id === "lemon" && (
              <svg className="h-full w-full" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" fill="none">
                <defs>
                  <radialGradient id="lemon-glow" cx="0.74" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.65" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="1440" height="820" fill="url(#lemon-glow)" />
                <circle cx="1060" cy="410" r="330" fill={t.decorative} fillOpacity="0.55" />
                <path d="M1060 80A330 330 0 0 1 1390 410" stroke="#3F532E" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
                <path d="M1060 20A390 390 0 0 1 1450 410" stroke="#3F532E" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
                <path d="M730 410A330 330 0 0 0 1060 740" stroke="#3F532E" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
                <path d="M670 410A390 390 0 0 0 1060 800" stroke="#3F532E" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
                <path d="M-40 700A260 260 0 0 1 220 440" stroke="#3F532E" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {id === "red" && (
              <svg className="h-full w-full" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" fill="none">
                <defs>
                  <pattern id="red-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.6" fill="#FFFFFF" fillOpacity="0.22" />
                  </pattern>
                </defs>
                <rect x="820" y="0" width="620" height="820" fill="url(#red-dots)" />
                <g stroke={t.decorative} strokeWidth="34" strokeLinecap="round">
                  <path d="M760 880L1180 -60" />
                  <path d="M930 900L1350 -40" opacity="0.8" />
                  <path d="M1100 920L1480 70" opacity="0.6" />
                </g>
                <g stroke="#E0E561" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round">
                  <path d="M690 760L840 420" />
                  <path d="M730 800L880 460" />
                </g>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FlavorDecor;
