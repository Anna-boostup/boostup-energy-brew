import { supabase } from '@/lib/supabase';

export const downloadPacketaLabel = async (identifier: string, isBarcode: boolean = false) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
             throw new Error('Unauthorized');
        }
        
        const queryParam = isBarcode ? `barcode=${identifier}` : `packetId=${identifier}`;
        const res = await fetch(`/api/get-packeta-label?${queryParam}`, {
             headers: {
                 'Authorization': `Bearer ${session.access_token}`
             }
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.error || 'Chyba při stahování štítku Zásilkovny');
        }
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 10000);
        
        return true;
    } catch (e) {
        console.error('Download packeta label error:', e);
        throw e;
    }
};
