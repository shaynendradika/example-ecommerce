<?php

namespace App\Http\Services;

use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function mergeGuest(Request $request, Customer $customer): void
    {
        $quantities = $request->session()->get('cart', []);
        if ($quantities === []) {
            return;
        }

        DB::transaction(function () use ($customer, $quantities) {
            Customer::whereKey($customer->id)->lockForUpdate()->firstOrFail();
            $existingVariantIds = ProductVariant::withTrashed()->whereIn('id', array_keys($quantities))->pluck('id')->all();
            if (count($existingVariantIds) !== count($quantities)) {
                throw ValidationException::withMessages(['cart' => 'Hapus produk yang tidak tersedia dari keranjang sebelum masuk.']);
            }
            foreach ($quantities as $variantId => $quantity) {
                $item = CartItem::where('customer_id', $customer->id)->where('product_variant_id', $variantId)->first();
                $total = ($item->quantity ?? 0) + (int) $quantity;
                if ($total > CartItem::MAX_QUANTITY) {
                    throw ValidationException::withMessages(['cart' => 'Jumlah produk di keranjang terlalu besar.']);
                }
                CartItem::updateOrCreate(
                    ['customer_id' => $customer->id, 'product_variant_id' => $variantId],
                    ['quantity' => $total],
                );
            }
        });
    }

    public function add(Request $request, Product $product, int $variantId, int $quantity): void
    {
        DB::transaction(function () use ($request, $product, $variantId, $quantity) {
            $customer = $request->user('customer');
            if ($customer) {
                Customer::whereKey($customer->id)->lockForUpdate()->firstOrFail();
            }

            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $variant = $this->availableVariant($product, $variantId, 'variant_id');

            if ($customer) {
                $item = CartItem::where('customer_id', $customer->id)->where('product_variant_id', $variantId)->first();
                $total = ($item->quantity ?? 0) + $quantity;
            } else {
                $total = (int) $request->session()->get("cart.{$variantId}", 0) + $quantity;
            }

            if ($total > $variant->stock) {
                throw ValidationException::withMessages(['quantity' => 'Jumlah melebihi stok yang tersedia, termasuk produk di keranjang.']);
            }

            if ($customer) {
                CartItem::updateOrCreate(
                    ['customer_id' => $customer->id, 'product_variant_id' => $variantId],
                    ['quantity' => $total],
                );
            } else {
                $request->session()->put("cart.{$variantId}", $total);
            }
        });
    }

    public function update(Request $request, int $variantId, int $quantity): void
    {
        DB::transaction(function () use ($request, $variantId, $quantity): void {
            $customer = $request->user('customer');
            $item = null;
            if ($customer) {
                Customer::whereKey($customer->id)->lockForUpdate()->firstOrFail();
                $item = CartItem::where('customer_id', $customer->id)->where('product_variant_id', $variantId)->firstOrFail();
            } else {
                abort_unless($request->session()->has("cart.{$variantId}"), 404);
            }

            $variant = ProductVariant::whereKey($variantId)->first();
            $product = $variant ? Product::whereKey($variant->product_id)->lockForUpdate()->first() : null;
            if (! $product) {
                throw ValidationException::withMessages(['quantity' => 'Produk atau varian tidak tersedia.']);
            }
            $variant = $this->availableVariant($product, $variantId, 'quantity');

            if ($quantity > $variant->stock) {
                throw ValidationException::withMessages(['quantity' => 'Jumlah melebihi stok yang tersedia.']);
            }

            if ($item) {
                $item->update(['quantity' => $quantity]);
            } else {
                $request->session()->put("cart.{$variantId}", $quantity);
            }
        });
    }

    private function availableVariant(Product $product, int $variantId, string $errorKey): ProductVariant
    {
        $variant = $product->variants()->whereKey($variantId)->lockForUpdate()->first();
        if (! $product->is_active || ! $variant || ! $variant->is_active) {
            throw ValidationException::withMessages([$errorKey => 'Varian tidak tersedia.']);
        }

        $attributeIds = $product->productAttributes()->pluck('id');
        if ($variant->values()->whereIn('product_attribute_id', $attributeIds)->count() !== $attributeIds->count()) {
            throw ValidationException::withMessages([$errorKey => 'Pilihan varian belum lengkap.']);
        }

        return $variant;
    }

    public function remove(Request $request, int $variantId): void
    {
        $customer = $request->user('customer');
        if ($customer) {
            DB::transaction(function () use ($customer, $variantId) {
                Customer::whereKey($customer->id)->lockForUpdate()->firstOrFail();
                CartItem::where('customer_id', $customer->id)->where('product_variant_id', $variantId)->delete();
            });
        } else {
            $request->session()->forget("cart.{$variantId}");
        }
    }

    /** @return array{count: int, items: list<array{variant_id: int, name: string, variant: string, quantity: int, price: int|null, image_url: string|null, available: bool}>} */
    public function contents(Request $request): array
    {
        $customer = $request->user('customer');
        $quantities = $customer
            ? CartItem::where('customer_id', $customer->id)->pluck('quantity', 'product_variant_id')->all()
            : $request->session()->get('cart', []);
        $variants = ProductVariant::withTrashed()
            ->with(['product' => fn ($query) => $query->withTrashed(), 'product.images', 'product.productAttributes', 'images', 'values'])
            ->whereIn('id', array_keys($quantities))
            ->get()
            ->keyBy('id');
        $items = [];
        foreach ($quantities as $id => $quantity) {
            $variant = $variants->get($id);
            $product = $variant?->product;
            $variantLabel = 'Varian tidak tersedia';
            if ($variant && $product) {
                $values = $variant->values->pluck('value', 'product_attribute_id');
                $variantLabel = $product->productAttributes
                    ->map(fn ($attribute) => $values->get($attribute->id, 'Belum tersedia'))
                    ->implode(' - ');
                if ($variantLabel === '') {
                    $variantLabel = 'Varian';
                }
            }
            $items[] = [
                'variant_id' => (int) $id,
                'name' => $product->name ?? 'Produk tidak tersedia',
                'variant' => $variantLabel,
                'quantity' => (int) $quantity,
                'price' => $variant?->price,
                'image_url' => $variant?->images->first()->url ?? $product?->images->first()->url ?? null,
                'available' => $variant !== null && $product !== null && ! $variant->trashed() && ! $product->trashed()
                    && $variant->is_active && $product->is_active && $variant->stock >= $quantity
                    && $product->productAttributes->every(fn ($attribute) => $variant->values->contains('product_attribute_id', $attribute->id)),
            ];
        }

        return ['count' => (int) array_sum($quantities), 'items' => $items];
    }
}
