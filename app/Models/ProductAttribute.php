<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['variant_attribute_id'])]
class ProductAttribute extends Model
{
    use SoftDeletes;

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<VariantAttribute, $this> */
    public function variantAttribute(): BelongsTo
    {
        return $this->belongsTo(VariantAttribute::class);
    }
}
