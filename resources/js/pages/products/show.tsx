import { PictureOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';
import { notification } from 'antd';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import CustomerLayout from '@/layouts/customer-layout';
import { formatRupiah } from '@/lib/currency';
import ProductCard, {
    type CatalogProduct,
} from '@/pages/products/product-card';
import { store } from '@/routes/cart';
import { index as checkout } from '@/routes/checkout';
import { index } from '@/routes/products';

type Image = { id: number; url: string };
type Variant = {
    id: number;
    sku: string;
    price: number;
    stock: number;
    options: { name: string; value: string | null }[];
    images: Image[];
};
type Product = {
    name: string;
    slug: string;
    description_html: string | null;
    images: Image[];
    variants: Variant[];
};

function isAvailable(variant: Variant) {
    return (
        variant.stock > 0 &&
        variant.options.every((option) => option.value !== null)
    );
}

export default function ProductShow({
    product,
    recommendations,
}: {
    product: Product;
    recommendations: CatalogProduct[];
}) {
    const [notice, noticeContext] = notification.useNotification();
    const [selectedId, setSelectedId] = useState<number | null>(
        product.variants.find(isAvailable)?.id ??
            product.variants[0]?.id ??
            null,
    );
    const [imageId, setImageId] = useState<number | null>(null);
    const selected = product.variants.find(
        (variant) => variant.id === selectedId,
    );
    const gallery = [
        ...product.images,
        ...product.variants.flatMap((variant) => variant.images),
    ];
    const image =
        gallery.find((item) => item.id === imageId) ??
        selected?.images[0] ??
        gallery[0];
    const thumbnails = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = thumbnails.current;
        const thumbnail = container?.querySelector<HTMLElement>(
            `[data-image-id="${image?.id}"]`,
        );
        if (!container || !thumbnail) {
            return;
        }

        const bounds = container.getBoundingClientRect();
        const item = thumbnail.getBoundingClientRect();
        if (item.left < bounds.left) {
            container.scrollBy({
                left: item.left - bounds.left,
                behavior: 'smooth',
            });
        } else if (item.right > bounds.right) {
            container.scrollBy({
                left: item.right - bounds.right,
                behavior: 'smooth',
            });
        }
    }, [image?.id]);
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        variant_id: selectedId,
        quantity: '1',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(store.url(product.slug), {
            preserveScroll: true,
            onSuccess: () =>
                notice.success({
                    message: 'Produk ditambahkan ke keranjang',
                    btn: (
                        <div className="flex items-center gap-4">
                            <Link
                                href={index()}
                                className="font-semibold text-brand"
                            >
                                Lanjut belanja
                            </Link>
                            <Link
                                href={checkout()}
                                className="font-semibold text-brand"
                            >
                                Checkout
                            </Link>
                        </div>
                    ),
                }),
        });
    }

    return (
        <CustomerLayout>
            {noticeContext}
            <Head title={product.name} />
            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
                <Link
                    href={index()}
                    className="text-sm font-semibold text-brand no-underline"
                >
                    &larr; Kembali ke produk
                </Link>
                <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#eff3eb]">
                            {image ? (
                                <img
                                    src={image.url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div
                                    role="img"
                                    aria-label="Foto tidak tersedia"
                                    className="text-placeholder"
                                >
                                    <PictureOutlined
                                        aria-hidden="true"
                                        className="text-4xl"
                                    />
                                </div>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div
                                ref={thumbnails}
                                className="mt-3 flex scrollbar-brand snap-x gap-3 overflow-x-auto pb-3"
                            >
                                {gallery.map((item, index) => (
                                    <button
                                        key={item.id}
                                        data-image-id={item.id}
                                        type="button"
                                        aria-label={`Lihat foto ${index + 1}`}
                                        aria-pressed={item.id === image?.id}
                                        onClick={() => setImageId(item.id)}
                                        className={`aspect-square w-[calc((100%-2.25rem)/4)] shrink-0 snap-start overflow-hidden rounded-xl border-2 ${item.id === image?.id ? 'border-[#2f6047]' : 'border-transparent'}`}
                                    >
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="font-serif text-4xl">{product.name}</h1>
                        <p className="mt-4 text-2xl font-semibold text-brand">
                            {selected
                                ? formatRupiah(selected.price)
                                : 'Harga belum tersedia'}
                        </p>
                        <form onSubmit={submit} className="mt-8">
                            <fieldset>
                                <legend className="font-semibold">
                                    Pilih varian
                                </legend>
                                {product.variants.length === 0 ? (
                                    <p className="mt-3 text-sm text-muted">
                                        Varian belum tersedia.
                                    </p>
                                ) : (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                disabled={variant.stock <= 0}
                                                aria-pressed={
                                                    selectedId === variant.id
                                                }
                                                onClick={() => {
                                                    setSelectedId(variant.id);
                                                    setData(
                                                        'variant_id',
                                                        variant.id,
                                                    );
                                                    setImageId(null);
                                                    clearErrors();
                                                }}
                                                className={`rounded-lg border px-4 py-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${selectedId === variant.id ? 'border-[#2f6047] bg-[#edf3e9]' : 'border-[#d7e3d6]'}`}
                                            >
                                                <span className="block font-semibold">
                                                    {variant.options.length
                                                        ? variant.options
                                                              .map(
                                                                  (option) =>
                                                                      option.value ??
                                                                      'Belum tersedia',
                                                              )
                                                              .join(' - ')
                                                        : variant.sku}
                                                </span>
                                                {variant.stock <= 0 && (
                                                    <span className="sr-only">
                                                        {' '}
                                                        (stok habis)
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </fieldset>
                            {selected &&
                                selected.stock > 0 &&
                                !isAvailable(selected) && (
                                    <p className="mt-2 text-sm text-red-700">
                                        Pilihan varian belum lengkap.
                                    </p>
                                )}
                            {errors.variant_id && (
                                <p
                                    role="alert"
                                    className="mt-2 text-sm text-red-700"
                                >
                                    {errors.variant_id}
                                </p>
                            )}
                            <label
                                htmlFor="quantity"
                                className="mt-6 block font-semibold"
                            >
                                Jumlah
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max={selected?.stock}
                                step="1"
                                required
                                value={data.quantity}
                                onChange={(event) =>
                                    setData('quantity', event.target.value)
                                }
                                className="mt-2 w-28 rounded-lg border border-[#d7e3d6] bg-white px-3 py-2"
                            />
                            {selected && (
                                <p className="mt-2 text-sm text-muted">
                                    {selected.stock === 0
                                        ? 'Stok habis'
                                        : selected.stock < 10
                                          ? 'Stok hampir habis'
                                          : 'Stok tersedia'}
                                </p>
                            )}
                            {errors.quantity && (
                                <p
                                    role="alert"
                                    className="mt-2 text-sm text-red-700"
                                >
                                    {errors.quantity}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={
                                    !selected ||
                                    !isAvailable(selected) ||
                                    processing
                                }
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ShoppingCartOutlined /> Tambah ke Keranjang
                            </button>
                        </form>
                    </div>
                </div>
                <section
                    aria-labelledby="description-heading"
                    className="mt-12 border-t border-[#dce5da] pt-8 sm:mt-16"
                >
                    <h2
                        id="description-heading"
                        className="font-serif text-2xl text-[#263e30]"
                    >
                        Tentang Produk
                    </h2>
                    {product.description_html ? (
                        <div
                            className="mt-4 max-w-3xl space-y-4 text-sm leading-7 text-[#617569] [&_blockquote]:border-l-4 [&_blockquote]:border-[#dce5da] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h3]:pt-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-[#263e30] [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-[#263e30] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
                            dangerouslySetInnerHTML={{
                                __html: product.description_html,
                            }}
                        />
                    ) : (
                        <div className="mt-4 text-sm leading-7 text-[#617569]">
                            Deskripsi produk belum tersedia.
                        </div>
                    )}
                </section>
                {recommendations.length > 0 && (
                    <section
                        aria-labelledby="recommendations-heading"
                        className="mt-12 border-t border-[#dce5da] pt-8 sm:mt-16"
                    >
                        <h2
                            id="recommendations-heading"
                            className="font-serif text-2xl text-[#263e30]"
                        >
                            Produk Lainnya
                        </h2>
                        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                            {recommendations.map((recommendation) => (
                                <ProductCard
                                    key={recommendation.id}
                                    product={recommendation}
                                    headingLevel={3}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </CustomerLayout>
    );
}
