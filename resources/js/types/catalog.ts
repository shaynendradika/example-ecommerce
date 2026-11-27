export type Pagination<T> = {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
};

export type VariantAttribute = {
    id: number;
    name: string;
    code: string;
    product_attributes_count: number;
};

export type ProductAttribute = {
    id: number;
    variant_attribute_id: number;
    variant_attribute: VariantAttribute;
};

export type VariantValue = {
    product_attribute_id: number;
    value: string;
};

export type CatalogImage = {
    id: number;
    url: string;
};

export type ProductVariant = {
    id: number;
    sku: string;
    price: number;
    stock: number;
    is_active: boolean;
    values: VariantValue[];
    images: CatalogImage[];
};

export type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    product_attributes: ProductAttribute[];
    variants: ProductVariant[];
    images: CatalogImage[];
};
