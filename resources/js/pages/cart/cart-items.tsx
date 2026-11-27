import { DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { formatRupiah } from '@/lib/currency';
import { destroy, update } from '@/routes/cart';
import type { CartItem } from '@/types/customer';

function ProductDetails({
    item,
    editable,
}: {
    item: CartItem;
    editable: boolean;
}) {
    return (
        <div className="flex min-w-0 gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eaf0e7] text-placeholder">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <PictureOutlined aria-hidden="true" className="text-2xl" />
                )}
            </div>
            <div className="min-w-0">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.variant}</p>
                <p className="mt-1 text-sm text-[#617569]">
                    {!editable && `${item.quantity} x `}
                    {item.price === null
                        ? 'Harga tidak tersedia'
                        : formatRupiah(item.price)}
                </p>
                {!item.available && (
                    <p className="mt-2 text-sm font-semibold text-red-700">
                        Produk atau stok tidak tersedia. Periksa jumlah atau
                        hapus produk ini.
                    </p>
                )}
            </div>
        </div>
    );
}

function EditableCartItem({
    item,
    activeVariant,
    saving,
    setActiveVariant,
    setSaving,
}: {
    item: CartItem;
    activeVariant: number | null;
    saving: boolean;
    setActiveVariant: (id: number | null) => void;
    setSaving: (saving: boolean) => void;
}) {
    const [quantity, setQuantity] = useState(String(item.quantity));
    const [error, setError] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current !== null) {
                clearTimeout(timer.current);
            }
        },
        [],
    );

    function changeQuantity(value: string) {
        setQuantity(value);
        setError('');
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }

        if (value === String(item.quantity)) {
            setActiveVariant(null);
            return;
        }

        setActiveVariant(item.variant_id);
        if (
            !/^\d+$/.test(value) ||
            Number(value) < 1 ||
            Number(value) > 2147483647
        ) {
            setError('Masukkan jumlah bulat antara 1 dan 2147483647.');
            return;
        }

        timer.current = setTimeout(() => {
            timer.current = null;
            setSaving(true);
            router.patch(
                update.url(item.variant_id),
                { quantity: value },
                {
                    preserveScroll: true,
                    onSuccess: () => setActiveVariant(null),
                    onError: (errors) =>
                        setError(errors.quantity || 'Jumlah belum tersimpan.'),
                    onCancel: () => setError('Jumlah belum tersimpan.'),
                    onNetworkError: () => setError('Jumlah belum tersimpan.'),
                    onHttpException: () => setError('Jumlah belum tersimpan.'),
                    onFinish: () => setSaving(false),
                },
            );
        }, 500);
    }

    function remove() {
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        setActiveVariant(null);
        router.delete(destroy(item.variant_id), { preserveScroll: true });
    }

    return (
        <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_10rem_8rem_2.25rem]">
            <div className="col-span-2 min-w-0 sm:col-span-1">
                <ProductDetails item={item} editable />
            </div>
            <div className="col-span-2 sm:col-span-1">
                <label
                    htmlFor={`quantity-${item.variant_id}`}
                    className="mb-1 block text-sm font-semibold sm:sr-only"
                >
                    Jumlah
                </label>
                <input
                    id={`quantity-${item.variant_id}`}
                    aria-label={`Jumlah ${item.name}, ${item.variant}`}
                    aria-invalid={!!error}
                    aria-describedby={
                        error ? `quantity-error-${item.variant_id}` : undefined
                    }
                    type="number"
                    min="1"
                    max="2147483647"
                    step="1"
                    required
                    value={quantity}
                    onChange={(event) => changeQuantity(event.target.value)}
                    disabled={
                        saving ||
                        (activeVariant !== null &&
                            activeVariant !== item.variant_id)
                    }
                    className="w-20 rounded-lg border border-[#ccd8cb] px-2 py-2 disabled:opacity-50"
                />
                {saving && activeVariant === item.variant_id && (
                    <p role="status" className="mt-1 text-sm text-muted">
                        Menyimpan...
                    </p>
                )}
                {error && (
                    <p
                        id={`quantity-error-${item.variant_id}`}
                        role="alert"
                        className="mt-2 text-sm text-red-700"
                    >
                        {error}
                    </p>
                )}
            </div>
            <p className="min-w-0 font-semibold">
                <span className="mr-2 text-sm font-normal sm:hidden">
                    Total:
                </span>
                {item.price === null
                    ? 'Harga tidak tersedia'
                    : formatRupiah(item.price * item.quantity)}
            </p>
            <button
                type="button"
                aria-label={`Hapus ${item.name}, ${item.variant} dari keranjang`}
                title="Hapus"
                disabled={
                    saving ||
                    (activeVariant !== null &&
                        activeVariant !== item.variant_id)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                onClick={remove}
            >
                <DeleteOutlined aria-hidden="true" />
            </button>
        </li>
    );
}

export default function CartItems({
    items,
    removable = false,
    onPendingChange,
}: {
    items: CartItem[];
    removable?: boolean;
    onPendingChange?: (pending: boolean) => void;
}) {
    const [activeVariant, setActiveVariantState] = useState<number | null>(
        null,
    );
    const [saving, setSaving] = useState(false);

    function setActiveVariant(id: number | null) {
        setActiveVariantState(id);
        onPendingChange?.(id !== null);
    }

    return (
        <>
            {removable && (
                <div
                    aria-hidden="true"
                    className="hidden grid-cols-[minmax(0,1fr)_10rem_8rem_2.25rem] gap-4 border-b border-divider py-3 text-sm font-semibold text-muted sm:grid"
                >
                    <span>Produk</span>
                    <span>Jumlah</span>
                    <span>Total</span>
                </div>
            )}
            <ul className="divide-y divide-[#e5ebe2]">
                {items.map((item) =>
                    removable ? (
                        <EditableCartItem
                            key={item.variant_id}
                            item={item}
                            activeVariant={activeVariant}
                            saving={saving}
                            setActiveVariant={setActiveVariant}
                            setSaving={setSaving}
                        />
                    ) : (
                        <li key={item.variant_id} className="py-5">
                            <ProductDetails item={item} editable={false} />
                        </li>
                    ),
                )}
            </ul>
        </>
    );
}
