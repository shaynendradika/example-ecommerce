import { Link, useForm } from '@inertiajs/react';
import { Form, Input, Modal, Select, Switch } from 'antd';
import { useState } from 'react';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/ProductController';
import { variantAttributes as attributesRoute } from '@/routes/admin';
import ImageUpload from '@/pages/admin/products/image-upload';
import type { Product, VariantAttribute } from '@/types/catalog';

type Props = {
    product: Product | null;
    attributes: VariantAttribute[];
    onClose: () => void;
};

export default function ProductModal({ product, attributes, onClose }: Props) {
    const hasActiveVariants = product?.variants.some(
        (variant) => variant.is_active,
    );
    const lockedAttributeIds = hasActiveVariants
        ? (product?.product_attributes.map(
              (item) => item.variant_attribute_id,
          ) ?? [])
        : [];
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
        Boolean(product),
    );
    const form = useForm({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        description: product?.description ?? '',
        is_active: product?.is_active ?? true,
        attribute_ids:
            product?.product_attributes.map(
                (item) => item.variant_attribute_id,
            ) ?? [],
        images: [] as File[],
        removed_image_ids: [] as number[],
    });
    const submit = () => {
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: onClose,
        };
        form.transform((data) => ({
            ...data,
            _method: product ? 'put' : 'post',
            _empty_attribute_ids: data.attribute_ids.length === 0,
        }));
        if (product) {
            form.post(update.url(product.id), options);
        } else {
            form.post(store.url(), options);
        }
    };
    const attributeError =
        form.errors.attribute_ids ??
        Object.entries(form.errors).find(([key]) =>
            key.startsWith('attribute_ids.'),
        )?.[1];
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
            title={product ? 'Edit product' : 'Add product'}
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
                    label="Product images"
                    required
                    validateStatus={imageError ? 'error' : undefined}
                    help={
                        imageError ??
                        'At least one image is required. JPEG, PNG or WebP, up to 5 MB each.'
                    }
                >
                    <ImageUpload
                        images={product?.images ?? []}
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
                    label="Name"
                    htmlFor="product-name"
                    required
                    validateStatus={form.errors.name ? 'error' : undefined}
                    help={form.errors.name}
                >
                    <Input
                        id="product-name"
                        value={form.data.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            form.setData((data) => ({
                                ...data,
                                name,
                                slug: isSlugManuallyEdited
                                    ? data.slug
                                    : name
                                          .normalize('NFKD')
                                          .replace(/[\u0300-\u036f]/g, '')
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]+/g, '-')
                                          .replace(/^-+|-+$/g, '')
                                          .slice(0, 255)
                                          .replace(/-+$/g, ''),
                            }));
                        }}
                        maxLength={255}
                    />
                </Form.Item>
                <Form.Item
                    label="Slug"
                    htmlFor="product-slug"
                    required
                    validateStatus={form.errors.slug ? 'error' : undefined}
                    help={
                        form.errors.slug ??
                        'Lowercase letters, numbers and hyphens only.'
                    }
                >
                    <Input
                        id="product-slug"
                        value={form.data.slug}
                        onChange={(e) => {
                            setIsSlugManuallyEdited(true);
                            form.setData('slug', e.target.value);
                        }}
                        maxLength={255}
                    />
                </Form.Item>
                <Form.Item
                    label="Description"
                    htmlFor="product-description"
                    validateStatus={
                        form.errors.description ? 'error' : undefined
                    }
                    help={form.errors.description}
                >
                    <Input.TextArea
                        id="product-description"
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                        rows={3}
                        maxLength={10000}
                    />
                </Form.Item>
                <Form.Item
                    label="Variant attributes"
                    htmlFor="product-attributes"
                    validateStatus={attributeError ? 'error' : undefined}
                    help={
                        attributeError ??
                        (product?.variants.length ? (
                            'New attributes need values on existing variants. Deactivate or delete active variants before removing attributes.'
                        ) : (
                            <span>
                                Optional. Manage options in{' '}
                                <Link href={attributesRoute()}>
                                    Variant Attribute
                                </Link>
                                .
                            </span>
                        ))
                    }
                >
                    <Select
                        id="product-attributes"
                        mode="multiple"
                        allowClear={!hasActiveVariants}
                        value={form.data.attribute_ids}
                        onChange={(value: number[]) =>
                            form.setData('attribute_ids', [
                                ...lockedAttributeIds.filter(
                                    (id) => !value.includes(id),
                                ),
                                ...value,
                            ])
                        }
                        options={attributes.map((attribute) => ({
                            value: attribute.id,
                            label: attribute.name,
                            disabled: lockedAttributeIds.includes(attribute.id),
                        }))}
                        placeholder="Select attributes"
                    />
                </Form.Item>
                <Form.Item
                    label="Active"
                    htmlFor="product-active"
                    validateStatus={form.errors.is_active ? 'error' : undefined}
                    help={form.errors.is_active}
                >
                    <Switch
                        id="product-active"
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
