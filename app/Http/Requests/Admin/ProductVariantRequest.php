<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductVariantRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->boolean('_empty_values')) {
            $this->merge(['values' => []]);
        }
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user('web') !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        $product = $this->route('product');
        abort_unless($product instanceof Product, 404);

        return [
            'sku' => ['required', 'string', 'max:255', Rule::unique('product_variants')->ignore($this->route('variant'))],
            'price' => ['required', 'integer', 'min:0', 'max:9999999999'],
            'stock' => ['required', 'integer', 'min:0', 'max:'.ProductVariant::MAX_STOCK],
            'is_active' => ['required', 'boolean'],
            'values' => ['present', 'array', 'max:50'],
            'values.*' => ['required', 'array:product_attribute_id,value'],
            'values.*.product_attribute_id' => [
                'required', 'integer', 'distinct',
                Rule::exists('product_attributes', 'id')->where('product_id', $product->id)->whereNull('deleted_at'),
            ],
            'values.*.value' => ['required', 'string', 'max:255'],
            'images' => ['nullable', 'array', 'max:1'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=4096,max_height=4096'],
            'removed_image_ids' => ['nullable', 'array', 'max:10'],
            'removed_image_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }
}
