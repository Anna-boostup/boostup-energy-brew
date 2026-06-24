import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Send, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const WithdrawalForm = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';
    const date = searchParams.get('date') || '';
    
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        itemsDescription: '',
        orderDate: date,
        orderId: orderId,
        receiveDate: '',
        customerName: name,
        address: '',
        customerEmail: email,
        bankAccount: '',
        location: '',
        signDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'withdrawal_request',
                    ...formData
                })
            });

            if (!response.ok) throw new Error('Failed to send request');

            toast({
                title: "Formulář odeslán",
                description: "Vaše žádost o odstoupení od smlouvy byla úspěšně odeslána. Brzy se vám ozveme s dalším postupem.",
            });
            
            // Clear form
            setFormData({
                itemsDescription: '',
                orderDate: '',
                orderId: '',
                receiveDate: '',
                customerName: '',
                address: '',
                customerEmail: '',
                bankAccount: '',
                location: '',
                signDate: ''
            });
        } catch (error) {
            toast({
                title: "Chyba při odesílání",
                description: "Odstoupení se nepodařilo odeslat elektronicky. Zkuste to prosím znovu, nebo formulář vytiskněte a pošlete e-mailem.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Pro lepší SEO a zobrazení tabu
    useEffect(() => {
        document.title = "Formulář pro odstoupení od smlouvy | BoostUp";
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="print:hidden bg-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center border-b gap-4">
                <p className="text-sm text-slate-600">Formulář můžete vyplnit a odeslat rovnou elektronicky, nebo jej vytisknout a přiložit k vrácenému zboží.</p>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="submit" form="withdrawal-form" disabled={isSubmitting} className="gap-2 flex-1 sm:flex-none">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isSubmitting ? "Odesílám..." : "Odeslat elektronicky"}
                    </Button>
                    <Button onClick={handlePrint} variant="outline" className="gap-2 flex-1 sm:flex-none">
                        <Printer className="w-4 h-4" /> Vytisknout
                    </Button>
                </div>
            </div>

            <form id="withdrawal-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 print:p-0 print:max-w-none bg-white text-black font-serif">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">Oznámení o odstoupení<br/>od kupní smlouvy</h1>
                    <img src="/logo-green.png" alt="BoostUp" className="h-10 object-contain print:h-8" />
                </div>
                
                <div className="mb-8">
                    <h2 className="font-bold mb-2">Adresát (Prodávající):</h2>
                    <p><strong>BOOSTUP SUPPLEMENTS S.R.O.</strong></p>
                    <p>Chaloupkova 3002/1a, Královo Pole, 612 00 Brno</p>
                    <p>IČO: 24045560</p>
                    <p>E-mail: info@drinkboostup.cz</p>
                </div>

                <div className="mb-8 leading-relaxed">
                    <p className="mb-4">
                        <strong>Oznamuji, že tímto odstupuji od smlouvy o nákupu tohoto zboží:</strong>
                    </p>
                    
                    <textarea 
                        className="w-full border border-black p-4 mb-6 min-h-[100px] resize-y bg-transparent outline-none placeholder:italic placeholder:text-slate-400 font-sans"
                        placeholder="Doplňte název zboží, případně množství..."
                        value={formData.itemsDescription}
                        onChange={(e) => setFormData({...formData, itemsDescription: e.target.value})}
                        required
                    ></textarea>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Datum objednání:</strong></span>
                            <input type="text" value={formData.orderDate} onChange={(e) => setFormData({...formData, orderDate: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Číslo objednávky:</strong></span>
                            <input type="text" value={formData.orderId} onChange={(e) => setFormData({...formData, orderId: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Datum obdržení zboží:</strong></span>
                            <input type="text" value={formData.receiveDate} onChange={(e) => setFormData({...formData, receiveDate: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
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
                            <input type="text" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>Adresa:</strong></span>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="w-48"><strong>E-mail / Telefon:</strong></span>
                            <input type="text" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
                        </div>
                    </div>
                </div>

                <div className="mb-8 leading-relaxed">
                    <p className="mb-4">
                        Kupní cenu za zboží včetně nákladů na dodání prosím vraťte na bankovní účet:
                    </p>
                    <div className="flex gap-4 items-center">
                        <span className="w-48"><strong>Číslo účtu / kód banky:</strong></span>
                        <input type="text" value={formData.bankAccount} onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none font-sans px-2" />
                    </div>
                </div>

                <div className="mt-16 flex justify-between items-end">
                    <div className="w-64">
                        <div className="flex gap-2 items-center mb-2">
                            <span>V</span>
                            <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required className="flex-1 border-b border-black border-dotted bg-transparent outline-none text-center font-sans px-2" />
                            <span>dne</span>
                            <input type="text" value={formData.signDate} onChange={(e) => setFormData({...formData, signDate: e.target.value})} required className="w-24 border-b border-black border-dotted bg-transparent outline-none text-center font-sans px-2" />
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
            </form>
        </div>
    );
};

export default WithdrawalForm;
