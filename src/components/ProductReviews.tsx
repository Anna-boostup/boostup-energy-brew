import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Star, MessageSquareQuote } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { useContent } from '@/context/ContentContext';

interface Review {
    id: string;
    author_name: string;
    rating: number;
    content: string;
    created_at: string;
}

export const ProductReviews = () => {
    const { user, userProfile } = useAuth();
    const { toast } = useToast();
    const [enabled, setEnabled] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkEnabledAndFetch = async () => {
            const { data: setting } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'reviews_enabled')
                .single();

            if (setting?.value === 'true' || setting?.value === true) {
                setEnabled(true);
                fetchReviews();
            } else {
                setLoading(false);
            }
        };

        checkEnabledAndFetch();
    }, []);

    const fetchReviews = async () => {
        const { data } = await supabase
            .from('product_reviews')
            .select('id, author_name, rating, content, created_at')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (data) {
            setReviews(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        const { error } = await supabase.from('product_reviews').insert({
            user_id: user.id,
            author_name: userProfile?.full_name || user.email?.split('@')[0] || 'Zákazník',
            rating,
            content,
            status: 'pending'
        });

        setIsSubmitting(false);

        if (error) {
            toast({
                title: "Chyba při odesílání",
                description: error.message,
                variant: "destructive"
            });
        } else {
            setSubmitted(true);
            setContent('');
            toast({
                title: "Recenze odeslána",
                description: "Děkujeme! Vaše recenze čeká na schválení.",
            });
        }
    };

    if (loading) return null;
    if (!enabled) return null;

    return (
        <section className="py-16 md:py-24 bg-background border-t border-border/10">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-3 mb-10">
                    <MessageSquareQuote className="w-8 h-8 text-lime" />
                    <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-foreground">
                        Hodnocení zákazníků
                    </h2>
                </div>

                {/* Form */}
                <div className="bg-secondary/10 p-6 md:p-8 rounded-3xl mb-12">
                    {submitted ? (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold text-olive-dark">Děkujeme za recenzi!</h3>
                            <p className="text-muted-foreground mt-2">Po schválení administrátorem se zobrazí na webu.</p>
                        </div>
                    ) : user ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest mb-3 text-muted-foreground">Vaše hodnocení</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star className={`w-8 h-8 ${rating >= star ? 'fill-lime text-lime' : 'text-border'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest mb-3 text-muted-foreground">Vaše zkušenost (volitelné)</label>
                                <Textarea 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Napište nám, jak jste byli spokojeni..."
                                    className="min-h-[120px] bg-background border-border/50 rounded-2xl"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-olive-dark text-white hover:bg-olive-dark/90 rounded-2xl font-bold px-8 h-12"
                            >
                                {isSubmitting ? 'Odesílám...' : 'Odeslat hodnocení'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Pro přidání hodnocení se prosím přihlaste nebo si vytvořte účet při nákupu.</p>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Zatím tu nejsou žádné recenze. Buďte první!</p>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="bg-background border border-border/10 p-6 rounded-3xl shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg">{review.author_name}</h4>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {new Date(review.created_at).toLocaleDateString('cs-CZ')}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'fill-lime text-lime' : 'text-border'}`} />
                                        ))}
                                    </div>
                                </div>
                                {review.content && (
                                    <p className="text-foreground/80 leading-relaxed">{review.content}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductReviews;
