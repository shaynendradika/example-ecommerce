import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes/admin';
import { index as products } from '@/routes/products';

export default function ErrorPage({ status }: { status: 404 | 500 }) {
    const isAdmin = usePage().url.startsWith('/admin');
    const title =
        status === 404
            ? isAdmin
                ? 'Page not found'
                : 'Halaman tidak ditemukan'
            : isAdmin
              ? 'Something went wrong'
              : 'Terjadi kesalahan';

    return (
        <main className="flex min-h-screen items-center justify-center bg-page px-5 text-ink">
            <Head title={title} />
            <div className="max-w-lg text-center">
                <p className="font-semibold text-muted">{status}</p>
                <h1 className="mt-3 font-serif text-4xl">{title}</h1>
                <Link
                    href={isAdmin ? dashboard() : products()}
                    className="mt-6 inline-block font-semibold text-brand underline"
                >
                    {isAdmin ? 'Back to dashboard' : 'Kembali ke produk'}
                </Link>
            </div>
        </main>
    );
}
