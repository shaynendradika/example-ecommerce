import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import CustomerLayout from '@/layouts/customer-layout';
import { formatRupiah } from '@/lib/currency';
import CartItems from '@/pages/cart/cart-items';
import { index as cartIndex } from '@/routes/cart';
import { store } from '@/routes/checkout';
import type { Cart } from '@/types/customer';

export default function Checkout() {
    const { cart } = usePage<{ cart: Cart }>().props;
    const { post, processing } = useForm({});
    const total = cart.items.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.quantity,
        0,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(store.url());
    }

    return (
        <CustomerLayout>
            <Head title="Checkout" />
            <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                <Link
                    href={cartIndex()}
                    className="text-sm font-semibold text-brand no-underline"
                >
                    &larr; Kembali ke Keranjang
                </Link>
                <h1 className="mt-6 font-serif text-4xl text-[#263e30]">
                    Checkout
                </h1>
                <div className="mt-6 border-y border-divider">
                    <CartItems items={cart.items} />
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
                    <p className="font-semibold">
                        Total: {formatRupiah(total)}
                    </p>
                    <form onSubmit={submit} className="ml-auto">
                        <button
                            disabled={processing}
                            type="submit"
                            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white disabled:opacity-50"
                        >
                            Lanjut ke Pembayaran
                        </button>
                    </form>
                </div>
            </section>
        </CustomerLayout>
    );
}
