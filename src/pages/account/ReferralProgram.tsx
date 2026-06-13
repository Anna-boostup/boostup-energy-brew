import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Gift, Copy, Check, Share2, Loader2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ReferralStats {
    totalReferrals: number;
    completedReferrals: number;
    totalRewards: number;
}

const ReferralProgram = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, completedReferrals: 0, totalRewards: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [referralCode, setReferralCode] = useState<string>('');

    useEffect(() => {
        if (!user) return;
        
        const fetchReferralData = async () => {
            // Get user's referral code. Since we don't have a specific column in profiles for it yet, 
            // we will use the user's id prefix or fetch if they have one generated.
            // For simplicity, we use the first 8 characters of their user ID.
            const code = user.id.substring(0, 8).toUpperCase();
            setReferralCode(code);

            // Fetch referrals where this user is the referrer
            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', user.id);

            if (data) {
                const total = data.length;
                const completed = data.filter(r => r.status === 'completed').length;
                const rewards = data.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.reward_amount || 0), 0);
                
                setStats({
                    totalReferrals: total,
                    completedReferrals: completed,
                    totalRewards: rewards
                });
            }
            setLoading(false);
        };

        fetchReferralData();
    }, [user]);

    const handleCopy = () => {
        const link = `${window.location.origin}/?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast({ title: "Zkopírováno!", description: "Odkaz byl zkopírován do schránky." });
        setTimeout(() => setCopied(false), 3000);
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-lime" /></div>;
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Gift className="w-6 h-6 text-lime" /> Získejte odměnu
                </h2>
                <p className="text-muted-foreground mt-2">Doporučte nás svým přátelům a získejte kredit na další nákup.</p>
            </div>

            <Card className="border-2 border-lime/20 bg-lime/5 rounded-3xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Váš unikátní odkaz</CardTitle>
                    <CardDescription>Pošlete tento odkaz přátelům. Jakmile u nás nakoupí, oba získáte odměnu!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <div className="flex-1 bg-background border border-border/50 rounded-2xl px-4 py-3 font-mono text-sm sm:text-base flex items-center overflow-x-auto whitespace-nowrap">
                            {window.location.origin}/?ref={referralCode}
                        </div>
                        <Button 
                            onClick={handleCopy}
                            className="bg-olive-dark text-white hover:bg-olive-dark/90 h-[50px] rounded-2xl px-8"
                        >
                            {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                            {copied ? 'Zkopírováno' : 'Kopírovat'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid sm:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-border/10 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Share2 className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Sdílení</h3>
                        </div>
                        <p className="text-4xl font-black">{stats.totalReferrals}</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/10 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Check className="w-5 h-5 text-lime" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Úspěšné</h3>
                        </div>
                        <p className="text-4xl font-black">{stats.completedReferrals}</p>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/10 shadow-sm bg-olive-dark text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Coins className="w-5 h-5 text-lime" />
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/70">Získaný kredit</h3>
                        </div>
                        <p className="text-4xl font-black">{stats.totalRewards} Kč</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="bg-secondary/10 p-6 rounded-3xl mt-8">
                <h3 className="font-bold text-lg mb-4">Jak to funguje?</h3>
                <ul className="space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-lime text-olive-dark font-bold flex items-center justify-center shrink-0">1</div>
                        <p>Zkopírujte svůj unikátní odkaz a pošlete ho svým přátelům.</p>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-lime text-olive-dark font-bold flex items-center justify-center shrink-0">2</div>
                        <p>Když se váš přítel proklikne a dokončí svůj první nákup, započítá se vám úspěšné doporučení.</p>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-lime text-olive-dark font-bold flex items-center justify-center shrink-0">3</div>
                        <p>Získáte kredit (např. 100 Kč), který se automaticky odečte při vašem dalším nákupu v košíku.</p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ReferralProgram;
