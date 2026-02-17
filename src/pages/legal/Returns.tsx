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
            <p>
                Pro odstoupení od smlouvy nás prosím kontaktujte na emailu <a href="mailto:info@boostup.cz">info@boostup.cz</a>, kde se domluvíme na dalším postupu.
            </p>

            <h2>2. Reklamace (Vady zboží)</h2>
            <p>
                V případě, že zboží při převzetí není ve shodě s kupní smlouvou nebo se vyskytne vada v záruční době, máte právo na reklamaci.
            </p>

            <h3>Postup při reklamaci:</h3>
            <ol>
                <li>
                    <strong>Informujte nás:</strong> Napište nám na e-mail <a href="mailto:info@boostup.cz">info@boostup.cz</a> nebo zavolejte.
                    Popište závadu a uveďte číslo objednávky.
                </li>
                <li>
                    <strong>Zaslání zboží:</strong> Zboží pečlivě zabalte a zašlete zpět na naši adresu (viz patička webu). Doporučujeme zaslat doporučeně.
                </li>
                <li>
                    <strong>Vyřízení:</strong> Reklamaci vyřídíme co nejrychleji, nejpozději do 30 dnů od jejího uplatnění. O výsledku vás budeme informovat e-mailem.
                </li>
            </ol>
        </LegalLayout>
    );
};

export default Returns;
