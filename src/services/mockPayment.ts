/**
 * Mock Payment Service
 * Simuluje platební bránu (např. GoPay)
 */

export interface PaymentOrderData {
    orderNumber: string;
    total: number;
    items: any[];
    customer: any;
}

export interface PaymentResult {
    success: boolean;
    paymentId: string;
    message: string;
    orderNumber: string;
    amount: number;
    timestamp: string;
}

export interface PaymentStatus {
    paymentId: string;
    status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED';
    paidAt?: string;
}

export const mockPaymentService = {
    /**
     * Simuluje vytvoření platby
     */
    async createPayment(orderData: PaymentOrderData): Promise<PaymentResult> {
        // Simulace API volání (delay)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generování mock payment ID
        const paymentId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // 90% success rate
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
     */
    async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            paymentId: paymentId,
            status: 'PAID',
            paidAt: new Date().toISOString()
        };
    }
};

export default mockPaymentService;
