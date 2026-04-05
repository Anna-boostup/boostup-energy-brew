import React, { useEffect, useState } from 'react';
import {
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import { useInventory, Order } from '@/context/InventoryContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const StripeExpressButtons = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, cartTotal, clearCart } = useCart();
  const { addOrder, decrementStock } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!stripe || cart.length === 0) return;

    const pr = stripe.paymentRequest({
      country: 'CZ',
      currency: 'czk',
      total: {
        label: 'BoostUp Energy Order',
        amount: Math.round(cartTotal * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'standard-shipping',
          label: 'Doručení na adresu',
          detail: 'Doručení kurýrem do 48 hodin',
          amount: 0, // We'll handle shipping logic more deeply if needed, but for now 1500+ is free
        },
      ],
    });

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      }
    });

    // Handle payment method creation
    pr.on('paymentmethod', async (ev) => {
      setIsProcessing(true);
      
      try {
        const { paymentMethod, shippingAddress, payerName, payerEmail } = ev;
        
        // 1. Create orderNumber
        const orderNumber = `BUP${Math.floor(Date.now() / 1000)}`;

        // 2. Prepare Order Object
        const newOrder: Order = {
          id: orderNumber,
          date: new Date().toISOString(),
          customer: {
            name: payerName || shippingAddress?.recipient || 'Express Customer',
            email: payerEmail || 'guest@drinkboostup.cz',
          },
          delivery_info: {
            firstName: (payerName || '').split(' ')[0] || 'Express',
            lastName: (payerName || '').split(' ').slice(1).join(' ') || 'Customer',
            phone: ev.shippingAddress?.phone || '',
            street: shippingAddress?.addressLine?.[0] || '',
            houseNumber: '', // Potentially in addressLine
            city: shippingAddress?.city || '',
            zip: shippingAddress?.postalCode || '',
            deliveryMethod: 'courier',
            paymentMethod: 'stripe_express',
            billingSameAsDelivery: true,
          },
          items: cart.map(item => ({
            sku: item.flavorMode === 'mix' ? `mix-${item.pack}` : `${item.flavor}-${item.pack}`,
            name: item.name,
            quantity: item.quantity,
            price: item.subscriptionInterval ? item.price * 0.85 : item.price,
            mixConfiguration: item.mixConfiguration
          })),
          total: cartTotal,
          status: 'pending',
          is_subscription_order: cart.some(item => !!item.subscriptionInterval)
        };

        // 3. Stock update (bottle level per base flavor)
        cart.forEach(item => {
           if (item.flavorMode === 'mix' && item.mixConfiguration) {
              const { lemon, red, silky } = item.mixConfiguration;
              if (lemon) decrementStock('lemon', lemon * item.quantity);
              if (red) decrementStock('red', red * item.quantity);
              if (silky) decrementStock('silky', silky * item.quantity);
           } else if (item.flavor && item.pack) {
              // Normalize display name to base flavor SKU key
              const flavorLower = item.flavor.toLowerCase();
              const flavorBase = flavorLower.includes('lemon') ? 'lemon'
                : flavorLower.includes('red') ? 'red'
                : flavorLower.includes('silky') ? 'silky' : null;
              if (flavorBase) {
                 decrementStock(flavorBase, item.pack * item.quantity);
              }
           }
        });

        // 4. Save to Database
        const orderSaved = await addOrder(newOrder);
        if (!orderSaved) throw new Error('Nepodařilo se uložit objednávku do databáze.');

        // 5. Create PaymentIntent on server
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: orderNumber,
            total: cartTotal,
            customerEmail: payerEmail,
          }),
        });

        const { clientSecret, error: backendError } = await response.json();
        if (backendError) throw new Error(backendError);

        // 6. Confirm payment
        const { error: stripeError } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: paymentMethod.id },
          { handleActions: false }
        );

        if (stripeError) {
          ev.complete('fail');
          throw new Error(stripeError.message);
        } else {
          ev.complete('success');
          clearCart();
          navigate(`/payment/success?orderNumber=${orderNumber}&amount=${cartTotal}&status=success&provider=stripe`);
        }
      } catch (err: any) {
        console.error('[Express Checkout Error]', err);
        ev.complete('fail');
        toast({
          title: "Chyba expresní platby",
          description: err.message || "Platba nebyla dokončena.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    });

  }, [stripe, cart, cartTotal]);

  if (!canMakePayment) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Rychlá platba</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>
      
      <div className="relative">
        <PaymentRequestButtonElement options={{ paymentRequest }} />
        {isProcessing && (
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-10">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <p className="text-[9px] text-center text-white/30 uppercase tracking-widest font-bold">
        Zabezpečeno přes Stripe
      </p>
    </div>
  );
};

export default StripeExpressButtons;
