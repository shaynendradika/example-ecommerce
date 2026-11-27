import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Directory from '@/pages/admin/directory';
import { customers as customersRoute } from '@/routes/admin';
import type { DirectoryPagination } from '@/types/directory';

type Props = {
    customers: DirectoryPagination;
};

export default function CustomersIndex({ customers }: Props) {
    return (
        <AdminLayout section="customers">
            <Head title="Customers" />
            <Directory
                entries={customers}
                addLabel="Add customer"
                pageUrl={(page) => customersRoute.url({ query: { page } })}
            />
        </AdminLayout>
    );
}
