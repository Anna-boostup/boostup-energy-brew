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
                <li>Bezhotovostně převodem na účet prodávajícího</li>
                <li>Bezhotovostně platební kartou ( Stripe / GoPay / ComGate )</li>
                <li>Dobírkou v místě určení při převzetí zboží (Zásilkovna / Kurýr)</li>
            </ul>
        </LegalLayout>
    );
};

export default TermsOfService;
