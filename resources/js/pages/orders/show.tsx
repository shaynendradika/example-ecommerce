import { Head, Link, useForm, usePage } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { formatRupiah } from '@/lib/currency';
import { cancel, index, pay } from '@/routes/orders';
import { orderStatusLabels, type Order } from '@/types/customer';

export default function OrderShow({ order }: { order: Order }) {
    const { post, processing } = useForm({});
    const { errors } = usePage().props;

    return (
        <CustomerLayout>
            <Head title={`Pesanan ${order.invoice_number}`} />
            <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                <Link
                    href={index()}
                    className="text-sm font-semibold text-brand no-underline"
                >
                    &larr; Pesanan Saya
                </Link>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-serif text-2xl wrap-anywhere text-[#263e30] sm:text-4xl">
                        {order.invoice_number}
                    </h1>
                    <span className="rounded-full bg-[#edf3e9] px-4 py-2 text-sm font-semibold text-brand">
                        {orderStatusLabels[order.status]}
                    </span>
                </div>
                <ul className="mt-8 divide-y divide-[#e5ebe2] border-y border-divider">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex flex-wrap justify-between gap-4 py-5"
                        >
                            <div>
                                <p className="font-semibold">
                                    {item.product_name}
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    {item.variant_name}
                                </p>
                                <p className="mt-1 text-sm text-[#617569]">
                                    {item.quantity} x {formatRupiah(item.price)}
                                </p>
                            </div>
                            <p className="font-semibold">
                                {formatRupiah(item.price * item.quantity)}
                            </p>
                        </li>
                    ))}
                </ul>
                <p className="mt-6 text-lg font-semibold">
                    Total: {formatRupiah(order.total)}
                </p>
                {order.status === 'pending' && (
                    <div className="mt-8">
                        <h2 className="font-serif text-2xl">Pembayaran</h2>
                        {errors.order && (
                            <p
                                role="alert"
                                className="mt-4 text-sm text-red-700"
                            >
                                {errors.order}
                            </p>
                        )}
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() =>
                                    post(pay.url(order.invoice_number))
                                }
                                className="rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                Simulasi Pembayaran Berhasil
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() =>
                                    post(cancel.url(order.invoice_number))
                                }
                                className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 disabled:opacity-50"
                            >
                                Simulasi Batalkan Pesanan
                            </button>
                        </div>
                    </div>
                )}
                {order.status !== 'pending' && errors.order && (
                    <p role="alert" className="mt-4 text-sm text-red-700">
                        {errors.order}
                    </p>
                )}
            </section>
        </CustomerLayout>
    );
}
