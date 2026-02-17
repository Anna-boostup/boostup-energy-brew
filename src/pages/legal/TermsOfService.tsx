import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO title="Obchodní podmínky" />
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 prose prose-slate max-w-4xl">
                <h1>Všeobecné obchodní podmínky</h1>
                <p className="lead">Tyto obchodní podmínky platí pro nákup v internetovém obchodě BoostUp Energy.</p>

                <h2>1. Úvodní ustanovení</h2>
                <p>Tyto obchodní podmínky (dále jen „obchodní podmínky“) obchodní společnosti BoostUp s.r.o., se sídlem [Vaše Adresa], identifikační číslo: [Vaše IČO], zapsané v obchodním rejstříku (dále jen „prodávající“) upravují v souladu s ustanovením § 1751 odst. 1 zákona č. 89/2012 Sb., občanský zákoník (dále jen „občanský zákoník“) vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy (dále jen „kupní smlouva“) uzavírané mezi prodávajícím a jinou fyzickou osobou (dále jen „kupující“) prostřednictvím internetového obchodu prodávajícího.</p>

                <h2>2. Uživatelský účet</h2>
                <p>Na základě registrace kupujícího provedené na webové stránce může kupující přistupovat do svého uživatelského rozhraní. Ze svého uživatelského rozhraní může kupující provádět objednávání zboží (dále jen „uživatelský účet“). Kupující může provádět objednávání zboží též bez registrace přímo z webového rozhraní obchodu.</p>

                <h2>3. Uzavření kupní smlouvy</h2>
                <p>Veškerá prezentace zboží umístěná ve webovém rozhraní obchodu je informativního charakteru a prodávající není povinen uzavřít kupní smlouvu ohledně tohoto zboží. Ustanovení § 1732 odst. 2 občanského zákoníku se nepoužije.</p>

                <h2>4. Cena zboží a platební podmínky</h2>
                <p>Cenu zboží a případné náklady spojené s dodáním zboží dle kupní smlouvy může kupující uhradit prodávajícímu následujícími způsoby:
                    <ul>
                        <li>bezhotovostně převodem na účet prodávajícího;</li>
                        <li>bezhotovostně platební kartou;</li>
                        <li>dobírkou v místě určení při převzetí zboží.</li>
                    </ul>
                </p>

                {/* Další sekce dle potřeby */}
                <p className="text-sm text-gray-500 mt-8">Poslední aktualizace: 17. února 2026</p>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
