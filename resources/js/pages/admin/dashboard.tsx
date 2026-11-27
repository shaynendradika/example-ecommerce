import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { orders } from '@/routes/admin';

type Props = {
    orderCounts: {
        pending: number;
        paid: number;
        processing: number;
        delivery: number;
    };
};

export default function Dashboard({ orderCounts }: Props) {
    const { auth } = usePage().props;
    const counts = [
        { label: 'Pending payment', value: orderCounts.pending },
        { label: 'Paid', value: orderCounts.paid },
        { label: 'Processing', value: orderCounts.processing },
        { label: 'In delivery', value: orderCounts.delivery },
    ];

    return (
        <AdminLayout section="dashboard">
            <Head title="Dashboard" />
            <h1 className="font-serif text-3xl text-[#234535]">Dashboard</h1>
            <p className="mt-2 text-sm text-muted">
                Welcome{auth.user?.name ? `, ${auth.user.name}` : ''}.
            </p>
            <section aria-labelledby="orders-heading" className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="orders-heading" className="text-xl font-semibold">
                        Orders
                    </h2>
                    <Link
                        href={orders()}
                        className="font-semibold text-brand underline"
                    >
                        View orders
                    </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {counts.map(({ label, value }) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-divider bg-surface p-5"
                        >
                            <p className="text-sm text-muted">{label}</p>
                            <p className="mt-2 text-3xl font-semibold text-ink">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </AdminLayout>
    );
}
