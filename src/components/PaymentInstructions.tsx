import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, QrCode } from 'lucide-react';
import { SITE_CONTENT } from '@/config/site-content';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface PaymentInstructionsProps {
    orderNumber: string;
    amount: number;
}

const PaymentInstructions = ({ orderNumber, amount }: PaymentInstructionsProps) => {
    const { toast } = useToast();
    const bank = SITE_CONTENT.bankInfo;

    // Generate QR payment string (SPD format)
    // Variable symbol must be numeric
    const vs = orderNumber.replace(/\D/g, '') || orderNumber;
    const qrValue = `SPD*1.0*ACC:${bank.iban}*AM:${amount}*CC:${bank.currency}*VS:${vs}*MSG:${bank.qrMessage} ${orderNumber}`;

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Zkopírováno",
            description: `${label} byl zkopírován do schránky.`,
        });
    };

    return (
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <QrCode className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-display font-bold">Pokyny k platbě</h3>
                    <p className="text-sm text-foreground/80">Prosíme o úhradu převodem na účet</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Číslo účtu</p>
                        <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/50">
                            <span className="font-mono font-bold text-lg">{bank.accountNumber}/{bank.bankCode}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => copyToClipboard(`${bank.accountNumber}/${bank.bankCode}`, "Číslo účtu")}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Variabilní symbol</p>
                        <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/50" data-sentry-mask>
                            <span className="font-mono font-bold text-lg">{vs}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => copyToClipboard(vs, "Variabilní symbol")}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Částka k úhradě</p>
                        <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/20" data-sentry-mask>
                            <span className="font-mono font-bold text-lg text-primary">{amount}.00 Kč</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => copyToClipboard(amount.toString(), "Částka")}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-2 border-primary/20 shadow-inner group" data-sentry-block>
                    <div className="p-2 bg-white rounded-lg transition-transform duration-300 group-hover:scale-105">
                        <QRCodeSVG
                            value={qrValue}
                            size={180}
                            level="M"
                            includeMargin={false}
                        />
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-foreground/70 uppercase tracking-widest text-center leading-tight">
                        Naskenujte v bankovní aplikaci<br />pro rychlou platbu
                    </p>
                </div>
            </div>

            <div className="bg-lime/10 border border-lime/20 rounded-2xl p-4 flex gap-4">
                <div className="w-10 h-10 bg-lime/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-lime" />
                </div>
                <p className="text-xs leading-relaxed text-foreground/80 flex items-center">
                    Objednávku začneme zpracovávat ihned po připsání platby na náš účet. V případě dotazů k platbě nás kontaktujte na <a href="mailto:fakturace@drinkboostup.cz" className="font-bold underline">fakturace@drinkboostup.cz</a>.
                </p>
            </div>
        </div>
    );
};

export default PaymentInstructions;
