import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const apiPassword = process.env.PACKETA_API_PASSWORD;
    if (!apiPassword) return res.status(500).json({ error: 'Missing Packeta password' });

    try {
        // 1. Get orders waiting for shipment or delivery (status = processing or shipped and have packetId)
        const { data: orders, error: dbError } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['processing', 'shipped'])
            .not('packeta_packet_id', 'is', null);

        if (dbError) throw dbError;
        if (!orders || orders.length === 0) return res.status(200).json({ success: true, message: 'No orders to sync', updated: 0 });

        const results = [];
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers['host'];
        const baseUrl = `${protocol}://${host}`;

        for (const order of orders) {
            // 2. Check status in Packeta
            const xml = `<?xml version="1.0" encoding="utf-8"?>
<packetStatus>
  <apiPassword>${apiPassword}</apiPassword>
  <packetId>${order.packeta_packet_id}</packetId>
</packetStatus>`;

            try {
                const packetaRes = await fetch(PACKETA_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
                    body: xml
                });

                const text = await packetaRes.text();

                // Packeta API returns a list of status changes
                const isDeliveredOrReady = text.includes('<statusId>7</statusId>') || text.includes('<statusId>5</statusId>');
                const hasBeenReceived = text.includes('<statusId>2</statusId>') ||
                    text.includes('<statusId>3</statusId>') ||
                    text.includes('<statusId>4</statusId>') ||
                    text.includes('<statusId>6</statusId>');

                let targetStatus = null;

                if (isDeliveredOrReady && order.status !== 'completed') {
                    // Mark as completed when delivered or ready for pickup
                    targetStatus = 'completed';
                } else if (hasBeenReceived && order.status === 'processing') {
                    // Make as shipped if accepted at branch
                    targetStatus = 'shipped';
                }

                if (targetStatus) {
                    // 3. Update status in Supabase
                    const { error: updateError } = await supabase
                        .from('orders')
                        .update({ status: targetStatus })
                        .eq('id', order.id);

                    if (updateError) throw updateError;

                    if (targetStatus === 'shipped') {
                        // 4. Send shipping email via our own endpoint
                        await fetch(`${baseUrl}/api/send-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: order.customer_email,
                                customerName: order.delivery_info?.firstName || order.customer_name,
                                orderNumber: order.id,
                                items: order.items,
                                total: order.total,
                                type: 'shipping',
                                trackingNumber: order.packeta_barcode
                            })
                        }).catch(err => console.error(`Email send failed for order ${order.id}:`, err));
                    }

                    results.push({ orderId: order.id, status: 'updated_and_notified', newStatus: targetStatus });
                } else {
                    results.push({ orderId: order.id, status: 'still_waiting' });
                }
            } catch (pErr) {
                console.error(`Error processing order ${order.id}:`, pErr);
                results.push({ orderId: order.id, status: 'error', error: String(pErr) });
            }
        }

        const updatedCount = results.filter(r => r.status === 'updated_and_notified').length;
        return res.status(200).json({ success: true, processed: results, updated: updatedCount });
    } catch (error: any) {
        console.error('Core sync error:', error);
        return res.status(500).json({ error: error.message });
    }
}
