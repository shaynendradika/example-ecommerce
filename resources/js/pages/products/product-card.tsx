import { PictureOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import { formatRupiah } from '@/lib/currency';
import { show } from '@/routes/products';

export type CatalogProduct = {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    starting_price: number | null;
};

export default function ProductCard({
    product,
    headingLevel = 2,
}: {
    product: CatalogProduct;
    headingLevel?: 2 | 3;
}) {
    const Heading = headingLevel === 2 ? 'h2' : 'h3';

    return (
        <article className="min-w-0">
            <Link
                href={show(product.slug)}
                className="group block rounded-xl text-inherit no-underline outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#2f6047]"
            >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#eaf0e7]">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                            loading="lazy"
                        />
                    ) : (
                        <div
                            role="img"
                            aria-label="Foto tidak tersedia"
                            className="text-placeholder"
                        >
                            <PictureOutlined
                                aria-hidden="true"
                                className="text-3xl"
                            />
                        </div>
                    )}
                    <span
                        aria-hidden="true"
                        className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-lg text-brand shadow-sm transition-colors group-hover:bg-brand group-hover:text-white"
                    >
                        &rarr;
                    </span>
                </div>
                <div className="pt-4">
                    <Heading className="text-sm font-semibold text-ink sm:text-base">
                        {product.name}
                    </Heading>
                    <p className="mt-1.5 text-sm text-muted">
                        {product.starting_price === null
                            ? 'Harga belum tersedia'
                            : `Mulai dari ${formatRupiah(product.starting_price)}`}
                    </p>
                </div>
            </Link>
        </article>
    );
}
