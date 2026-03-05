import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LegalLayout from "@/components/LegalLayout";

const CookiesPolicy = () => {
    return (
        <LegalLayout
            title="Zásady používání cookies"
            lastUpdated="25. února 2026"
            seoTitle="Zásady používání cookies | BoostUp Energy"
        >
            <p>
                Cookies jsou malé textové soubory, které do vašeho počítače, chytrého telefonu nebo
                jiného koncového zařízení ukládá prohlížeč. Umožňují mimo jiné uchovávat vaše nastavení
                (např. vkládání zboží do košíku) a usnadňují tak nakupování. Některé cookies k nám mohou
                posílat různé údaje o vašem chování na webu, aby pro vás byl při příští návštěvě ještě
                lepší.
            </p>

            <h2>1. Jaké cookies používáme</h2>
            <p className="mb-4">
                Na našem webu rozdělujeme cookies podle jejich funkce na tři základní
                kategorie. S výjimkou "technických" cookies potřebujeme pro jejich používání váš
                prokazatelný souhlas.
            </p>

            <div className="space-y-4 my-8">
                <div className="p-4 rounded-xl border border-lime/20 bg-lime/5">
                    <h3 className="font-bold text-lg text-foreground mb-2 flex justify-between items-center mt-0">
                        Nezbytné cookies (Technické)
                        <span className="text-xs font-bold text-lime uppercase tracking-widest px-2 py-1 bg-lime/20 rounded-full">
                            Vždy zapnuto
                        </span>
                    </h3>
                    <p className="text-sm mb-0">
                        Jsou naprosto klíčové pro bezpečný a fungující e-shop. K těmto záznamům
                        nesbíráme váš souhlas, jelikož díky nim se uchovává váš košík a zůstáváte
                        zabezpečeně přihlášeni do svého účtu.
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-border/50">
                    <h3 className="font-bold text-lg text-foreground mb-2 mt-0">
                        Analytické cookies
                    </h3>
                    <p className="text-sm mb-0">
                        Abychom pochopili, kolik návštěvníků na náš web chodí, na co nejčastěji klikají
                        a přes které stránky náš obchod opouští. Data jsou anonymizována.
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-border/50">
                    <h3 className="font-bold text-lg text-foreground mb-2 mt-0">
                        Marketingové cookies
                    </h3>
                    <p className="text-sm mb-0">
                        Můžou je využívat námi využívané reklamní sítě na měření kampaní a zobrazování
                        té nejrelevantnější reklamy pro vás na jiných webech a sociálních sítích.
                    </p>
                </div>
            </div>

            <h2>2. Jak mohu cookies změnit nebo vypnout?</h2>
            <p className="mb-6">
                Váš souhlas s cookies můžete kdykoliv v budoucnu jednoduše změnit, či zcela zrušit stisknutím
                následujícího tlačítka, které vymaže vaše nastavení a znovu zobrazí cookies lištu:
            </p>
            <Button
                onClick={() => {
                    localStorage.removeItem('boostup_cookie_consent');
                    window.location.reload();
                }}
                variant="outline"
                className="font-bold border-lime text-lime hover:bg-lime/10 rounded-xl px-6 h-12"
            >
                Změnit nastavení cookies
            </Button>

            <h2>3. Kontakt</h2>
            <p>
                Správcem veškerých zpracovávaných údajů je společnost BOOSTUP SUPPLEMENTS S.R.O.. Pokud
                máte jakékoliv otázky ohledně vaší ochrany osobních údajů nebo cookies, kontaktujte nás
                na adrese <strong>info@drinkboostup.cz</strong>. Další informace naleznete i v našich{' '}
                <Link to="/ochrana-osobnich-udaju" className="text-lime hover:underline">
                    Zásadách o Ochraně osobních údajů
                </Link>.
            </p>
        </LegalLayout>
    );
};

export default CookiesPolicy;
