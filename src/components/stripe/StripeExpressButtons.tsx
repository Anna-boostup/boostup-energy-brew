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
import { Loader2, Zap } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

const StripeExpressButtons = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, cartTotal, appliedPromoCode, clearCart } = useCart();
  const { addOrder, decrementStock } = useInventory();
  const { content } = useContent();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Logic: Free shipping if total >= 1500 or contains 21-pack
  const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
  const shippingCost = isFreeShipping ? 0 : 79;
  const finalTotalAmount = cartTotal + shippingCost;

  useEffect(() => {
    if (!stripe || cart.length === 0) return;

    // Create payment request with correct dynamic total
    const pr = stripe.paymentRequest({
      country: 'CZ',
      currency: 'czk',
      total: {
        label: 'BoostUp Energy Order',
        amount: Math.round(finalTotalAmount * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'courier-shipping',
          label: 'Doručení kurýrem',
          detail: 'Doručení do 48 hodin',
          amount: Math.round(shippingCost * 100),
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
        
        // Helper specifically for Czech address formats
        const parseAddressLine = (line: string) => {
          if (!line) return { street: '', houseNumber: '' };
          const match = line.match(/^(.*?)\s*(\d+[\/\w]*)$/);
          if (match) {
            return { street: match[1].trim(), houseNumber: match[2].trim() };
          }
          return { street: line.trim(), houseNumber: '' };
        };

        const { street, houseNumber } = parseAddressLine(shippingAddress?.addressLine?.[0] || '');
        const fullName = payerName || shippingAddress?.recipient || 'Express Customer';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Express';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

        // Consistent order ID generation
        const orderNumber = `BUP${Math.floor(Date.now() / 1000)}`;

        const newOrder: Order = {
          id: orderNumber,
          date: new Date().toISOString(),
          customer: {
            name: fullName,
            email: payerEmail || 'guest@drinkboostup.cz',
          },
          delivery_info: {
            firstName,
            lastName,
            phone: ev.shippingAddress?.phone || '',
            street,
            houseNumber,
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
          total: finalTotalAmount,
          status: 'pending',
          is_subscription_order: cart.some(item => !!item.subscriptionInterval)
        };

        // 1. Stock update (synchronized with CheckoutPage)
        for (const item of cart) {
           if (item.flavorMode === 'mix' && item.mixConfiguration) {
              const { lemon, red, silky } = item.mixConfiguration;
              if (lemon) await decrementStock('lemon', lemon * item.quantity);
              if (red) await decrementStock('red', red * item.quantity);
              if (silky) await decrementStock('silky', silky * item.quantity);
           } else if (item.flavor && item.pack) {
              const flavorLower = item.flavor.toLowerCase();
              const flavorBase = flavorLower.includes('lemon') ? 'lemon'
                : flavorLower.includes('red') ? 'red'
                : flavorLower.includes('silky') ? 'silky' : null;
              if (flavorBase) {
                 await decrementStock(flavorBase, item.pack * item.quantity);
              }
           }
        }

        // 2. Save to Database
        const orderSaved = await addOrder(newOrder);
        if (!orderSaved) throw new Error('Nepodařilo se uložit objednávku.');

        // 3. Create PaymentIntent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: orderNumber,
            total: finalTotalAmount,
            customerEmail: payerEmail,
          }),
        });

        const { clientSecret, error: backendError } = await response.json();
        if (backendError) throw new Error(backendError);

        // 4. Confirm payment
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
          window.location.href = `/payment/success?orderNumber=${orderNumber}&amount=${finalTotalAmount}&status=success&provider=stripe`;
        }
      } catch (err: any) {
        console.error('[Express Checkout Error]', err);
        ev.complete('fail');
        toast({
          title: "Chyba platby",
          description: err.message || "Platba nebyla dokončena.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    });

  }, [stripe, cart, cartTotal, finalTotalAmount, shippingCost]);

  if (!canMakePayment) return null;

  return (
    <div className="relative">
      <PaymentRequestButtonElement options={{ paymentRequest }} />
      {isProcessing && (
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-10 pointer-events-none">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );
};

export default StripeExpressButtons;
