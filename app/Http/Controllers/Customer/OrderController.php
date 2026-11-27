<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::where('customer_id', $request->user('customer')->id)
            ->with('items')
            ->latest('id')
            ->paginate(10)
            ->through(fn (Order $order) => $this->orderData($order));

        return Inertia::render('orders/index', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->customer_id === $request->user('customer')->id, 404);

        return Inertia::render('orders/show', ['order' => $this->orderData($order->load('items'))]);
    }

    public function pay(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->customer_id === $request->user('customer')->id, 404);

        DB::transaction(function () use ($order) {
            $updated = Order::whereKey($order->id)->where('status', Order::PENDING)->update(['status' => Order::PAID]);
            if ($updated !== 1) {
                throw ValidationException::withMessages(['order' => match (Order::whereKey($order->id)->value('status')) {
                    Order::CANCELLED => 'Pembayaran ditolak: pesanan ini sudah dibatalkan.',
                    Order::PENDING => 'Pembayaran gagal diproses. Silakan coba lagi.',
                    default => 'Pesanan ini sudah dibayar.',
                }]);
            }

            foreach ($order->items()->orderBy('product_variant_id')->get() as $item) {
                $updated = ProductVariant::whereKey($item->product_variant_id)
                    ->where('is_active', true)
                    ->where('stock', '>=', $item->quantity)
                    ->whereHas('product', fn ($query) => $query->where('is_active', true))
                    ->decrement('stock', $item->quantity);
                if ($updated !== 1) {
                    throw ValidationException::withMessages(['order' => "Pembayaran ditolak: stok {$item->product_name} ({$item->variant_name}) tidak mencukupi atau varian tidak lagi tersedia. Pesanan belum dibayar dan stok tidak berubah; silakan batalkan pesanan."]);
                }
            }
        }, 3);

        return redirect()->route('orders.show', $order);
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->customer_id === $request->user('customer')->id, 404);
        $updated = Order::whereKey($order->id)->where('status', Order::PENDING)->update(['status' => Order::CANCELLED]);
        if ($updated !== 1) {
            throw ValidationException::withMessages(['order' => Order::whereKey($order->id)->value('status') === Order::CANCELLED
                ? 'Pesanan ini sudah dibatalkan.'
                : 'Pembatalan ditolak: pesanan ini sudah dibayar.']);
        }

        return redirect()->route('orders.show', $order);
    }

    /** @return array<string, mixed> */
    private function orderData(Order $order): array
    {
        return [
            ...$order->only(['invoice_number', 'status', 'total']),
            'items' => $order->items->map(fn (OrderItem $item) => $item->only(['id', 'product_name', 'variant_name', 'quantity', 'price']))->all(),
        ];
    }
}
