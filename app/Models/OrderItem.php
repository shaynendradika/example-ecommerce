<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['product_variant_id', 'product_name', 'variant_name', 'price', 'quantity'])]
class OrderItem extends Model
{
    protected function casts(): array
    {
        return ['price' => 'integer', 'quantity' => 'integer'];
    }
}
