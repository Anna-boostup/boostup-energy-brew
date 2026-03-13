const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-5 w-80 h-80 bg-olive/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-10 right-5 w-[500px] h-[500px] bg-lime/15 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-terracotta/10 rounded-full blur-3xl animate-pulse-glow animation-delay-200" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-orange/10 rounded-full blur-3xl animate-pulse-glow animation-delay-600" />
    </div>
  );
};

export default HeroBackground;
