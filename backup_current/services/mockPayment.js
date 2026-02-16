/**
 * Mock Payment Service
 * Simuluje platební bránu (např. GoPay)
 * Později snadno nahraditelné skutečnou integrací
 */

export const mockPaymentService = {
    /**
     * Simuluje vytvoření platby
     * @param {Object} orderData - Data objednávky
     * @returns {Promise<Object>} Payment result
     */
    async createPayment(orderData) {
        // Simulace API volání (delay)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generování mock payment ID
        const paymentId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 90% success rate pro realistické testování
        const isSuccess = Math.random() > 0.1;

        return {
            success: isSuccess,
            paymentId: paymentId,
            message: isSuccess
                ? 'Platba byla úspěšně zpracována'
                : 'Platba byla zamítnuta bankou',
            orderNumber: orderData.orderNumber,
            amount: orderData.total,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Simuluje kontrolu stavu platby
     * @param {string} paymentId - ID platby
     * @returns {Promise<Object>} Payment status
     */
    async checkPaymentStatus(paymentId) {
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            paymentId: paymentId,
            status: 'PAID', // PAID, PENDING, FAILED, CANCELED
            paidAt: new Date().toISOString()
        };
    }
};

export default mockPaymentService;
