import LegalLayout from "@/components/LegalLayout";

const PrivacyPolicy = () => {
    return (
        <LegalLayout title="Ochrana osobních údajů" lastUpdated="19. února 2026" seoTitle="Ochrana osobních údajů | BoostUp Energy">
            <div className="prose prose-invert max-w-none">
                <p className="lead">
                    Vaše soukromí je pro nás prioritou. Tento dokument vysvětluje, jak sbíráme, používáme a chráníme vaše osobní údaje v souladu s nařízením GDPR.
                </p>

                <h2>1. Správce osobních údajů</h2>
                <p>
                    Správcem osobních údajů je společnost <strong>BOOSTUP ENERGY S.R.O.</strong>, se sídlem Lidická 700/19, Brno, IČO: 24045560 (dále jen „správce“). Kontaktní e-mail: <a href="mailto:hello@boostup.cz">hello@boostup.cz</a>.
                </p>

                <h2>2. Účely a právní základ zpracování</h2>
                <p>Osobní údaje zpracováváme pro následující účely:</p>
                <ul>
                    <li><strong>Plnění smlouvy:</strong> Zpracování vaší objednávky, doručení zboží a vyřízení případných reklamací. (Právní základ: plnění smlouvy).</li>
                    <li><strong>Uživatelský účet:</strong> Správa vašeho profilu a historie nákupů. (Právní základ: plnění smlouvy).</li>
                    <li><strong>Zákonné povinnosti:</strong> Vedení účetnictví a plnění daňových povinností. (Právní základ: plnění zákonné povinnosti).</li>
                    <li><strong>Marketing:</strong> Zasílání obchodních sdělení, pokud jste se přihlásili k odběru. (Právní základ: oprávněný zájem nebo souhlas).</li>
                </ul>

                <h2>3. Rozsah zpracovávaných údajů</h2>
                <p>Zpracováváme tyto kategorie údajů:</p>
                <ul>
                    <li>Identifikační údaje (jméno, příjmení)</li>
                    <li>Kontaktní údaje (e-mail, telefon, doručovací a fakturační adresa)</li>
                    <li>Platební údaje (historie plateb, nikoliv údaje o kartě – ty spravuje platební brána)</li>
                    <li>Technické údaje (IP adresa, cookies – pokud jsou povoleny)</li>
                </ul>

                <h2>4. Příjemci osobních údajů</h2>
                <p>Vaše údaje předáváme pouze těm subjektům, které jsou nezbytné pro vyřízení vaší objednávky:</p>
                <ul>
                    <li>Dopravní společnosti (Zásilkovna / Packeta)</li>
                    <li>Poskytovatelé platebních služeb (GoPay / Stripe)</li>
                    <li>Účetní a daňoví poradci</li>
                    <li>Správci IT infrastruktury a e-shopového řešení</li>
                </ul>

                <h2>5. Doba uchování údajů</h2>
                <p>
                    Údaje uchováváme po dobu nezbytnou pro plnění práv a povinností vyplývajících ze smluvního vztahu (zpravidla 10 let pro účely fakturace dle zákona o DPH) nebo do odvolání vašeho souhlasu.
                </p>

                <h2>6. Vaše práva</h2>
                <p>Jako subjekt údajů máte následující práva:</p>
                <ul>
                    <li>Právo na <strong>přístup</strong> k vašim osobním údajům.</li>
                    <li>Právo na <strong>opravu</strong> nebo doplnění.</li>
                    <li>Právo na <strong>výmaz</strong> (pokud již nejsou údaje potřeba pro zákonné účely).</li>
                    <li>Právo na <strong>omezení</strong> zpracování.</li>
                    <li>Právo na <strong>přenositelnost</strong> údajů.</li>
                    <li>Právo <strong>vznést námitku</strong> proti zpracování.</li>
                    <li>Právo podat stížnost u Úřadu pro ochranu osobních údajů.</li>
                </ul>

                <h2>7. Zabezpečení dat</h2>
                <p>
                    Uplatňujeme veškerá nezbytná technická a organizační opatření k ochraně vašich dat před neoprávněným přístupem, změnou nebo ztrátou. Komunikace s naším webem je šifrována pomocí SSL certifikátu.
                </p>

                <p className="mt-12 text-sm text-muted-foreground italic">
                    Tyto podmínky jsou platné od 19. února 2026.
                </p>
            </div>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
