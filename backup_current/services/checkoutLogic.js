import PaymentService from './paymentService';

/**
 * Checkout Logic for BoostUp
 * Handles the transition from cart to finalized order.
 */

export const CheckoutSteps = {
    CART: 'cart',
    SHIPPING: 'shipping',
    PAYMENT: 'payment',
    SUMMARY: 'summary',
    SUCCESS: 'success',
};

const CheckoutLogic = {
    /**
     * Validates the shipping information
     * @param {Object} shippingData 
     * @returns {Object} - { isValid: boolean, errors: Object }
     */
    validateShipping(shippingData) {
        const errors = {};
        if (!shippingData.fullName?.trim()) errors.fullName = 'Jméno je povinné';
        if (!shippingData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Neplatný email';
        if (!shippingData.address?.trim()) errors.address = 'Adresa je povinná';
        if (!shippingData.city?.trim()) errors.city = 'Město je povinné';
        if (!shippingData.zip?.trim()) errors.zip = 'PSČ je povinné';

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Processes the checkout flow
     * @param {Array} items - Cart items
     * @param {Object} shippingData 
     * @param {string} paymentMethod 
     * @returns {Promise<Object>} - Execution result
     */
    async processCheckout(items, shippingData, paymentMethod) {
        console.log('Processing checkout...', { items, shippingData, paymentMethod });

        // 1. Validate items
        if (!items || items.length === 0) {
            throw new Error('Košík je prázdný');
        }

        // 2. Validate shipping
        const validation = this.validateShipping(shippingData);
        if (!validation.isValid) {
            throw new Error('Neplatné doručovací údaje');
        }

        try {
            // 3. Create order on server (mock)
            const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // 4. Initiate payment
            const paymentIntent = await PaymentService.createPaymentIntent({
                amount: orderTotal,
                currency: 'CZK',
                items: items,
                shipping: shippingData
            }, paymentMethod);

            if (!paymentIntent.success) {
                throw new Error('Nepodařilo se vytvořit platební požadavek');
            }

            return {
                success: true,
                orderId: paymentIntent.orderId,
                paymentResult: paymentIntent
            };
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    }
};

export default CheckoutLogic;
