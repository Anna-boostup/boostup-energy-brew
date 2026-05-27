import LegalLayout from "@/components/LegalLayout";

const TermsOfService = () => {
    return (
        <LegalLayout title="Všeobecné obchodní podmínky" lastUpdated="17. února 2026">
            <h2>1. Úvodní ustanovení</h2>
            <p>
                Tyto obchodní podmínky (dále jen „obchodní podmínky“) obchodní společnosti <strong>BoostUp Supplements s.r.o.</strong>,
                se sídlem Chaloupkova 3002/1a, Královo Pole, 612 00 Brno, identifikační číslo: 24045560, zapsané v obchodním rejstříku vedeném u Krajského soudu v Brně, oddíl C, vložka 148762 (dále jen „prodávající“)
                upravují v souladu s ustanovením § 1751 odst. 1 zákona č. 89/2012 Sb., občanský zákoník (dále jen „občanský zákoník“)
                vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy (dále jen „kupní smlouva“)
                uzavírané mezi prodávajícím a jinou fyzickou osobou (dále jen „kupující“) prostřednictvím internetového obchodu prodávajícího.
            </p>

            <h2>2. Uživatelský účet</h2>
            <p>
                Na základě registrace kupujícího provedené na webové stránce může kupující přistupovat do svého uživatelského rozhraní.
                Ze svého uživatelského rozhraní může kupující provádět objednávání zboží (dále jen „uživatelský účet“).
                Kupující může provádět objednávání zboží též bez registrace přímo z webového rozhraní obchodu.
            </p>

            <h2>3. Uzavření kupní smlouvy</h2>
            <p>
                Veškerá prezentace zboží umístěná ve webovém rozhraní obchodu je informativního charakteru a prodávající není povinen
                uzavřít kupní smlouvu ohledně tohoto zboží. Ustanovení § 1732 odst. 2 občanského zákoníku se nepoužije.
            </p>

            <h2>4. Cena zboží a platební podmínky</h2>
            <p>
                Cenu zboží a případné náklady spojené s dodáním zboží dle kupní smlouvy může kupující uhradit prodávajícímu následujícími způsoby:
            </p>
            <ul>
                <li>Bezhotovostně převodem na účet prodávajícího (Raiffeisenbank)</li>
                <li>Bezhotovostně platební kartou přes bránu GoPay (včetně Apple Pay a Google Pay)</li>
                <li>Okamžitým bankovním převodem přes bránu GoPay</li>
            </ul>

            <h2>5. Přeprava a dodání zboží</h2>
            <p>
                Náklady na poštovné a balné hradí kupující dle zvoleného způsobu dopravy (Zásilkovna na výdejní místo nebo na adresu).
                Při objednávce nad 1500 Kč je doprava zdarma. Zboží, které je skladem, expedujeme zpravidla do 24 hodin od přijetí
                platby nebo potvrzení objednávky.
            </p>

            <h2>6. Odstoupení od kupní smlouvy</h2>
            <p>
                Kupující má právo odstoupit od kupní smlouvy ve lhůtě 14 dnů od převzetí zboží. Odstoupení od kupní smlouvy
                musí být prodávajícímu odesláno ve výše uvedené lhůtě e-mailem na <a href="mailto:info@drinkboostup.cz">info@drinkboostup.cz</a> (v kopii na <a href="mailto:fakturace@drinkboostup.cz">fakturace@drinkboostup.cz</a>).
                Zboží musí být vráceno nepoužité a v původním neporušeném obalu (vzhledem k povaze doplňků stravy).
            </p>

            <h2>7. Práva z vadného plnění (Reklamace)</h2>
            <p>
                Práva a povinnosti smluvních stran ohledně práv z vadného plnění se řídí příslušnými obecně závaznými právními předpisy.
                Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady a je v souladu s popisem.
            </p>

            <h2>8. Ochrana osobních údajů</h2>
            <p>
                Ochrana osobních údajů kupujícího, který je fyzickou osobou, je poskytována v souladu s nařízením GDPR.
                Podrobnosti jsou uvedeny v samostatném dokumentu <a href="/ochrana-osobnich-udaju">Zásady ochrany osobních údajů</a>.
            </p>

            <h2>9. Závěrečná ustanovení</h2>
            <p>
                Pokud vztah založený kupní smlouvou obsahuje mezinárodní (zahraniční) prvek, pak strany sjednávají, že vztah se řídí českým právem.
                Tyto obchodní podmínky nabývají účinnosti dne 24. února 2026.
            </p>
        </LegalLayout>
    );
};

export default TermsOfService;
