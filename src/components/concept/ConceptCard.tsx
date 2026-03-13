import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getTextStyle } from '@/lib/textStyles';

interface ConceptCardProps {
    concept: any;
    index: number;
    SITE_CONTENT: any;
    iconMap: Record<string, any>;
    colorMap: Record<string, any>;
    onClick: () => void;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
    concept,
    index,
    SITE_CONTENT,
    iconMap,
    colorMap,
    onClick
}) => {
    const Icon = iconMap[concept.id];
    const colors = colorMap[concept.id];

    return (
        <div
            className="group relative animate-fade-up cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
            style={{ animationDelay: `${400 + index * 150}ms` }}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`${concept.title}: ${concept.subtitle}. Zjistit více.`}
        >
            {/* Intense Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.color} opacity-0 group-hover:opacity-40 rounded-3xl transition-all duration-700 blur-2xl scale-100 group-hover:scale-110`} />

            <div className="relative p-8 lg:p-10 rounded-3xl border-2 border-border hover-lift shadow-sm h-full flex flex-col group-hover:bg-foreground group-hover:text-primary-foreground transition-all duration-500 bg-card text-foreground">
                {/* Icon */}
                <div className={`w-18 h-18 rounded-2xl ${colors.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <Icon className={`w-10 h-10 ${colors.textColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-3xl md:text-4xl font-display font-black mb-2 group-hover:text-lime transition-colors" style={getTextStyle(SITE_CONTENT, `concept3b.${concept.id}.title`)}>
                    {concept.title}
                </h3>
                <p className="text-sm text-foreground group-hover:text-primary-foreground mb-4 font-bold tracking-widest uppercase" style={getTextStyle(SITE_CONTENT, `concept3b.${concept.id}.subtitle`)}>
                    {concept.subtitle}
                </p>
                <p className="flex-grow text-lg leading-relaxed text-foreground/90 group-hover:text-primary-foreground" style={getTextStyle(SITE_CONTENT, `concept3b.${concept.id}.description`)}>
                    {concept.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-8 flex items-center gap-2 text-primary group-hover:text-lime font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-sm tracking-wide">ZJISTIT VÍCE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        </div>
    );
};
