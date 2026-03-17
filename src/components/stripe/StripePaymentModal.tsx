import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Lock } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentModalProps {
  clientSecret: string;
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
}

const CheckoutForm = ({ amount, orderNumber }: { amount: number, orderNumber: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const origin = window.location.origin;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${origin}/payment/success?orderNumber=${orderNumber}&amount=${amount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? 'Došlo k neznámé chybě při zpracování platby.');
      setIsProcessing(false);
    } else {
      // successful payment will redirect automatically to return_url
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}

      <Button
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg relative overflow-hidden group"
        type="submit"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Zaplatit {amount} Kč
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
      borderRadius: '8px',
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

            {clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                 <CheckoutForm amount={amount} orderNumber={orderNumber} />
              </Elements>
            ) : (
              <div className="py-12 flex justify-center">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
