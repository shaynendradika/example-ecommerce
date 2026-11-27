import CustomerLayout from '@/layouts/customer-layout';
import { formatRupiah } from '@/lib/currency';
import CartItems from '@/pages/cart/cart-items';
import { index as checkout } from '@/routes/checkout';
import { index as products } from '@/routes/products';
import type { Cart } from '@/types/customer';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function CartPage() {
    const { cart, errors } = usePage<{ cart: Cart }>().props;
    const [quantityPending, setQuantityPending] = useState(false);
    const total = cart.items.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.quantity,
        0,
    );

    return (
        <CustomerLayout>
            <Head title="Keranjang" />
            <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                <Link
                    href={products()}
                    className="text-sm font-semibold text-brand no-underline"
                >
                    &larr; Kembali ke Produk
                </Link>
                <h1 className="mt-6 font-serif text-4xl text-[#263e30]">
                    Keranjang
                </h1>
                {errors.cart && (
                    <p role="alert" className="mt-5 text-sm text-red-700">
                        {errors.cart}
                    </p>
                )}
                {cart.items.length === 0 ? (
                    <p className="mt-8 text-muted">
                        Keranjang masih kosong.{' '}
                        <Link
                            href={products()}
                            className="font-semibold text-brand underline"
                        >
                            Lihat produk
                        </Link>
                    </p>
                ) : (
                    <>
                        <div className="mt-6 border-y border-divider">
                            <CartItems
                                items={cart.items}
                                removable
                                onPendingChange={setQuantityPending}
                            />
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
                            <p className="font-semibold">
                                Total: {formatRupiah(total)}
                            </p>
                            {quantityPending ? (
                                <span
                                    aria-disabled="true"
                                    className="rounded-lg bg-brand px-6 py-3 font-semibold text-white opacity-50"
                                >
                                    Checkout
                                </span>
                            ) : (
                                <Link
                                    href={checkout()}
                                    className="rounded-lg bg-brand px-6 py-3 font-semibold text-white no-underline"
                                >
                                    Checkout
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </section>
        </CustomerLayout>
    );
}
