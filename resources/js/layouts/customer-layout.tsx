import {
    DeleteOutlined,
    DownOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { formatRupiah } from '@/lib/currency';
import { destroy, index as cartIndex } from '@/routes/cart';
import { index as checkout } from '@/routes/checkout';
import { login, logout } from '@/routes/customer';
import { index as orders } from '@/routes/orders';
import { index } from '@/routes/products';
import type { Cart, Customer } from '@/types/customer';

type Props = {
    children: ReactNode;
};

export default function CustomerLayout({ children }: Props) {
    const menusRef = useRef<HTMLDivElement>(null);
    const { cart, customer } = usePage<{
        cart: Cart;
        customer: Customer | null;
    }>().props;

    useEffect(() => {
        function closeMenus(event: PointerEvent | KeyboardEvent) {
            const menus = menusRef.current;
            if (!menus) return;

            if (event instanceof KeyboardEvent && event.key !== 'Escape')
                return;
            if (
                event instanceof PointerEvent &&
                event.target instanceof Node &&
                menus.contains(event.target)
            )
                return;

            menus
                .querySelectorAll<HTMLDetailsElement>('details[open]')
                .forEach((menu) => {
                    menu.open = false;
                    if (event instanceof KeyboardEvent) {
                        menu.querySelector<HTMLElement>('summary')?.focus();
                    }
                });
        }

        document.addEventListener('pointerdown', closeMenus);
        document.addEventListener('keydown', closeMenus);
        return () => {
            document.removeEventListener('pointerdown', closeMenus);
            document.removeEventListener('keydown', closeMenus);
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-page text-ink">
            <header className="border-b border-divider bg-surface">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 gap-y-4 px-4 py-5 sm:gap-x-6 sm:px-8 lg:gap-x-8">
                    <Link
                        href={index()}
                        className="order-1 flex w-fit items-center gap-2 text-ink no-underline sm:gap-3"
                    >
                        <span className="font-serif text-xl font-semibold">
                            Example
                        </span>
                    </Link>
                    <nav
                        aria-label="Navigasi utama"
                        className="order-3 flex w-full flex-wrap items-center gap-x-6 gap-y-3 text-sm sm:gap-x-8 lg:order-2 lg:ml-auto lg:w-auto"
                    >
                        <span aria-disabled="true" className="text-muted">
                            Beranda
                        </span>
                        <Link
                            href={index()}
                            aria-current="page"
                            className="font-semibold text-brand no-underline"
                        >
                            Produk
                        </Link>
                        <span aria-disabled="true" className="text-muted">
                            Tentang Kami
                        </span>
                        <span aria-disabled="true" className="text-muted">
                            Kontak
                        </span>
                    </nav>
                    <div
                        ref={menusRef}
                        className={`relative order-2 ml-auto items-center gap-1 text-xs sm:gap-3 sm:text-sm lg:order-3 lg:ml-0 ${customer ? 'flex' : 'grid auto-cols-fr grid-flow-col'}`}
                    >
                        <details
                            name="customer-header"
                            className={customer ? 'sm:relative' : ''}
                        >
                            <summary
                                aria-label={`Keranjang (${cart.count})`}
                                className="flex h-8 cursor-pointer list-none items-center justify-center gap-1 rounded-lg border border-[#d7e3d6] px-2 font-semibold whitespace-nowrap text-brand"
                            >
                                <ShoppingCartOutlined aria-hidden="true" />
                                {cart.count}
                            </summary>
                            <div className="absolute right-0 z-20 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-divider bg-white p-4 shadow-lg">
                                <h2 className="font-semibold">Keranjang</h2>
                                {cart.items.length === 0 ? (
                                    <p className="mt-4 text-muted">
                                        Keranjang masih kosong.
                                    </p>
                                ) : (
                                    <ul className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto">
                                        {cart.items.map((item) => (
                                            <li
                                                key={item.variant_id}
                                                className="flex gap-3 border-b border-divider pb-3"
                                            >
                                                {item.image_url && (
                                                    <img
                                                        src={item.image_url}
                                                        alt=""
                                                        className="h-14 w-14 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {item.variant}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {item.quantity} x{' '}
                                                        {item.price === null
                                                            ? 'Harga tidak tersedia'
                                                            : formatRupiah(
                                                                  item.price,
                                                              )}
                                                    </p>
                                                    {!item.available && (
                                                        <p className="text-xs text-red-700">
                                                            Stok tidak tersedia.
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-label={`Hapus ${item.name}, ${item.variant} dari keranjang`}
                                                    title="Hapus"
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                                    onClick={() =>
                                                        router.delete(
                                                            destroy(
                                                                item.variant_id,
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <DeleteOutlined aria-hidden="true" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <Link
                                        href={cartIndex()}
                                        className="flex-1 text-center font-semibold text-brand underline"
                                    >
                                        Lihat Keranjang
                                    </Link>
                                    {cart.items.length > 0 && (
                                        <Link
                                            href={checkout()}
                                            className="flex-1 rounded-lg bg-brand px-4 py-2 text-center font-semibold text-white no-underline"
                                        >
                                            Checkout
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </details>
                        {customer ? (
                            <details
                                name="customer-header"
                                className="relative"
                            >
                                <summary
                                    aria-label="Akun"
                                    className="flex h-8 cursor-pointer list-none items-center gap-1 rounded-lg border border-[#d7e3d6] px-2 font-semibold text-brand"
                                >
                                    <UserOutlined aria-hidden="true" />
                                    <span className="hidden sm:inline-flex">
                                        <DownOutlined aria-hidden="true" />
                                    </span>
                                </summary>
                                <div className="absolute right-0 z-20 mt-2 flex w-40 flex-col rounded-xl border border-divider bg-white p-2 text-sm shadow-lg">
                                    <Link
                                        href={orders()}
                                        className="rounded-lg px-3 py-2 font-semibold text-brand no-underline hover:bg-[#edf3e9]"
                                    >
                                        Pesanan Saya
                                    </Link>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        className="rounded-lg px-3 py-2 text-left font-semibold text-brand hover:bg-[#edf3e9]"
                                    >
                                        Keluar
                                    </Link>
                                </div>
                            </details>
                        ) : (
                            <Link
                                href={login()}
                                className="flex h-8 items-center justify-center rounded-lg border border-[#d7e3d6] px-2 font-semibold text-brand no-underline"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-divider bg-surface">
                <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-muted sm:px-8">
                    Example
                </div>
            </footer>
        </div>
    );
}
