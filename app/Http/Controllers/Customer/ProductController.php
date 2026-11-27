<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = $this->catalogQuery()
            ->orderBy('id')
            ->paginate(12)
            ->through(fn (Product $product) => $this->catalogProduct($product));

        return Inertia::render('products/index', ['products' => $products]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);
        $product->load([
            'images',
            'productAttributes.variantAttribute',
            'variants' => fn ($query) => $query->where('is_active', true)->orderBy('id'),
            'variants.values',
            'variants.images',
        ]);

        return Inertia::render('products/show', [
            'product' => [
                'name' => $product->name,
                'slug' => $product->slug,
                'description_html' => blank($product->description) ? null : Str::markdown($product->description, [
                    'html_input' => 'strip',
                    'allow_unsafe_links' => false,
                ]),
                'images' => $product->images->map(fn ($image) => ['id' => $image->id, 'url' => $image->url]),
                'variants' => $product->variants->map(function ($variant) use ($product) {
                    $options = $product->productAttributes->map(function ($attribute) use ($variant) {
                        $value = $variant->values->firstWhere('product_attribute_id', $attribute->id);

                        return [
                            'name' => $attribute->variantAttribute->name,
                            'value' => $value?->value,
                        ];
                    });

                    return [
                        'id' => $variant->id,
                        'sku' => $variant->sku,
                        'price' => $variant->price,
                        'stock' => $variant->stock,
                        'options' => $options,
                        'images' => $variant->images->map(fn ($image) => ['id' => $image->id, 'url' => $image->url]),
                    ];
                }),
            ],
            'recommendations' => $this->catalogQuery()
                ->whereKeyNot($product->getKey())
                ->orderBy('id')
                ->limit(4)
                ->get()
                ->map(fn (Product $recommendation) => $this->catalogProduct($recommendation)),
        ]);
    }

    /** @return Builder<Product> */
    private function catalogQuery(): Builder
    {
        return Product::query()
            ->select(['id', 'name', 'slug'])
            ->where('is_active', true)
            ->with([
                'images' => fn ($query) => $query->select(['id', 'product_id', 'product_variant_id', 'path']),
                'variants' => fn ($query) => $query->select(['id', 'product_id'])->where('is_active', true)->whereHas('images')->orderBy('id'),
                'variants.images' => fn ($query) => $query->select(['id', 'product_id', 'product_variant_id', 'path']),
            ])
            ->withMin(['variants as starting_price' => fn (Builder $query) => $query->where('is_active', true)], 'price');
    }

    /**
     * @return array{id: int, name: string, slug: string, image_url: ?string, starting_price: ?int}
     */
    private function catalogProduct(Product $product): array
    {
        $price = $product->getAttribute('starting_price');

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'image_url' => $product->images->first()?->url ?? $product->variants->first()?->images->first()?->url,
            'starting_price' => $price === null ? null : (int) $price,
        ];
    }
}
