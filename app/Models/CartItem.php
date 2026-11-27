<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['customer_id', 'product_variant_id', 'quantity'])]
class CartItem extends Model
{
    public const MAX_QUANTITY = 2147483647;
}
