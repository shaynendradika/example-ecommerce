import { useForm } from '@inertiajs/react';
import { Alert, Form, Input, InputNumber, Modal, Switch } from 'antd';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/ProductVariantController';
import { formatRupiah } from '@/lib/currency';
import ImageUpload from '@/pages/admin/products/image-upload';
import type { Product, ProductVariant } from '@/types/catalog';

type Props = {
    product: Product;
    variant: ProductVariant | null;
    onClose: () => void;
};

function formatPriceInput(
    value: string | undefined,
    info: { userTyping: boolean; input: string },
): string {
    if (info.userTyping) return info.input;
    if (!value) return '';
    if (value.includes('.')) return `Rp ${value.replace('.', ',')}`;

    return formatRupiah(Number(value));
}

function parsePriceInput(value: string | undefined): string {
    const amount = (value ?? '').replace(/Rp\s?/g, '');
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(amount)) {
        return amount.replace(/\./g, '').replace(',', '.');
    }

    return amount.replace(',', '.');
}

export default function VariantModal({ product, variant, onClose }: Props) {
    const form = useForm<{
        sku: string;
        price: string;
        stock: number | null;
        is_active: boolean;
        values: { product_attribute_id: number; value: string }[];
        images: File[];
        removed_image_ids: number[];
    }>({
        sku: variant?.sku ?? '',
        price: variant ? String(variant.price) : '',
        stock: variant?.stock ?? 0,
        is_active: variant?.is_active ?? true,
        values: product.product_attributes.map((attribute) => ({
            product_attribute_id: attribute.id,
            value:
                variant?.values.find(
                    (item) => item.product_attribute_id === attribute.id,
                )?.value ?? '',
        })),
        images: [],
        removed_image_ids: [],
    });
    const submit = () => {
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: onClose,
        };
        form.transform((data) => ({
            ...data,
            _method: variant ? 'put' : 'post',
            _empty_values: data.values.length === 0,
        }));
        if (variant) {
            form.post(
                update.url({ product: product.id, variant: variant.id }),
                options,
            );
        } else {
            form.post(store.url(product.id), options);
        }
    };
    const imageError = Object.entries(form.errors).find(
        ([key]) =>
            key === 'images' ||
            key.startsWith('images.') ||
            key === 'removed_image_ids' ||
            key.startsWith('removed_image_ids.'),
    )?.[1];

    return (
        <Modal
            open
            title={
                variant
                    ? `Edit variant - ${product.name}`
                    : `Add variant - ${product.name}`
            }
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
                    label="Variant image"
                    validateStatus={imageError ? 'error' : undefined}
                    help={
                        imageError ??
                        'Optional. Maximum one image; remove the existing image to replace it.'
                    }
                >
                    <ImageUpload
                        images={variant?.images ?? []}
                        maxCount={1}
                        onChange={(uploads, removedIds) =>
                            form.setData((data) => ({
                                ...data,
                                images: uploads,
                                removed_image_ids: removedIds,
                            }))
                        }
                    />
                </Form.Item>
                <Form.Item
                    label="SKU"
                    htmlFor="variant-sku"
                    required
                    validateStatus={form.errors.sku ? 'error' : undefined}
                    help={form.errors.sku}
                >
                    <Input
                        id="variant-sku"
                        value={form.data.sku}
                        onChange={(e) => form.setData('sku', e.target.value)}
                        maxLength={255}
                    />
                </Form.Item>
                <Form.Item
                    label="Price"
                    htmlFor="variant-price"
                    required
                    validateStatus={form.errors.price ? 'error' : undefined}
                    help={form.errors.price}
                >
                    <InputNumber
                        id="variant-price"
                        stringMode
                        min="0"
                        max="9999999999"
                        formatter={formatPriceInput}
                        parser={parsePriceInput}
                        value={form.data.price}
                        onChange={(value) => form.setData('price', value ?? '')}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                <Form.Item
                    label="Stock"
                    htmlFor="variant-stock"
                    required
                    validateStatus={form.errors.stock ? 'error' : undefined}
                    help={form.errors.stock}
                >
                    <InputNumber
                        id="variant-stock"
                        min={0}
                        max={2147483647}
                        precision={0}
                        value={form.data.stock}
                        onChange={(value) => form.setData('stock', value)}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
                {form.errors.values && (
                    <Alert
                        type="error"
                        showIcon
                        message={form.errors.values}
                        className="mb-4"
                    />
                )}
                {product.product_attributes.map((attribute, index) => {
                    const error =
                        form.errors[`values.${index}.value`] ??
                        form.errors[`values.${index}.product_attribute_id`];
                    return (
                        <Form.Item
                            key={attribute.id}
                            label={attribute.variant_attribute.name}
                            htmlFor={`variant-value-${attribute.id}`}
                            required
                            validateStatus={error ? 'error' : undefined}
                            help={error}
                        >
                            <Input
                                id={`variant-value-${attribute.id}`}
                                value={form.data.values[index].value}
                                onChange={(event) =>
                                    form.setData(
                                        'values',
                                        form.data.values.map((item, i) =>
                                            i === index
                                                ? {
                                                      ...item,
                                                      value: event.target.value,
                                                  }
                                                : item,
                                        ),
                                    )
                                }
                                maxLength={255}
                            />
                        </Form.Item>
                    );
                })}
                <Form.Item
                    label="Active"
                    htmlFor="variant-active"
                    validateStatus={form.errors.is_active ? 'error' : undefined}
                    help={form.errors.is_active}
                >
                    <Switch
                        id="variant-active"
                        checked={form.data.is_active}
                        onChange={(checked) =>
                            form.setData('is_active', checked)
                        }
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
