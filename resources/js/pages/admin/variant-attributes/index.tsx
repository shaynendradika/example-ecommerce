import { PlusOutlined } from '@ant-design/icons';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Table,
} from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import {
    destroy,
    index,
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/VariantAttributeController';
import AdminLayout from '@/layouts/admin-layout';
import type { Pagination, VariantAttribute } from '@/types/catalog';

type Props = { attributes: Pagination<VariantAttribute> };

function AttributeModal({
    attribute,
    onClose,
}: {
    attribute: VariantAttribute | null;
    onClose: () => void;
}) {
    const form = useForm({
        name: attribute?.name ?? '',
        code: attribute?.code ?? '',
    });
    const submit = () => {
        const options = { preserveScroll: true, onSuccess: onClose };
        if (attribute) {
            form.put(update.url(attribute.id), options);
        } else {
            form.post(store.url(), options);
        }
    };

    return (
        <Modal
            open
            title={attribute ? 'Edit attribute' : 'Add attribute'}
            onCancel={() => {
                if (!form.processing) onClose();
            }}
            onOk={submit}
            confirmLoading={form.processing}
            okText="Save"
            mask={{ closable: !form.processing }}
            keyboard={!form.processing}
            closable={!form.processing}
            cancelButtonProps={{ disabled: form.processing }}
        >
            <Form layout="vertical" onFinish={submit} className="pt-4">
                <Form.Item
                    label="Name"
                    htmlFor="attribute-name"
                    required
                    validateStatus={form.errors.name ? 'error' : undefined}
                    help={form.errors.name}
                >
                    <Input
                        id="attribute-name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        maxLength={255}
                    />
                </Form.Item>
                <Form.Item
                    label="Code"
                    htmlFor="attribute-code"
                    required
                    validateStatus={form.errors.code ? 'error' : undefined}
                    help={
                        form.errors.code ??
                        'Use lowercase letters, numbers, hyphens or underscores.'
                    }
                >
                    <Input
                        id="attribute-code"
                        value={form.data.code}
                        onChange={(e) => form.setData('code', e.target.value)}
                        maxLength={255}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default function AttributesIndex({ attributes }: Props) {
    const [editing, setEditing] = useState<VariantAttribute | null>(null);
    const [open, setOpen] = useState(false);
    const [messageApi, messageContext] = message.useMessage();
    const columns: TableProps<VariantAttribute>['columns'] = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Code', dataIndex: 'code' },
        { title: 'Products', dataIndex: 'product_attributes_count' },
        {
            key: 'actions',
            render: (_, attribute) => (
                <Space>
                    <Button
                        onClick={() => {
                            setEditing(attribute);
                            setOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete attribute?"
                        description="Attributes assigned to products cannot be deleted."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                            router.delete(destroy.url(attribute.id), {
                                preserveScroll: true,
                                onError: (errors) =>
                                    messageApi.error(
                                        errors.attribute ??
                                            'Unable to delete attribute.',
                                    ),
                            })
                        }
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AdminLayout section="variant-attributes">
            <Head title="Variant Attributes" />
            {messageContext}
            <div className="overflow-hidden rounded-2xl border border-[#e4e9e1] bg-surface">
                <div className="flex justify-end px-5 pt-5 pb-4">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditing(null);
                            setOpen(true);
                        }}
                    >
                        Add attribute
                    </Button>
                </div>
                <Table<VariantAttribute>
                    rowKey="id"
                    columns={columns}
                    dataSource={attributes.data}
                    scroll={{ x: 650 }}
                    pagination={{
                        current: attributes.current_page,
                        pageSize: attributes.per_page,
                        total: attributes.total,
                        showSizeChanger: false,
                        onChange: (page) =>
                            router.get(
                                index.url({ query: { page } }),
                                {},
                                { preserveScroll: true },
                            ),
                    }}
                />
            </div>
            {open && (
                <AttributeModal
                    attribute={editing}
                    onClose={() => setOpen(false)}
                />
            )}
        </AdminLayout>
    );
}
