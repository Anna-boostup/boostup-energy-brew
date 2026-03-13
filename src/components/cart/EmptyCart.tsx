import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyCartProps {
    onClose: () => void;
}

export const EmptyCart: React.FC<EmptyCartProps> = ({ onClose }) => (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <div>
            <p className="text-lg font-bold">Váš košík je prázdný</p>
            <p className="text-sm text-muted-foreground mt-1">
                Přidejte si nějakou energii do košíku.
            </p>
        </div>
        <Button onClick={onClose} variant="outline" className="mt-4">
            Pokračovat v nákupu
        </Button>
    </div>
);
