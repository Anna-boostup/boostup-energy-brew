import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const CookiesPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 md:py-12 mt-16">
                <Button variant="ghost" asChild className="mb-8 hover:bg-white/5">
                    <Link to="/" className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Zpět na hlavní stránku
                    </Link>
                </Button>

                <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-10 space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-black tracking-wider uppercase mb-4 text-primary">
                            Zásady používání cookies
                        </h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                            Datum poslední aktualizace: 25. 2. 2024
                        </p>
                    </div>

                    <div className="space-y-8 text-foreground/80 leading-relaxed">
                        <section>
                            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-foreground mb-4">
                                1. Co jsou cookies
                            </h2>
                            <p>
                                Cookies jsou malé textové soubory, které do vašeho počítače, chytrého telefonu nebo
                                jiného koncového zařízení ukládá prohlížeč. Umožňují mimo jiné uchovávat vaše nastavení
                                (např. vkládání zboží do košíku) a usnadňují tak nakupování. Některé cookies k nám mohou
                                posílat různé údaje o vašem chování na webu, aby pro vás byl při příští návštěvě ještě
                                lepší.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-foreground mb-4">
                                2. Jaké cookies používáme
                            </h2>
                            <p className="mb-4">
                                Na našem webu `drinkboostup.cz` rozdělujeme cookies podle jejich funkce na tři základní
                                kategorie. S výjimkou "technických" cookies potřebujeme pro jejich používání váš
                                prokazatelný souhlas.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                                    <h3 className="font-bold text-lg text-foreground mb-2 flex justify-between items-center">
                                        Nezbytné cookies (Technické)
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest px-2 py-1 bg-primary/20 rounded-full">
                                            Vždy zapnuto
                                        </span>
                                    </h3>
                                    <p className="text-sm">
                                        Jsou naprosto klíčové pro bezpečný a fungující e-shop. K těmto záznamům
                                        nesbíráme váš souhlas, jelikož díky nim se uchovává váš košík a zůstáváte
                                        zabezpečeně přihlášeni do svého účtu. Na tyto soubory je náš e-shop přímo
                                        odkázán.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border border-border/50">
                                    <h3 className="font-bold text-lg text-foreground mb-2 flex justify-between items-center">
                                        Analytické cookies
                                    </h3>
                                    <p className="text-sm">
                                        Abychom pochopili, kolik návštěvníků na náš web chodí, na co nejčastěji klikají
                                        a přes které stránky náš obchod opouští. K těmto účelům obvykle používáme
                                        marketingové nástroje třetích stran (např. Google Analytics). Data jsou u nás a
                                        v analytických portálech chráněna v anonymní spojené podobě a nedají se přiřadit
                                        k jedné konkrétní osobě.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl border border-border/50">
                                    <h3 className="font-bold text-lg text-foreground mb-2 flex justify-between items-center">
                                        Marketingové cookies
                                    </h3>
                                    <p className="text-sm">
                                        Můžou je využívat námi využívané reklamní sítě na měření kampaní a zobrazování
                                        té nejrelevantnější reklamy pro vás na jiných webech a sociálních sítích. Jde
                                        často o skripty Meta, Seznam Sklik apod.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-foreground mb-4">
                                3. Jak mohu cookies změnit nebo vypnout?
                            </h2>
                            <p className="mb-4">
                                Váš souhlas s cookies, který jste udělil(a) pomocí informační lišty po příchodu na náš
                                web, můžete samozřejmě kdykoliv v budoucnu jednoduše změnit, či zcela zrušit stisknutím
                                následujícího tlačítka:
                            </p>
                            <Button
                                onClick={() => {
                                    localStorage.removeItem('boostup_cookie_consent');
                                    window.location.reload();
                                }}
                                variant="outline"
                                className="font-bold border-primary text-primary hover:bg-primary/10"
                            >
                                Zrušit všechny souhlasy a otevřít nastavení
                            </Button>
                        </section>

                        <section>
                            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wide text-foreground mb-4">
                                4. Kontakt na provozovatele
                            </h2>
                            <p>
                                Správcem veškerých zpracovávaných údajů je společnost BOOSTUP SUPPLEMENTS S.R.O.. Pokud
                                máte jakékoliv otázky ohledně vaší ochrany osobních údajů nebo cookies, kontaktujte nás
                                na adrese <strong>info@drinkboostup.cz</strong>. Další informace naleznete i v našich{' '}
                                <Link to="/ochrana-osobnich-udaju" className="text-primary hover:underline">
                                    Zásadách o Ochraně osobních údajů
                                </Link>
                                .
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CookiesPolicy;
