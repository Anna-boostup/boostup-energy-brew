import { useContent } from "@/context/ContentContext";
import { Zap, Clock, Shield, Leaf, Sparkles } from "lucide-react";
import { getTextStyle, isBadgeVisible } from "@/lib/textStyles";

const MissionSection = () => {
  const { content: SITE_CONTENT } = useContent();
  const content = SITE_CONTENT.mission;

  const iconMap: Record<string, any> = {
    "Čistá energie": Zap,
    "Dlouhotrvající": Clock,
    "Přírodní složení": Leaf,
    "Bez kompromisů": Shield
  };

  const iconBgMap: Record<string, string> = {
    "Čistá energie": "bg-lime",
    "Dlouhotrvající": "bg-orange",
    "Přírodní složení": "bg-olive-light",
    "Bez kompromisů": "bg-terracotta"
  };

  return (
    <section id="mise" className="py-28 bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-lime/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-terracotta/10 rounded-full blur-3xl animate-pulse-glow animation-delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-olive/5 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          {isBadgeVisible(SITE_CONTENT, 'mission.badge') && (
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-olive text-primary-foreground rounded-full text-sm font-bold mb-6 tracking-wide animate-fade-up shadow-sm border border-lime/20"
              style={getTextStyle(SITE_CONTENT, 'mission.badge')}>
              <Sparkles className="w-4 h-4" />
              {content.badge}
            </span>
          )}

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-8 leading-tight animate-fade-up animation-delay-100">
            <span style={getTextStyle(SITE_CONTENT, 'mission.headline.part1')}>{content.headline.part1}</span>
            <span className="block text-lime" style={getTextStyle(SITE_CONTENT, 'mission.headline.highlight')}>{content.headline.highlight}</span>
          </h2>

          <div className="max-w-3xl mx-auto space-y-6 text-lg md:text-xl text-primary-foreground leading-relaxed animate-fade-up animation-delay-200">
            {(content.paragraphs || []).map((text, i) => (
              <p key={i} style={getTextStyle(SITE_CONTENT, `mission.paragraph.${i}`)} dangerouslySetInnerHTML={{ __html: text.replace("Káva už nepomáhá", '<span class="text-lime font-bold">Káva už nepomáhá</span>').replace("Chtěli jsme to změnit.", '<span class="text-primary-foreground font-bold"> Chtěli jsme to změnit.</span>').replace("BoostUp", '<span class="text-orange font-black">BoostUp</span>') }} />
            ))}
          </div>
        </div>

        {/* Features Grid - Large stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {(content.features || []).map((feature, index) => {
            const Icon = iconMap[feature.title] || Zap;
            const textColor = feature.color === 'bg-lime' || feature.color === 'bg-orange' ? 'text-foreground' : 'text-cream';

            return (
              <div
                key={feature.title}
                className="relative group animate-fade-up cursor-default"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                {/* Intense Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-40 rounded-3xl transition-all duration-700 blur-2xl scale-100 group-hover:scale-110`} />

                <div className="relative p-6 lg:p-8 rounded-3xl bg-primary-foreground/5 border-2 border-primary-foreground/10 hover-lift h-full flex flex-col items-center text-center backdrop-blur-md">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${iconBgMap[feature.title] || feature.color} ${textColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg border border-primary-foreground/10`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Stat */}
                  <div className="text-4xl lg:text-5xl font-black text-lime mb-2 group-hover:scale-110 transition-transform duration-300">
                    {feature.stat}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-primary-foreground mb-2 group-hover:text-lime transition-colors">{feature.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-primary-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
