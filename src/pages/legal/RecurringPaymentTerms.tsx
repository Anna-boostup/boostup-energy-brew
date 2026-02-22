import LegalLayout from "@/components/LegalLayout";

const RecurringPaymentTerms = () => {
    return (
        <LegalLayout
            title="Podmínky opakované platby"
            lastUpdated="22. února 2026"
            seoTitle="Podmínky opakované platby | BoostUp"
        >
            <p>
                Tyto podmínky opakované platby (dále jen „podmínky") upravují pravidla pro automatické opakované strhávání plateb
                v rámci služby předplatného (odběrů) provozované společností <strong>BoostUp Supplements s.r.o.</strong>,
                se sídlem Chaloupkova 3002/1a, Královo Pole, 612 00 Brno, IČO: 24045560 (dále jen „prodávající").
            </p>

            <h2>1. Co je opakovaná platba?</h2>
            <p>
                Opakovaná platba (dále jen „recurring payment") je automatické, pravidelné strhávání částky
                z platební karty zákazníka bez nutnosti opakovat platbu manuálně. Tato funkce je dostupná
                při výběru možnosti pravidelného odběru (předplatného) produktů BoostUp.
            </p>
            <p>
                Zákazník souhlasí s opakovanou platbou v okamžiku dokončení objednávky s vybraným intervalem odběru.
                Souhlas je vyjádřen zaškrtnutím příslušného pole a odsouhlasením těchto podmínek před odesláním objednávky.
            </p>

            <h2>2. Frekvence a výše plateb</h2>
            <p>
                Opakované platby jsou prováděny v pravidelných intervalech dle zvoleného předplatného:
            </p>
            <ul>
                <li><strong>Měsíční odběr</strong> — platba je stržena každých 30 dní ode dne první platby</li>
                <li><strong>Dvouměsíční odběr</strong> — platba je stržena každých 60 dní ode dne první platby</li>
                <li><strong>Čtvrtletní odběr</strong> — platba je stržena každých 90 dní ode dne první platby</li>
            </ul>
            <p>
                Výše opakované platby odpovídá ceně vybrané varianty produktu platné v okamžiku první objednávky.
                O jakékoli změně ceny bude zákazník informován nejméně 14 dní předem e-mailem na adresu uvedenou při objednávce.
            </p>

            <h2>3. Platební metoda</h2>
            <p>
                Opakované platby jsou realizovány prostřednictvím platební brány <strong>GoPay</strong>.
                Zákazník při první platbě uděluje souhlas k tokenizaci své platební karty, tj. k bezpečnému uložení
                platebních údajů poskytovatelem platební brány za účelem budoucích opakovaných plateb.
                Číslo karty ani CVC kód nejsou ukládány prodávajícím — veškeré platební údaje jsou spravovány
                výhradně poskytovatelem platební brány v souladu se standardem PCI DSS.
            </p>

            <h2>4. Oznámení před platbou</h2>
            <p>
                Zákazník bude informován e-mailem nejméně <strong>3 dny před</strong> každou nadcházející platbou.
                E-mail bude obsahovat datum platby, strhovanou částku a odkaz pro správu nebo zrušení předplatného.
            </p>

            <h2>5. Zrušení předplatného</h2>
            <p>
                Zákazník může předplatné kdykoli zrušit bez udání důvodu a bez sankcí, a to:
            </p>
            <ul>
                <li>Prostřednictvím svého zákaznického účtu na <strong>drinkboostup.cz</strong> (sekce „Moje předplatné")</li>
                <li>E-mailem na adresu <strong>info@drinkboostup.cz</strong></li>
                <li>Písemně na adresu sídla společnosti</li>
            </ul>
            <p>
                Žádost o zrušení musí být doručena nejpozději <strong>24 hodin před</strong> plánovaným datem příští platby,
                aby nedošlo k jejímu provedení. Zrušení je účinné ke konci aktuálního fakturačního období —
                již uhrazené platby se nevracejí.
            </p>

            <h2>6. Neúspěšná platba</h2>
            <p>
                V případě neúspěšné opakované platby (nedostatek prostředků, vypršení karty apod.) bude zákazník
                informován e-mailem. Prodávající provede opakovaný pokus o platbu do 3 pracovních dnů.
                Pokud ani opakovaný pokus neproběhne úspěšně, předplatné bude automaticky pozastaveno
                a zákazník bude vyzván k aktualizaci platebních údajů.
            </p>

            <h2>7. Právo na odstoupení od smlouvy</h2>
            <p>
                Zákazník má právo odstoupit od smlouvy o předplatném bez udání důvodu ve lhůtě <strong>14 dnů</strong>
                ode dne uzavření smlouvy (tj. ode dne první objednávky), pokud dosud nebylo zboží expedováno.
                Po zahájení zásilky (expedici) zboží právo na odstoupení zaniká v souladu s § 1837 písm. a) občanského zákoníku.
            </p>

            <h2>8. Ochrana osobních údajů</h2>
            <p>
                Veškeré zpracování osobních a platebních údajů probíhá v souladu s nařízením GDPR a zásadami
                ochrany osobních údajů dostupnými na <a href="/ochrana-osobnich-udaju">drinkboostup.cz/ochrana-osobnich-udaju</a>.
            </p>

            <h2>9. Kontakt</h2>
            <p>
                V případě dotazů týkajících se opakovaných plateb nás kontaktujte:
            </p>
            <ul>
                <li><strong>E-mail:</strong> info@drinkboostup.cz</li>
                <li><strong>Telefon:</strong> +420 775 222 037</li>
                <li><strong>Adresa:</strong> BoostUp Supplements s.r.o., Chaloupkova 3002/1a, Královo Pole, 612 00 Brno</li>
            </ul>
            <p>
                Tyto podmínky jsou platné a účinné od 22. února 2026. Prodávající si vyhrazuje právo podmínky
                aktualizovat; zákazníci budou o změnách informováni e-mailem.
            </p>
        </LegalLayout>
    );
};

export default RecurringPaymentTerms;
