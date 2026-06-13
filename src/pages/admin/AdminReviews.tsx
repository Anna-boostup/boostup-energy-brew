import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquareQuote, Check, X, Trash2, Star, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Review {
    id: string;
    author_name: string;
    rating: number;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

const AdminReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('product_reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: "Chyba načítání", description: error.message, variant: "destructive" });
        } else if (data) {
            setReviews(data);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('product_reviews')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast({ title: "Chyba aktualizace", description: error.message, variant: "destructive" });
        } else {
            setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
            toast({ title: "Úspěšně uloženo" });
        }
    };

    const deleteReview = async (id: string) => {
        if (!window.confirm("Opravdu chcete smazat tuto recenzi?")) return;
        const { error } = await supabase
            .from('product_reviews')
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: "Chyba mazání", description: error.message, variant: "destructive" });
        } else {
            setReviews(reviews.filter(r => r.id !== id));
            toast({ title: "Úspěšně smazáno" });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-olive" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <MessageSquareQuote className="w-8 h-8 text-olive" />
                <h1 className="text-3xl font-black uppercase tracking-tighter">Správa recenzí</h1>
            </div>

            <div className="grid gap-6">
                {reviews.length === 0 ? (
                    <div className="text-center p-10 bg-white/50 rounded-3xl border border-black/5">
                        <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold">Zatím žádné recenze</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg">{review.author_name}</h3>
                                    <Badge variant={review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'destructive' : 'secondary'}>
                                        {review.status === 'approved' ? 'Schváleno' : review.status === 'rejected' ? 'Zamítnuto' : 'Ke schválení'}
                                    </Badge>
                                </div>
                                <div className="flex gap-1 text-lime">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`w-4 h-4 ${review.rating >= star ? 'fill-current' : 'text-border'}`} />
                                    ))}
                                </div>
                                <p className="text-muted-foreground">{review.content || <span className="italic">Bez textového hodnocení</span>}</p>
                                <p className="text-xs text-muted-foreground opacity-70">{new Date(review.created_at).toLocaleString('cs-CZ')}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {review.status !== 'approved' && (
                                    <Button size="sm" onClick={() => updateStatus(review.id, 'approved')} className="bg-lime text-olive-dark hover:bg-lime/90 font-bold">
                                        <Check className="w-4 h-4 mr-1" /> Schválit
                                    </Button>
                                )}
                                {review.status !== 'rejected' && (
                                    <Button size="sm" variant="outline" onClick={() => updateStatus(review.id, 'rejected')}>
                                        <X className="w-4 h-4 mr-1" /> Zamítnout
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteReview(review.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
