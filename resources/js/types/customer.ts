export type CartItem = {
    variant_id: number;
    name: string;
    variant: string;
    quantity: number;
    price: number | null;
    image_url: string | null;
    available: boolean;
};

export type Cart = {
    count: number;
    items: CartItem[];
};

export type Customer = {
    id: number;
    name: string;
    email: string;
};

export type Order = {
    invoice_number: string;
    status:
        | 'pending'
        | 'paid'
        | 'processing'
        | 'delivery'
        | 'arrived'
        | 'completed'
        | 'cancelled';
    total: number;
    items: {
        id: number;
        product_name: string;
        variant_name: string;
        quantity: number;
        price: number;
    }[];
};

export const orderStatusLabels: Record<Order['status'], string> = {
    pending: 'Menunggu Pembayaran',
    paid: 'Dibayar',
    processing: 'Diproses',
    delivery: 'Dalam pengiriman',
    arrived: 'Tiba di tujuan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};
