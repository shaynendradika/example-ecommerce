<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Services\CartService;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cart/index');
    }

    public function store(Request $request, Product $product, CartService $cart): RedirectResponse
    {
        $validated = $request->validate([
            'variant_id' => ['required', 'integer', 'min:1'],
            'quantity' => $this->quantityRules(),
        ], [
            'variant_id.required' => 'Pilih varian terlebih dahulu.',
            'variant_id.integer' => 'Varian tidak valid.',
            ...$this->quantityMessages(),
        ]);
        $cart->add($request, $product, (int) $validated['variant_id'], (int) $validated['quantity']);

        return back();
    }

    public function destroy(Request $request, int $variant, CartService $cart): RedirectResponse
    {
        $cart->remove($request, $variant);

        return back();
    }

    public function update(Request $request, int $variant, CartService $cart): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => $this->quantityRules(),
        ], $this->quantityMessages());
        $cart->update($request, $variant, (int) $validated['quantity']);

        return back();
    }

    /** @return list<string> */
    private function quantityRules(): array
    {
        return ['required', 'integer', 'min:1', 'max:'.CartItem::MAX_QUANTITY];
    }

    /** @return array<string, string> */
    private function quantityMessages(): array
    {
        return [
            'quantity.required' => 'Masukkan jumlah produk.',
            'quantity.integer' => 'Jumlah harus berupa bilangan bulat.',
            'quantity.min' => 'Jumlah minimal 1.',
            'quantity.max' => 'Jumlah terlalu besar.',
        ];
    }
}
