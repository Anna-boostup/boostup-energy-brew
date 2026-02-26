import LegalLayout from "@/components/LegalLayout";

const ShippingAndPayment = () => {
    return (
        <LegalLayout title="Doprava a platba" lastUpdated="24. února 2026" seoTitle="Doprava a platba | BoostUp Energy">
            <div className="prose prose-invert max-w-none">
                <p className="lead">
                    Zde najdete veškeré informace o možnostech dopravy a platebních metodách. Naším cílem je doručit vaši objednávku co nejrychleji a nejbezpečněji.
                </p>

                <h2>1. Možnosti dopravy</h2>
                <p>Spolupracujeme s prověřenými dopravci, abychom zajistili spolehlivé doručení vašeho balíku v rámci celé České republiky.</p>

                <h3>Zásilkovna (Packeta) - Doručení na výdejní místo / Z-BOX</h3>
                <ul>
                    <li><strong>Cena dopravy (ČR):</strong> 79 Kč (Při objednávce nad 1500 Kč je doprava <strong>zdarma</strong>)</li>
                    <li><strong>Doba doručení:</strong> Obvykle dodáno do 1-2 pracovních dnů od odeslání.</li>
                    <li><strong>Výhody:</strong> Více než 9000 výdejních míst a Z-BOXů. Široká flexibilita vyzvednutí.</li>
                </ul>

                <h3>Zásilkovna - Doručení na adresu (Kurýr)</h3>
                <ul>
                    <li><strong>Cena dopravy (ČR):</strong> 109 Kč</li>
                    <li><strong>Doba doručení:</strong> Obvykle dodáno do 1-2 pracovních dnů od odeslání.</li>
                    <li><strong>Výhody:</strong> Balíček doručen kurýrem pohodlně přímo k vám domů.</li>
                </ul>

                <h2>2. Možnosti platby</h2>
                <p>Pro vaši maximální bezpečnost a pohodlí využíváme zabezpečenou platební bránu GoPay (ověřená ČNB). Nabízíme následující způsoby platby:</p>

                <h3>Platba kartou online (Apple Pay, Google Pay, Visa/Mastercard)</h3>
                <ul>
                    <li><strong>Cena:</strong> Zdarma</li>
                    <li><strong>Zpracování:</strong> Okamžité</li>
                    <li><strong>Popis:</strong> Nejrychlejší a nejoblíbenější způsob. Peníze jsou připsány ihned a objednávku rovnou odesíláme do expedice. Využít můžete i platbu na jedno kliknutí přes Apple Pay a Google Pay.</li>
                </ul>

                <h3>Okamžitý bankovní převod přes platební bránu</h3>
                <ul>
                    <li><strong>Cena:</strong> Zdarma</li>
                    <li><strong>Zpracování:</strong> Okamžité</li>
                    <li><strong>Popis:</strong> Rychlý převod pomocí bankovních tlačítek (Fio, Česká spořitelna, Komerční banka, ČSOB, Air Bank, Raiffeisenbank, mBank, MONETA). Provedete úhradu rovnou ve svém internetovém bankovnictví a my obdržíme potvrzení okamžitě.</li>
                </ul>

                <h3>Standardní bankovní převod (Předem na účet)</h3>
                <ul>
                    <li><strong>Cena:</strong> Zdarma</li>
                    <li><strong>Zpracování:</strong> 1-3 pracovní dny</li>
                    <li><strong>Popis:</strong> Po odeslání objednávky vám zašleme e-mail s platebními údaji a QR kódem. Zboží odesíláme až po připsání částky na náš účet.</li>
                    <li><strong>Údaje pro platbu:</strong>
                        <ul className="list-none pl-0 mt-2">
                            <li>Číslo účtu: 6654376004/5500 (Raiffeisenbank)</li>
                            <li>Zpráva pro příjemce: Vaše jméno a příjmení</li>
                            <li>Variabilní symbol: Číslo vaší objednávky</li>
                        </ul>
                    </li>
                </ul>

                <h2>3. Zpracování a expedice objednávky</h2>
                <p>Zavazujeme se k odeslání vaší objednávky v co nejkratším možném čase. Vážíme si vašeho času.</p>
                <ul>
                    <li><strong>Expedice ve stejný den:</strong> Objednávky s rychlou metodou platby (kartou/Apple Pay/rychlý převod) přijaté do <strong>12:00</strong> hodin expedujeme <strong>v tentýž pracovní den</strong>.</li>
                    <li>Objednávky přijaté po 12:00 odesíláme následující pracovní den.</li>
                    <li>O stavu objednávky a přidělení trasovacího čísla (tracking link) jste vždy informováni prostřednictvím e-mailu.</li>
                </ul>
            </div>
        </LegalLayout>
    );
};

export default ShippingAndPayment;
