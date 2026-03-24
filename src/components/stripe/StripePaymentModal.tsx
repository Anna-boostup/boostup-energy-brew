import { useState, useEffect } from 'react';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Lock, AlertCircle } from 'lucide-react';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface StripePaymentModalProps {
  clientSecret: string;
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
}

const CheckoutForm = ({ amount, orderNumber, clientSecret }: { amount: number, orderNumber: string, clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false);

  // Diagnostic Logging
  useEffect(() => {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    const csPrefix = clientSecret ? clientSecret.split('_').slice(0, 2).join('_') : 'none';
    
    console.log('[Stripe Debug] Component Mount/Update', {
      hasPublishableKey: !!pk,
      publishableKeyPrefix: pk ? pk.substring(0, 10) + '...' : 'MISSING',
      isTestKey: pk.startsWith('pk_test'),
      clientSecretPrefix: csPrefix + '...',
      stripeLoaded: !!stripe,
      elementsLoaded: !!elements,
      isOpen: true // It's only rendered when open
    });

    if (!pk) {
      console.error('[Stripe Debug] CRITICAL: VITE_STRIPE_PUBLISHABLE_KEY is missing!');
    }

    if (pk && pk.startsWith('pk_test') && csPrefix.includes('live')) {
      console.error('[Stripe Debug] KEY MISMATCH: Using TEST Publishable Key with LIVE Client Secret!');
      setErrorMessage('Chyba konfigurace: Testovací klíč vs Produkční platba.');
    } else if (pk && pk.startsWith('pk_live') && csPrefix.includes('test')) {
      console.error('[Stripe Debug] KEY MISMATCH: Using LIVE Publishable Key with TEST Client Secret!');
      setErrorMessage('Chyba konfigurace: Produkční klíč vs Testovací platba.');
    }
  }, [stripe, elements, clientSecret, pk]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.warn('[CheckoutForm] Stripe or Elements not ready');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const origin = window.location.origin;

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${origin}/payment/success?orderNumber=${orderNumber}&amount=${amount}`,
        },
      });

      if (error) {
        console.error('[CheckoutForm] Payment confirmation error:', error);
        setErrorMessage(error.message ?? 'Došlo k neznámé chybě při zpracování platby.');
        setIsProcessing(false);
      }
    } catch (e: any) {
      console.error('[CheckoutForm] Unexpected error:', e);
      setErrorMessage('Neočekávaná chyba při komunikaci se Stripe.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="min-h-[200px] relative">
        <PaymentElement 
          id="payment-element" 
          options={{ layout: 'tabs' }} 
          onReady={() => setIsStripeReady(true)}
          onChange={(event) => {
             console.log('[Stripe PaymentElement Change]', event);
             if (event.error) {
               console.error('[Stripe PaymentElement Error]', event.error);
               setErrorMessage(`Chyba platebního modulu: ${event.error.message}`);
             }
          }}
        />
        {!isStripeReady && !errorMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2 flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="break-all">{errorMessage}</span>
        </div>
      )}

      <Button
        disabled={isProcessing || !isStripeReady || !stripe}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            {!isStripeReady ? 'Načítání platební brány...' : `Zaplatit ${amount} Kč`}
          </span>
        )}
      </Button>
    </form>
  );
};

export const StripePaymentModal = ({
  clientSecret,
  isOpen,
  onClose,
  orderNumber,
  amount,
}: StripePaymentModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#82b04f', // primary brand color
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-secondary/30">
            <div>
              <h2 className="text-xl font-bold text-foreground">Detail platby</h2>
              <p className="text-sm text-foreground/70">Objednávka #{orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-foreground/60" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6 flex justify-between items-center bg-secondary/20 p-4 rounded-xl">
              <span className="font-medium text-foreground/80">K úhradě</span>
              <span className="text-2xl font-black text-foreground">{amount} Kč</span>
            </div>

            {!publishableKey ? (
              <div className="py-8 px-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <div className="flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Chybí Stripe konfiguace</p>
                    <p>V souboru <code>.env</code> chybí klíč <code>VITE_STRIPE_PUBLISHABLE_KEY</code>. Prosím doplňte jej pro zobrazení platební brány.</p>
                  </div>
                </div>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                 <CheckoutForm amount={amount} orderNumber={orderNumber} clientSecret={clientSecret} />
              </Elements>
            ) : (
              <div className="py-12 flex flex-col items-center gap-4">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <p className="text-sm text-muted-foreground italic text-center">
                   Inicializace platby... <br/>
                   <span className="text-[10px] opacity-50">Pokud se pole nenačte do 10s, zkontrolujte konzoli (F12).</span>
                 </p>
              </div>
            )}
          </div>
          
          <div className="bg-secondary/30 p-4 text-center text-xs text-foreground/60">
             Platba probíhá bezpečně přes Stripe. Vaše údaje jsou chráněny.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
