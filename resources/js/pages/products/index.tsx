import { Head } from '@inertiajs/react';
import StorefrontPagination from '@/components/storefront-pagination';
import CustomerLayout from '@/layouts/customer-layout';
import ProductCard, {
    type CatalogProduct,
} from '@/pages/products/product-card';
import { index } from '@/routes/products';

type Props = {
    products: {
        data: CatalogProduct[];
        current_page: number;
        last_page: number;
        total: number;
    };
};

export default function ProductsIndex({ products }: Props) {
    return (
        <CustomerLayout>
            <Head title="Produk" />
            <section
                aria-labelledby="catalog-heading"
                className="mx-auto max-w-7xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-24"
            >
                <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#dce5da] pb-5 sm:mb-10 sm:pb-7">
                    <h1
                        id="catalog-heading"
                        className="font-serif text-3xl tracking-tight text-[#263e30] sm:text-4xl"
                    >
                        Produk
                    </h1>
                    <p className="pb-1 text-sm text-muted">
                        {products.total} produk
                    </p>
                </div>
                {products.data.length === 0 ? (
                    <div className="rounded-2xl border border-divider bg-white px-6 py-16 text-center text-muted">
                        Belum ada produk untuk ditampilkan.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 xl:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
                <StorefrontPagination
                    label="Halaman produk"
                    currentPage={products.current_page}
                    lastPage={products.last_page}
                    pageUrl={(page) => index.url({ query: { page } })}
                    showDisabled
                    className="mt-10"
                />
            </section>
        </CustomerLayout>
    );
}
