import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Directory from '@/pages/admin/directory';
import { employees as employeesRoute } from '@/routes/admin';
import type { DirectoryPagination } from '@/types/directory';

type Props = {
    employees: DirectoryPagination;
};

export default function EmployeesIndex({ employees }: Props) {
    return (
        <AdminLayout section="employees">
            <Head title="Employees" />
            <Directory
                entries={employees}
                addLabel="Add employee"
                pageUrl={(page) => employeesRoute.url({ query: { page } })}
            />
        </AdminLayout>
    );
}
