import LegalLayout from "@/components/LegalLayout";

const Returns = () => {
    return (
        <LegalLayout title="Reklamace a vrácení zboží" lastUpdated="17. února 2026">
            <h2>1. Odstoupení od smlouvy (Vrácení zboží)</h2>
            <p>
                Jako spotřebitel máte právo odstoupit od smlouvy ve lhůtě <strong>14 dnů</strong> bez udání důvodu. Lhůta běží ode dne převzetí zboží.
                Zboží musí být vráceno <strong>nepoužité, nepoškozené a v původním obalu</strong> (pokud to povaha zboží nevylučuje, např. z hygienických důvodů
                u otevřených potravinových doplňků nelze odstoupit od smlouvy).
            </p>
            <div>
                <p>
                    Pro odstoupení od smlouvy nás prosím kontaktujte na emailu <a href="mailto:info@drinkboostup.cz">info@drinkboostup.cz</a>, kde se domluvíme na dalším postupu.
                </p>
                <br />
                <strong>Postup při reklamaci / vrácení:</strong>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                    <li>
                        <strong>Informujte nás:</strong> Napište nám na e-mail <a href="mailto:info@drinkboostup.cz">info@drinkboostup.cz</a> nebo zavolejte.
                        Popište závadu a uveďte číslo objednávky.
                    </li>
                    <li>
                        <strong>Zaslání zboží:</strong> Zboží pečlivě zabalte a zašlete zpět na naši adresu (viz patička webu). Doporučujeme zaslat doporučeně.
                    </li>
                    <li>
                        <strong>Vyřízení:</strong> Reklamaci vyřídíme co nejrychleji, nejpozději do 30 dnů od jejího uplatnění. O výsledku vás budeme informovat e-mailem.
                    </li>
                </ul>
            </div>
        </LegalLayout>
    );
};

export default Returns;
