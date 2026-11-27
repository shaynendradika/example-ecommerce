<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()
            ->with(['customer:id,name,email', 'items'])
            ->latest('id')
            ->paginate(10)
            ->through(fn (Order $order) => [
                ...$order->only(['id', 'invoice_number', 'status', 'total', 'created_at']),
                'customer' => $order->customer->only(['name', 'email']),
                'items' => $order->items->map(fn (OrderItem $item) => $item->only(['id', 'product_name', 'variant_name', 'quantity', 'price']))->all(),
            ]);

        return Inertia::render('admin/orders/index', ['orders' => $orders]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Order::STATUSES)],
        ]);
        $status = $validated['status'];

        DB::transaction(function () use ($order, $status): void {
            $current = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();
            $wasHolding = in_array($current->status, Order::STOCK_HOLDING_STATUSES, true);
            $willHold = in_array($status, Order::STOCK_HOLDING_STATUSES, true);

            if ($wasHolding !== $willHold) {
                $this->adjustStock($current, $willHold);
            }

            $current->update(['status' => $status]);
        }, 3);

        return back();
    }

    private function adjustStock(Order $order, bool $deduct): void
    {
        foreach ($order->items()->whereNotNull('product_variant_id')->orderBy('product_variant_id')->get() as $item) {
            $variants = ProductVariant::withTrashed()->whereKey($item->product_variant_id);

            if (! $deduct) {
                $variants->increment('stock', $item->quantity);

                continue;
            }

            if ($variants->where('stock', '>=', $item->quantity)->decrement('stock', $item->quantity) !== 1) {
                throw ValidationException::withMessages(['status' => "Insufficient stock for {$item->product_name}."]);
            }
        }
    }
}
