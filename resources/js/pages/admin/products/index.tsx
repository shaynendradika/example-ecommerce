import { PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import {
    Button,
    Image,
    message,
    Popconfirm,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import {
    destroy as destroyProduct,
    index,
} from '@/actions/App/Http/Controllers/Admin/ProductController';
import { destroy as destroyVariant } from '@/actions/App/Http/Controllers/Admin/ProductVariantController';
import AdminLayout from '@/layouts/admin-layout';
import { formatRupiah } from '@/lib/currency';
import ProductModal from '@/pages/admin/products/product-modal';
import VariantModal from '@/pages/admin/products/variant-modal';
import type {
    Pagination,
    Product,
    ProductVariant,
    VariantAttribute,
    CatalogImage,
} from '@/types/catalog';

function imagePreview(images: CatalogImage[], name: string) {
    if (!images.length) {
        return <Typography.Text type="secondary">No image</Typography.Text>;
    }

    return (
        <Image.PreviewGroup items={images.map((image) => image.url)}>
            <Image
                width={48}
                height={48}
                style={{ objectFit: 'cover' }}
                src={images[0].url}
                alt={name}
            />
        </Image.PreviewGroup>
    );
}

type Props = {
    products: Pagination<Product>;
    variantAttributes: VariantAttribute[];
};

export default function ProductsIndex({ products, variantAttributes }: Props) {
    const [productModal, setProductModal] = useState<{
        product: Product | null;
    } | null>(null);
    const [variantModal, setVariantModal] = useState<{
        product: Product;
        variant: ProductVariant | null;
    } | null>(null);
    const [messageApi, messageContext] = message.useMessage();

    const variantColumns = (
        product: Product,
    ): TableProps<ProductVariant>['columns'] => [
        {
            title: 'Image',
            render: (_, variant) => imagePreview(variant.images, variant.sku),
        },
        { title: 'SKU', dataIndex: 'sku' },
        {
            title: 'Options',
            render: (_, variant) =>
                product.product_attributes.length ? (
                    <Space size={[4, 4]} wrap>
                        {product.product_attributes.map((attribute) => {
                            const value = variant.values.find(
                                (item) =>
                                    item.product_attribute_id === attribute.id,
                            );
                            return (
                                <Tag
                                    key={attribute.id}
                                    color={value ? undefined : 'warning'}
                                >
                                    {attribute.variant_attribute.name}:{' '}
                                    {value?.value ?? 'Missing'}
                                </Tag>
                            );
                        })}
                    </Space>
                ) : (
                    <Typography.Text type="secondary">None</Typography.Text>
                ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (price: number) => formatRupiah(price),
        },
        { title: 'Stock', dataIndex: 'stock' },
        {
            title: 'Status',
            dataIndex: 'is_active',
            render: (active: boolean) => (
                <Tag color={active ? 'success' : 'default'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            key: 'actions',
            align: 'right',
            render: (_, variant) => (
                <Space>
                    <Button
                        onClick={() => setVariantModal({ product, variant })}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete variant?"
                        description="This removes the variant from the catalog."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                            router.delete(
                                destroyVariant.url({
                                    product: product.id,
                                    variant: variant.id,
                                }),
                                {
                                    preserveScroll: true,
                                    onError: () =>
                                        messageApi.error(
                                            'Unable to delete variant.',
                                        ),
                                },
                            )
                        }
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const columns: TableProps<Product>['columns'] = [
        { title: 'ID', dataIndex: 'id' },
        {
            title: 'Image',
            render: (_, product) => imagePreview(product.images, product.name),
        },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Slug', dataIndex: 'slug' },
        { title: 'Variants', render: (_, product) => product.variants.length },
        {
            title: 'Status',
            dataIndex: 'is_active',
            render: (active: boolean) => (
                <Tag color={active ? 'success' : 'default'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            key: 'actions',
            align: 'right',
            render: (_, product) => (
                <Space wrap>
                    <Button
                        onClick={() =>
                            setVariantModal({ product, variant: null })
                        }
                    >
                        Add variant
                    </Button>
                    <Button onClick={() => setProductModal({ product })}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete product?"
                        description="This removes the product and all its variants from the catalog."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() =>
                            router.delete(destroyProduct.url(product.id), {
                                preserveScroll: true,
                                onError: () =>
                                    messageApi.error(
                                        'Unable to delete product.',
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
        <AdminLayout section="products">
            <Head title="Product & Variant" />
            {messageContext}
            <div className="overflow-hidden rounded-2xl border border-[#e4e9e1] bg-surface">
                <div className="flex justify-end px-5 pt-5 pb-4">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setProductModal({ product: null })}
                    >
                        Add product
                    </Button>
                </div>
                <Table<Product>
                    rowKey="id"
                    columns={columns}
                    dataSource={products.data}
                    scroll={{ x: 900 }}
                    size="small"
                    expandable={{
                        expandedRowRender: (product) => (
                            <Table<ProductVariant>
                                rowKey="id"
                                columns={variantColumns(product)}
                                dataSource={product.variants}
                                pagination={false}
                                scroll={{ x: 850 }}
                                size="small"
                            />
                        ),
                    }}
                    pagination={{
                        current: products.current_page,
                        pageSize: products.per_page,
                        total: products.total,
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
            {productModal && (
                <ProductModal
                    product={productModal.product}
                    attributes={variantAttributes}
                    onClose={() => setProductModal(null)}
                />
            )}
            {variantModal && (
                <VariantModal
                    product={variantModal.product}
                    variant={variantModal.variant}
                    onClose={() => setVariantModal(null)}
                />
            )}
        </AdminLayout>
    );
}
