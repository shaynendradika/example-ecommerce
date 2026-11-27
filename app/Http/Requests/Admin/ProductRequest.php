<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->boolean('_empty_attribute_ids')) {
            $this->merge(['attribute_ids' => []]);
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('products')->ignore($this->route('product'))],
            'description' => ['nullable', 'string', 'max:10000'],
            'is_active' => ['required', 'boolean'],
            'attribute_ids' => ['present', 'array', 'max:50'],
            'attribute_ids.*' => ['required', 'integer', 'distinct', Rule::exists('variant_attributes', 'id')->whereNull('deleted_at')],
            'images' => [$this->isMethod('post') ? 'required' : 'nullable', 'array', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=4096,max_height=4096'],
            'removed_image_ids' => ['nullable', 'array', 'max:10'],
            'removed_image_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }
}
