<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['customer_id', 'status', 'total'])]
class Order extends Model
{
    protected static function booted(): void
    {
        static::created(function (Order $order): void {
            $order->invoice_number = 'INV-'.$order->created_at->format('Y').'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT);
            $order->saveQuietly();
        });
    }

    public const PENDING = 'pending';

    public const PAID = 'paid';

    public const CANCELLED = 'cancelled';

    public const STATUSES = [self::PENDING, self::PAID, 'processing', 'delivery', 'arrived', 'completed', self::CANCELLED];

    public const STOCK_HOLDING_STATUSES = [self::PAID, 'processing', 'delivery', 'arrived', 'completed'];

    protected function casts(): array
    {
        return ['total' => 'integer'];
    }

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
