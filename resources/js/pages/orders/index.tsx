import { Head, Link } from '@inertiajs/react';
import StorefrontPagination from '@/components/storefront-pagination';
import CustomerLayout from '@/layouts/customer-layout';
import { formatRupiah } from '@/lib/currency';
import { index, show } from '@/routes/orders';
import { index as products } from '@/routes/products';
import { orderStatusLabels, type Order } from '@/types/customer';

type Props = {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
    };
};

export default function OrdersIndex({ orders }: Props) {
    return (
        <CustomerLayout>
            <Head title="Pesanan Saya" />
            <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                <h1 className="font-serif text-4xl text-[#263e30]">
                    Pesanan Saya
                </h1>
                {orders.data.length === 0 ? (
                    <p className="mt-8 text-muted">
                        Belum ada pesanan.{' '}
                        <Link
                            href={products()}
                            className="font-semibold text-brand underline"
                        >
                            Lihat produk
                        </Link>
                    </p>
                ) : (
                    <div className="mt-8 flex flex-col gap-4">
                        {orders.data.map((order) => (
                            <Link
                                key={order.invoice_number}
                                href={show(order.invoice_number)}
                                className="block rounded-xl border border-[#dce5da] bg-white p-5 text-inherit no-underline hover:border-[#749b7e]"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="font-semibold wrap-anywhere">
                                        {order.invoice_number}
                                    </h2>
                                    <span className="text-sm text-[#617569]">
                                        {orderStatusLabels[order.status]}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-muted">
                                    {order.items
                                        .map((item) => item.product_name)
                                        .join(', ')}
                                </p>
                                <p className="mt-2 font-semibold text-brand">
                                    {formatRupiah(order.total)}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
                <StorefrontPagination
                    label="Halaman pesanan"
                    currentPage={orders.current_page}
                    lastPage={orders.last_page}
                    pageUrl={(page) => index.url({ query: { page } })}
                    className="mt-8"
                />
            </section>
        </CustomerLayout>
    );
}
