<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Services\ProductImageService;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariantValue;
use App\Models\VariantAttribute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products/index', [
            'products' => Product::query()
                ->with(['productAttributes.variantAttribute', 'images', 'variants.values', 'variants.images'])
                ->orderBy('id')
                ->paginate(10),
            'variantAttributes' => VariantAttribute::query()->orderBy('name')->get(),
        ]);
    }

    public function store(ProductRequest $request, ProductImageService $images): RedirectResponse
    {
        $images->transaction(function ($createdPaths, $removedPaths) use ($request, $images) {
            $this->lockActiveAttributes($request->validated('attribute_ids'));
            $product = Product::create($request->safe()->only(['name', 'slug', 'description', 'is_active']));

            foreach ($request->validated('attribute_ids') as $id) {
                $product->productAttributes()->create(['variant_attribute_id' => $id]);
            }
            $images->sync($product->images(), $product->id, $request->file('images', []), [], required: true, maxImages: 10, createdPaths: $createdPaths, removedPaths: $removedPaths);
        });

        return back();
    }

    public function update(ProductRequest $request, Product $product, ProductImageService $images): RedirectResponse
    {
        $images->transaction(function ($createdPaths, $removedPaths) use ($request, $product, $images) {
            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $ids = $request->safe()->collect('attribute_ids')->map(fn ($id) => (int) $id)->sort()->values();
            $currentIds = $product->productAttributes()->pluck('variant_attribute_id')->sort()->values();
            $this->lockActiveAttributes($ids->all());

            $removedIds = $currentIds->diff($ids);
            if ($removedIds->isNotEmpty() && $product->variants()->where('is_active', true)->exists()) {
                throw ValidationException::withMessages([
                    'attribute_ids' => 'Deactivate or delete active variants before removing attributes.',
                ]);
            }

            $product->update($request->safe()->only(['name', 'slug', 'description', 'is_active']));
            ProductVariantValue::whereIn('product_attribute_id', $product->productAttributes()
                ->whereIn('variant_attribute_id', $removedIds)
                ->select('id'))->delete();
            $product->productAttributes()->whereNotIn('variant_attribute_id', $ids)->delete();
            foreach ($ids as $id) {
                $attribute = $product->productAttributes()->withTrashed()->firstOrCreate(['variant_attribute_id' => $id]);
                if ($attribute->trashed()) {
                    $attribute->restore();
                }
            }
            $images->sync($product->images(), $product->id, $request->file('images', []), $request->validated('removed_image_ids', []), required: true, maxImages: 10, createdPaths: $createdPaths, removedPaths: $removedPaths);
        });

        return back();
    }

    public function destroy(Product $product, ProductImageService $images): RedirectResponse
    {
        $images->transaction(function ($createdPaths, $removedPaths) use ($product) {
            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $productImages = ProductImage::where('product_id', $product->id)->get();
            foreach ($productImages as $image) {
                $removedPaths->push($image->path);
                $image->delete();
            }
            ProductVariantValue::whereIn('product_variant_id', $product->variants()->select('id'))->delete();
            $product->variants()->delete();
            $product->productAttributes()->delete();
            $product->delete();
        });

        return back();
    }

    /**
     * @param  array<int, int|string>  $ids
     */
    private function lockActiveAttributes(array $ids): void
    {
        $availableIds = VariantAttribute::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->pluck('id')
            ->map(fn ($id) => (int) $id)->all();
        $requestedIds = collect($ids)->map(fn ($id) => (int) $id)->sort()->values()->all();

        if ($availableIds !== $requestedIds) {
            throw ValidationException::withMessages([
                'attribute_ids' => 'One or more attributes are no longer available.',
            ]);
        }
    }
}
