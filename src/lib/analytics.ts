declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq: any;
  }
}

interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
}

export const trackAddToCart = (item: AnalyticsItem) => {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'CZK',
      value: item.price * item.quantity,
      items: [item]
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_type: 'product',
      value: item.price * item.quantity,
      currency: 'CZK'
    });
  }
};

export const trackBeginCheckout = (items: AnalyticsItem[], value: number) => {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'CZK',
      value: value,
      items: items
    });
  }

  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(i => i.item_id),
      content_type: 'product',
      num_items: items.reduce((acc, i) => acc + i.quantity, 0),
      value: value,
      currency: 'CZK'
    });
  }
};

export const trackPurchase = (transaction_id: string, items: AnalyticsItem[], value: number) => {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transaction_id,
      currency: 'CZK',
      value: value,
      items: items
    });
  }

  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(i => i.item_id),
      content_type: 'product',
      value: value,
      currency: 'CZK'
    });
  }
};

export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return;
  
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: url,
    });
  }
  
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};
