import { useRef, type KeyboardEvent } from "react";
import type { FlavorType } from "@/config/product-data";
import { FLAVOR_THEMES, FLAVOR_ORDER } from "@/config/flavor-themes";

interface FlavorSwitcherProps {
  active: FlavorType;
  onChange: (id: FlavorType) => void;
  label: string;
}

/**
 * Kompaktní přepínač příchutí (ARIA radiogroup, šipky + Home/End).
 * Aktivní stav používá brandový akcent aktivního světa.
 */
const FlavorSwitcher = ({ active, onChange, label }: FlavorSwitcherProps) => {
  const refs = useRef<Partial<Record<FlavorType, HTMLButtonElement | null>>>({});

  const move = (to: FlavorType) => {
    onChange(to);
    refs.current[to]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = FLAVOR_ORDER.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    move(FLAVOR_ORDER[next]);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="mx-auto grid w-full max-w-[420px] grid-cols-3 gap-1 rounded-[1.75rem] border border-[color-mix(in_srgb,currentColor_30%,transparent)] bg-[color-mix(in_srgb,currentColor_10%,transparent)] p-1 sm:flex sm:w-auto sm:max-w-none sm:rounded-full"
    >
      {FLAVOR_ORDER.map((id, i) => {
        const t = FLAVOR_THEMES[id];
        const isActive = id === active;
        return (
          <button
            key={id}
            ref={(el) => (refs.current[id] = el)}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            data-testid={`hero-flavor-${id}`}
            onClick={() => onChange(id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            style={
              isActive
                ? { backgroundColor: FLAVOR_THEMES[active].ctaBg, color: FLAVOR_THEMES[active].ctaText }
                : undefined
            }
            className={`font-label flex min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-[1.4rem] px-2 text-[11px] leading-tight transition-colors duration-300 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-[48px] sm:flex-row sm:gap-2.5 sm:rounded-full sm:px-5 sm:text-xs ${
              isActive ? "" : "hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)]"
            }`}
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-current"
              style={{ backgroundColor: t.dot }}
            />
            <span className="whitespace-nowrap">{t.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FlavorSwitcher;
