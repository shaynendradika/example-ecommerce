import { Link } from '@inertiajs/react';

type Props = {
    label: string;
    currentPage: number;
    lastPage: number;
    pageUrl: (page: number) => string;
    showDisabled?: boolean;
    className?: string;
};

export default function StorefrontPagination({
    label,
    currentPage,
    lastPage,
    pageUrl,
    showDisabled = false,
    className = '',
}: Props) {
    if (lastPage <= 1) return null;

    return (
        <nav
            aria-label={label}
            className={`flex items-center justify-center gap-5 text-sm ${className}`}
        >
            {currentPage > 1 ? (
                <Link
                    href={pageUrl(currentPage - 1)}
                    className="font-semibold text-brand"
                >
                    Sebelumnya
                </Link>
            ) : showDisabled ? (
                <span aria-disabled="true" className="text-muted">
                    Sebelumnya
                </span>
            ) : null}
            <span>
                Halaman {currentPage} dari {lastPage}
            </span>
            {currentPage < lastPage ? (
                <Link
                    href={pageUrl(currentPage + 1)}
                    className="font-semibold text-brand"
                >
                    Berikutnya
                </Link>
            ) : showDisabled ? (
                <span aria-disabled="true" className="text-muted">
                    Berikutnya
                </span>
            ) : null}
        </nav>
    );
}
