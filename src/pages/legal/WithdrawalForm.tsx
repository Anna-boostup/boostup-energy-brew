import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const WithdrawalForm = () => {
    
    // Pro lepší SEO a zobrazení tabu
    useEffect(() => {
        document.title = "Formulář pro odstoupení od smlouvy | BoostUp";
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="print:hidden bg-slate-100 p-4 flex justify-between items-center border-b">
                <p className="text-sm text-slate-600">Tento dokument je připraven k tisku. Vytiskněte jej, vyplňte a přiložte k vrácenému zboží.</p>
                <Button onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" /> Vytisknout formulář
                </Button>
            </div>

            <div className="max-w-3xl mx-auto p-8 print:p-0 print:max-w-none bg-white text-black font-serif">
                <h1 className="text-2xl font-bold mb-8 text-center uppercase tracking-wider">Oznámení o odstoupení od kupní smlouvy</h1>
                
                <div className="mb-8">
                    <h2 className="font-bold mb-2">Adresát (Prodávající):</h2>
                    <p><strong>Zdeněk Dias</strong></p>
                    <p>Minská 260/28, Brno 616 00</p>
                    <p>IČO: 19139803</p>
                    <p>E-mail: info@drinkboostup.cz</p>
                </div>

                <div className="mb-8 leading-relaxed">
                    <p className="mb-4">
                        <strong>Oznamuji, že tímto odstupuji od smlouvy o nákupu tohoto zboží:</strong>
                    </p>
                    
                    <div className="border border-black p-4 mb-6 min-h-[100px]">
                        <span className="text-slate-400 italic">Doplňte název zboží, případně množství...</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Datum objednání:</strong></span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Číslo objednávky:</strong></span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Datum obdržení zboží:</strong></span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 leading-relaxed">
                    <p className="mb-4">
                        <strong>Spotřebitel:</strong>
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Jméno a příjmení:</strong></span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Adresa:</strong></span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>E-mail / Telefon:</strong></span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 leading-relaxed">
                    <p className="mb-4">
                        Kupní cenu za zboží včetně nákladů na dodání prosím vraťte na bankovní účet:
                    </p>
                    <div className="flex gap-4 items-center">
                        <span className="w-48"><strong>Číslo účtu / kód banky:</strong></span>
                        <div className="flex-1 border-b border-black border-dotted"></div>
                    </div>
                </div>

                <div className="mt-16 flex justify-between items-end">
                    <div className="w-64">
                        <div className="flex gap-2 items-center mb-2">
                            <span>V</span>
                            <div className="flex-1 border-b border-black border-dotted"></div>
                            <span>dne</span>
                            <div className="w-20 border-b border-black border-dotted"></div>
                        </div>
                    </div>

                    <div className="w-64 text-center">
                        <div className="w-full border-b border-black mb-2"></div>
                        <span className="text-sm">Podpis spotřebitele</span>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-black text-xs text-justify">
                    <strong>Poučení pro spotřebitele:</strong> Právo odstoupit od smlouvy je možno uplatnit do 14 dnů od převzetí zboží. Spotřebitel odpovídá za snížení hodnoty zboží v důsledku nakládání s ním jiným způsobem, než který je nutný k obeznámení se s povahou a vlastnostmi zboží. V případě potravin a doplňků stravy (včetně BoostUp shotů) není možné z hygienických důvodů odstoupit od smlouvy ohledně zboží v uzavřeném obalu, které spotřebitel z obalu vyňal.
                </div>
            </div>
        </div>
    );
};

export default WithdrawalForm;
