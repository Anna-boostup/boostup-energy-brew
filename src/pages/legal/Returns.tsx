import { SEO } from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Returns = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO title="Reklamace a vrácení zboží" />
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 prose prose-slate max-w-4xl">
                <h1>Reklamační řád a vrácení zboží</h1>

                <h2>1. Odstoupení od smlouvy</h2>
                <p>Jako spotřebitel máte právo odstoupit od smlouvy ve lhůtě 14 dnů bez udání důvodu. Lhůta běží ode dne převzetí zboží.</p>
                <p>Pro odstoupení od smlouvy nás kontaktujte na emailu <strong>info@boostup.cz</strong>.</p>

                <h2>2. Reklamace</h2>
                <p>V případě, že zboží při převzetí není ve shodě s kupní smlouvou nebo se vyskytne vada v záruční době, má kupující právo na reklamaci.</p>

                <h3>Postup při reklamaci:</h3>
                <ol>
                    <li>Informujte nás o reklamaci emailem či telefonicky.</li>
                    <li>Zboží zašlete zpět na naši adresu (doporučujeme doporučeně).</li>
                    <li>Do zásilky uveďte důvod reklamace a číslo objednávky.</li>
                </ol>

                <p className="text-sm text-gray-500 mt-8">Poslední aktualizace: 17. února 2026</p>
            </main>
            <Footer />
        </div>
    );
};

export default Returns;
