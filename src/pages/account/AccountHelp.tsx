import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Calendar, Truck, XCircle, FileText, Mail, Package } from 'lucide-react';

const Card = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 font-black uppercase tracking-tight text-base"><Icon className="w-5 h-5 text-primary" /> {title}</div>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
);

const AccountHelp = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold font-display">Nápověda</h2>
                <p className="text-muted-foreground">Jak spravovat účet, objednávky a předplatné.</p>
            </div>

            <Card icon={RefreshCw} title="Předplatné – jak funguje">
                <p>Předplatné ti pravidelně posílá oblíbený BoostUp se slevou <b>15 %</b>. Platba i doprava se strhávají <b>před každou zásilkou</b> (doprava se počítá ke každé platbě).</p>
                <p>Vše spravuješ v sekci <Link to="/account/subscriptions" className="text-primary underline">Moje předplatné</Link>.</p>
            </Card>

            <Card icon={Calendar} title="Změna termínu odeslání">
                <p>Datum odeslání si můžeš změnit v <Link to="/account/subscriptions" className="text-primary underline">Moje předplatné</Link>. Posune se tím i datum stržení platby.</p>
                <p><b>Pravidla:</b> maximálně <b>1× za kalendářní měsíc</b> a nejpozději <b>5 dní před odesláním</b>. Když je do odeslání méně než 5 dní, změna je dočasně uzamčená.</p>
            </Card>

            <Card icon={Truck} title="Změna dopravy">
                <p>Způsob dopravy (osobní odběr / Zásilkovna / kurýr) změníš také v Moje předplatné. Platí stejná pravidla jako u data: 1× za měsíc a min. 5 dní předem. Cena dopravy se přepočítá podle nového způsobu.</p>
            </Card>

            <Card icon={XCircle} title="Zrušení předplatného">
                <p>Předplatné zrušíš tlačítkem <b>Zrušit</b> – ukončí se <b>ke konci aktuálního období</b> (další platba už neproběhne). Dokud období neskončí, můžeš zrušení vzít zpět tlačítkem <b>Obnovit</b>.</p>
                <p>Nemáš účet? Předplatné zrušíš i na stránce <Link to="/zruseni-predplatneho" className="text-primary underline">Zrušení předplatného</Link> (stačí číslo objednávky a e-mail).</p>
            </Card>

            <Card icon={FileText} title="Odstoupení od smlouvy (14 dní)">
                <p>Do 14 dnů máš právo odstoupit od smlouvy s vrácením peněz. Použij <Link to="/odstoupeni-od-smlouvy" className="text-primary underline">formulář pro odstoupení</Link>. U předplatného tím zároveň zastavíme i další platby.</p>
            </Card>

            <Card icon={Package} title="Objednávky">
                <p>Přehled a stav svých objednávek najdeš v <Link to="/account/orders" className="text-primary underline">Moje objednávky</Link>. Jakmile zásilku předáme dopravci, pošleme ti e-mail se sledovacím číslem.</p>
            </Card>

            <Card icon={Mail} title="Potřebuješ pomoc?">
                <p>Napiš nám na <a href="mailto:info@drinkboostup.cz" className="text-primary underline">info@drinkboostup.cz</a> a rádi poradíme.</p>
            </Card>
        </div>
    );
};

export default AccountHelp;
