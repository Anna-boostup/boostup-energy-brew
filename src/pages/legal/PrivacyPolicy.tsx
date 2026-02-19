import LegalLayout from "@/components/LegalLayout";

const PrivacyPolicy = () => {
    return (
        <LegalLayout title="Ochrana osobních údajů" lastUpdated="17. února 2026" seoTitle="Ochrana osobních údajů | GDPR">
            <h2>1. Správce osobních údajů</h2>
            <p>
                Správcem osobních údajů podle čl. 4 bod 7 nařízení Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob
                v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (dále jen: „GDPR”) je <strong>BoostUp Supplements s.r.o.</strong>
                (dále jen: „správce“).
            </p>

            <h2>2. Jaké údaje zpracováváme</h2>
            <p>
                Zpracováváme osobní údaje, které nám svěříte sami, a to z následujících důvodů (pro naplnění těchto účelů):
            </p>
            <ul>
                <li><strong>Vyřízení objednávky:</strong> Jméno, příjmení, adresa, e-mail, telefonní číslo. Tyto údaje jsou nezbytné pro plnění smlouvy.</li>
                <li><strong>Vedení uživatelského účtu:</strong> Pokud se u nás zaregistrujete, uchováváme vaše přihlašovací údaje a historii objednávek.</li>
                <li><strong>Marketing:</strong> Zasílání newsletterů a obchodních sdělení (pouze pokud jste s tím výslovně souhlasili).</li>
            </ul>

            <h2>3. Vaše práva</h2>
            <p>
                V souvislosti s ochranou osobních údajů máte řadu práv. Pokud budete chtít některého z těchto práv využít,
                prosím, kontaktujte nás na e-mailu <a href="mailto:info@boostup.cz">info@boostup.cz</a>.
            </p>
            <ul>
                <li><strong>Právo na informace:</strong> Máte právo vědět, jaké údaje o vás zpracováváme.</li>
                <li><strong>Právo na přístup k údajům:</strong> Můžete si vyžádat kopii všech svých osobních údajů.</li>
                <li><strong>Právo na opravu:</strong> Pokud jsou vaše údaje nepřesné, máte právo na jejich opravu.</li>
                <li><strong>Právo na výmaz (být zapomenut):</strong> Můžete požádat o smazání vašich údajů, pokud neexistuje zákonný důvod pro jejich uchování (např. fakturace).</li>
            </ul>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
