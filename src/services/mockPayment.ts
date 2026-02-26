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
    gw_url?: string;
}

export interface PaymentStatus {
    paymentId: string;
    status: 'PAID' | 'PENDING' | 'AUTHORIZED' | 'FAILED' | 'CANCELED';
    paidAt?: string;
}

export const mockPaymentService = {
    /**
     * Simuluje inicializaci platby a vrácení URL brány
     */
    async initiatePayment(orderData: PaymentOrderData): Promise<PaymentResult> {
        // Simulace API volání (delay)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generování mock payment ID
        const paymentId = `GP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        return {
            success: true,
            paymentId: paymentId,
            message: 'Platba byla inicializována',
            orderNumber: orderData.orderNumber,
            amount: orderData.total,
            timestamp: new Date().toISOString(),
            gw_url: `https://gw.gopay.com/mock-gateway?id=${paymentId}`
        };
    },

    /**
     * Simuluje vytvoření platby (původní metoda pro zpětnou kompatibilitu)
     */
    async createPayment(orderData: PaymentOrderData): Promise<PaymentResult> {
        const init = await this.initiatePayment(orderData);
        // Okamžitý úspěch u staré metody
        return {
            ...init,
            success: true
        };
    },

    /**
     * Simuluje kontrolu stavu platby
     */
    async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Pokud ID začíná na GP-, simulujeme že je zaplaceno (pro testy)
        return {
            paymentId: paymentId,
            status: 'PAID',
            paidAt: new Date().toISOString()
        };
    }
};

export default mockPaymentService;
