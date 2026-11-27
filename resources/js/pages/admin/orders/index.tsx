import { Head, router } from '@inertiajs/react';
import { Button, message, Modal, Select, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Admin/OrderController';
import AdminLayout from '@/layouts/admin-layout';
import { formatRupiah } from '@/lib/currency';
import { orders as ordersRoute } from '@/routes/admin';
import type { Pagination } from '@/types/catalog';
import type { Order } from '@/types/customer';

type AdminOrder = {
    id: number;
    invoice_number: string;
    status: Order['status'];
    total: number;
    created_at: string | null;
    customer: { name: string; email: string };
    items: {
        id: number;
        product_name: string;
        variant_name: string;
        quantity: number;
        price: number;
    }[];
};

const statuses: Record<AdminOrder['status'], { label: string; color: string }> =
    {
        pending: { label: 'Pending', color: 'default' },
        paid: { label: 'Paid', color: 'blue' },
        processing: { label: 'Processing', color: 'gold' },
        delivery: { label: 'In Delivery', color: 'cyan' },
        arrived: { label: 'Arrived', color: 'lime' },
        completed: { label: 'Completed', color: 'green' },
        cancelled: { label: 'Cancelled', color: 'red' },
    };

const statusOptions = Object.entries(statuses).map(([value, { label }]) => ({
    value,
    label,
}));

function EditStatusModal({
    order,
    onClose,
}: {
    order: AdminOrder | null;
    onClose: () => void;
}) {
    const [messageApi, messageContext] = message.useMessage();
    const [status, setStatus] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    return (
        <>
            {messageContext}
            <Modal
                open={order !== null}
                title={order ? `Edit ${order.invoice_number}` : ''}
                okText="Save"
                okButtonProps={{
                    disabled: status === null || status === order?.status,
                    loading: saving,
                }}
                onOk={() => {
                    if (!order || status === null) {
                        return;
                    }

                    setSaving(true);
                    router.patch(
                        update.url(order.id),
                        { status },
                        {
                            preserveScroll: true,
                            onSuccess: onClose,
                            onError: (errors) =>
                                messageApi.error(
                                    errors.status ?? 'Unable to update order.',
                                ),
                            onFinish: () => setSaving(false),
                        },
                    );
                }}
                onCancel={onClose}
                afterOpenChange={(open) => !open && setStatus(null)}
                destroyOnHidden
            >
                {order && (
                    <Select
                        aria-label="Status"
                        className="w-full"
                        value={status ?? order.status}
                        onChange={setStatus}
                        options={statusOptions}
                    />
                )}
            </Modal>
        </>
    );
}

export default function OrdersIndex({
    orders,
}: {
    orders: Pagination<AdminOrder>;
}) {
    const [editing, setEditing] = useState<AdminOrder | null>(null);

    const columns: TableProps<AdminOrder>['columns'] = [
        { title: 'Invoice', dataIndex: 'invoice_number' },
        {
            title: 'Customer',
            render: (_, order) => (
                <>
                    <div>{order.customer.name}</div>
                    <Typography.Text type="secondary">
                        {order.customer.email}
                    </Typography.Text>
                </>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total',
            render: (total: number) => formatRupiah(total),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: AdminOrder['status']) => (
                <Tag color={statuses[status].color}>
                    {statuses[status].label}
                </Tag>
            ),
        },
        {
            key: 'actions',
            align: 'right',
            render: (_, order) => (
                <Button onClick={() => setEditing(order)}>Edit</Button>
            ),
        },
    ];

    return (
        <AdminLayout section="orders">
            <Head title="Orders" />
            <EditStatusModal order={editing} onClose={() => setEditing(null)} />
            <div className="overflow-hidden rounded-2xl border border-[#e4e9e1] bg-surface">
                <Table<AdminOrder>
                    rowKey="id"
                    columns={columns}
                    dataSource={orders.data}
                    scroll={{ x: 800 }}
                    expandable={{
                        expandedRowRender: (order) => (
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                dataSource={order.items}
                                columns={[
                                    {
                                        title: 'Product',
                                        dataIndex: 'product_name',
                                    },
                                    {
                                        title: 'Variant',
                                        dataIndex: 'variant_name',
                                    },
                                    { title: 'Qty', dataIndex: 'quantity' },
                                    {
                                        title: 'Price',
                                        dataIndex: 'price',
                                        render: (price: number) =>
                                            formatRupiah(price),
                                    },
                                ]}
                            />
                        ),
                    }}
                    pagination={{
                        current: orders.current_page,
                        pageSize: orders.per_page,
                        total: orders.total,
                        showSizeChanger: false,
                        onChange: (page) =>
                            router.get(
                                ordersRoute.url({ query: { page } }),
                                {},
                                { preserveScroll: true },
                            ),
                    }}
                />
            </div>
        </AdminLayout>
    );
}
