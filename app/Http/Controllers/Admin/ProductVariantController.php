<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Http\Services\ProductImageService;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class ProductVariantController extends Controller
{
    public function store(ProductVariantRequest $request, Product $product, ProductImageService $images): RedirectResponse
    {
        $images->transaction(function ($createdPaths, $removedPaths) use ($request, $product, $images) {
            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $this->validateValues($request, $product);
            $variant = $product->variants()->create($request->safe()->only(['sku', 'price', 'stock', 'is_active']));
            $variant->values()->createMany($request->validated('values'));
            $images->sync($variant->images(), $product->id, $request->file('images', []), [], required: false, maxImages: 1, createdPaths: $createdPaths, removedPaths: $removedPaths);
        });

        return back();
    }

    public function update(ProductVariantRequest $request, Product $product, ProductVariant $variant, ProductImageService $images): RedirectResponse
    {
        $images->transaction(function ($createdPaths, $removedPaths) use ($request, $product, $variant, $images) {
            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $variant = $product->variants()->whereKey($variant->id)->firstOrFail();
            $this->validateValues($request, $product);
            $variant->update($request->safe()->only(['sku', 'price', 'stock', 'is_active']));
            foreach ($request->validated('values') as $value) {
                $variantValue = $variant->values()->withTrashed()->updateOrCreate(
                    ['product_attribute_id' => $value['product_attribute_id']],
                    ['value' => $value['value']],
                );
                if ($variantValue->trashed()) {
                    $variantValue->restore();
                }
            }
            $images->sync($variant->images(), $product->id, $request->file('images', []), $request->validated('removed_image_ids', []), required: false, maxImages: 1, createdPaths: $createdPaths, removedPaths: $removedPaths);
        });

        return back();
    }

    public function destroy(Product $product, ProductVariant $variant, ProductImageService $images): RedirectResponse
    {
        $images->transaction(function ($createdPaths, $removedPaths) use ($product, $variant) {
            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $variant = $product->variants()->whereKey($variant->id)->firstOrFail();
            foreach ($variant->images()->get() as $image) {
                $removedPaths->push($image->path);
                $image->delete();
            }
            $variant->values()->delete();
            $variant->delete();
        });

        return back();
    }

    private function validateValues(ProductVariantRequest $request, Product $product): void
    {
        $expected = $product->productAttributes()->pluck('id')->sort()->values()->all();
        $submitted = $request->safe()->collect('values')
            ->pluck('product_attribute_id')->map(fn ($id) => (int) $id)->sort()->values()->all();

        if ($expected !== $submitted) {
            throw ValidationException::withMessages([
                'values' => "Provide a value for each of this product's attributes.",
            ]);
        }
    }
}
