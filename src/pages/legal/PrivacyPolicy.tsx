import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO title="Ochrana osobních údajů" />
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 prose prose-slate max-w-4xl">
                <h1>Zásady ochrany osobních údajů (GDPR)</h1>
                <p className="lead">Informace o tom, jak zpracováváme vaše osobní údaje.</p>

                <h2>1. Správce osobních údajů</h2>
                <p>Správcem osobních údajů podle čl. 4 bod 7 nařízení Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (dále jen: „GDPR”) je BoostUp s.r.o. (dále jen: „správce“).</p>

                <h2>2. Jaké údaje zpracováváme</h2>
                <p>Zpracováváme osobní údaje, které nám svěříte sami, a to z následujících důvodů (pro naplnění těchto účelů):</p>
                <ul>
                    <li><strong>Vyřízení objednávky:</strong> Jméno, příjmení, adresa, e-mail, telefonní číslo.</li>
                    <li><strong>Vedení uživatelského účtu:</strong> Pokud se u nás zaregistrujete.</li>
                    <li><strong>Marketing:</strong> Zasílání newsletterů (pouze pokud jste s tím souhlasili).</li>
                </ul>

                <h2>3. Vaše práva</h2>
                <p>V souvislosti s ochranou osobních údajů máte řadu práv. Pokud budete chtít některého z těchto práv využít, prosím, kontaktujte nás na e-mailu info@boostup.cz.</p>
                <ul>
                    <li>Právo na informace</li>
                    <li>Právo na přístup k údajům</li>
                    <li>Právo na opravu</li>
                    <li>Právo na výmaz (být zapomenut)</li>
                </ul>

                <p className="text-sm text-gray-500 mt-8">Poslední aktualizace: 17. února 2026</p>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
