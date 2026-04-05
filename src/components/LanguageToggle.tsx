import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

interface LanguageToggleProps {
    className?: string;
}

const LanguageToggle = ({ className }: LanguageToggleProps) => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className={className}
            aria-label={language === 'cs' ? "Switch to English" : "Přepnout do češtiny"}
            title={language === 'cs' ? "Switch to English" : "Přepnout do češtiny"}
        >
            {language === 'cs' ? (
                <span className="flex items-center gap-1 text-sm font-medium">
                    <span>🇨🇿</span>
                    <span>CZ</span>
                </span>
            ) : (
                <span className="flex items-center gap-1 text-sm font-medium">
                    <span>🇬🇧</span>
                    <span>EN</span>
                </span>
            )}
        </Button>
    );
};

export default LanguageToggle;
