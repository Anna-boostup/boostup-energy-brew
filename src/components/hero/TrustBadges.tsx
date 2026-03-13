interface TrustBadgesProps {
  badges: string[];
  onSelectIngredient: (key: string) => void;
  setIsDialogOpen: (open: boolean) => void;
}

const TrustBadges = ({ badges, onSelectIngredient, setIsDialogOpen }: TrustBadgesProps) => {
  const colors = ["bg-olive", "bg-lime", "bg-terracotta", "bg-orange"];
  const detailKeys = ['stimulants', 'electrolytes', 'adaptogens', 'vitamins'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 sm:gap-6 justify-center items-center animate-fade-up animation-delay-800 relative z-30">
      {(badges || []).map((badge, idx) => {
        const key = detailKeys[idx % detailKeys.length];

        return (
          <button
            key={badge}
            onClick={() => {
              onSelectIngredient(key);
              setIsDialogOpen(true);
            }}
            aria-label={`Zjistit více o ${badge}`}
            className="flex items-center gap-3 px-6 py-4 bg-background/90 backdrop-blur-sm rounded-2xl sm:rounded-full shadow-card hover:shadow-lg hover:scale-105 transition-all cursor-pointer border border-transparent hover:border-primary/20 group"
          >
            <div className={`w-4 h-4 rounded-full ${colors[idx % colors.length]} animate-pulse group-hover:scale-125 transition-transform`} style={{ animationDelay: `${idx * 200}ms` }} />
            <span className="text-sm font-bold text-foreground">{badge}</span>
            <span className="ml-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-black" aria-hidden="true">ZJISTIT VÍCE</span>
          </button>
        );
      })}
    </div>
  );
};

export default TrustBadges;
