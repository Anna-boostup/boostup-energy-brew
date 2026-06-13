import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const UpsellWidget: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const { cart, addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        const checkUpsell = async () => {
            const { data: settings } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'upsell_enabled')
                .single();
                
            if (settings?.value === 'true' || settings?.value === true) {
                setEnabled(true);
                // Fetch a random or specific product for upsell, usually a small pack
                const { data: p } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', true)
                    .limit(1)
                    .single();
                if (p) setProduct(p);
            }
        };
        checkUpsell();
    }, []);

    if (!enabled || !product) return null;

    // Don't show if they already have it (basic logic)
    if (cart.some(item => item.id === product.id)) return null;

    return (
        <div className="bg-lime/10 rounded-2xl p-4 mt-4 border border-lime/30">
            <h4 className="text-sm font-bold text-olive-dark mb-2">Mohlo by se hodit</h4>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img src={product.image_url || '/bottle-silky.webp'} alt={product.name} className="w-12 h-12 object-contain" />
                    <div>
                        <p className="font-bold text-sm leading-tight">{product.name}</p>
                        <p className="text-sm font-bold text-lime-dark">{product.price} Kč</p>
                    </div>
                </div>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full px-3 h-8 border-lime hover:bg-lime/20"
                    onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        pack: product.pack_size || 1,
                        flavor: 'Silky Peach' // fallback
                    })}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Přidat
                </Button>
            </div>
        </div>
    );
};
