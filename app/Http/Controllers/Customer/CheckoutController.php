<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Services\CartService;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(Request $request, CartService $cart): Response|RedirectResponse
    {
        $contents = $cart->contents($request);
        if ($contents['items'] === [] || collect($contents['items'])->contains(fn ($item) => ! $item['available'])) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Periksa keranjang sebelum checkout.']);
        }

        return Inertia::render('checkout/index');
    }

    public function store(Request $request, CartService $cart): RedirectResponse
    {
        $customer = $request->user('customer');
        assert($customer instanceof Customer);

        try {
            $order = DB::transaction(function () use ($request, $cart, $customer) {
                Customer::whereKey($customer->id)->lockForUpdate()->firstOrFail();
                $contents = $cart->contents($request);
                if ($contents['items'] === [] || collect($contents['items'])->contains(fn ($item) => ! $item['available'])) {
                    throw ValidationException::withMessages(['cart' => 'Ada produk atau stok yang tidak tersedia. Periksa keranjang.']);
                }

                $total = 0;
                foreach ($contents['items'] as $item) {
                    if ($item['price'] === null || $item['price'] > intdiv(PHP_INT_MAX - $total, $item['quantity'])) {
                        throw ValidationException::withMessages(['cart' => 'Total keranjang terlalu besar. Kurangi produk sebelum checkout.']);
                    }
                    $total += $item['price'] * $item['quantity'];
                }
                $order = Order::create([
                    'customer_id' => $customer->id,
                    'status' => Order::PENDING,
                    'total' => $total,
                ]);
                foreach ($contents['items'] as $item) {
                    $order->items()->create([
                        'product_variant_id' => $item['variant_id'],
                        'product_name' => $item['name'],
                        'variant_name' => $item['variant'],
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                    ]);
                }
                CartItem::where('customer_id', $customer->id)->delete();

                return $order;
            }, 3);
        } catch (ValidationException $exception) {
            return redirect()->route('cart.index')->withErrors($exception->errors());
        }

        return redirect()->route('orders.show', $order);
    }
}
