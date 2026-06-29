import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeExpressButtons from '@/components/stripe/StripeExpressButtons';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CartStripeWrapper = () => {
    return (
        <Elements stripe={stripePromise}>
            <StripeExpressButtons />
        </Elements>
    );
};

export default CartStripeWrapper;
