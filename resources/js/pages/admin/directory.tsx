import { PlusOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import type { DirectoryPagination, DirectoryRecord } from '@/types/directory';

type Props = {
    entries: DirectoryPagination;
    addLabel: string;
    pageUrl: (page: number) => string;
};

const columns: TableProps<DirectoryRecord>['columns'] = [
    {
        title: 'ID',
        dataIndex: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
    },
    {
        title: 'Email status',
        dataIndex: 'email_verified_at',
        render: (verifiedAt: string | null) => (
            <Tag color={verifiedAt ? 'success' : 'default'}>
                {verifiedAt ? 'Verified' : 'Unverified'}
            </Tag>
        ),
    },
    {
        key: 'actions',
        render: () => (
            <Space>
                <Button>Edit</Button>
                <Button danger>Delete</Button>
            </Space>
        ),
    },
];

export default function Directory({ entries, addLabel, pageUrl }: Props) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#e4e9e1] bg-surface">
            <div className="flex justify-end px-5 pt-5 pb-4">
                <Button type="primary" icon={<PlusOutlined />}>
                    {addLabel}
                </Button>
            </div>
            <Table<DirectoryRecord>
                rowKey="id"
                columns={columns}
                dataSource={entries.data}
                scroll={{ x: 700 }}
                pagination={{
                    current: entries.current_page,
                    pageSize: entries.per_page,
                    total: entries.total,
                    showSizeChanger: false,
                    onChange: (page) =>
                        router.get(pageUrl(page), {}, { preserveScroll: true }),
                }}
            />
        </div>
    );
}
