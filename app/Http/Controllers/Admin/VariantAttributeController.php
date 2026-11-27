<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VariantAttributeRequest;
use App\Models\VariantAttribute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class VariantAttributeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/variant-attributes/index', [
            'attributes' => VariantAttribute::query()->withCount('productAttributes')->orderBy('id')->paginate(10),
        ]);
    }

    public function store(VariantAttributeRequest $request): RedirectResponse
    {
        VariantAttribute::create($request->validated());

        return back();
    }

    public function update(VariantAttributeRequest $request, VariantAttribute $variantAttribute): RedirectResponse
    {
        $variantAttribute->update($request->validated());

        return back();
    }

    public function destroy(VariantAttribute $variantAttribute): RedirectResponse
    {
        DB::transaction(function () use ($variantAttribute) {
            $variantAttribute = VariantAttribute::whereKey($variantAttribute->id)->lockForUpdate()->firstOrFail();
            if ($variantAttribute->productAttributes()->exists()) {
                throw ValidationException::withMessages([
                    'attribute' => 'This attribute is assigned to a product and cannot be deleted.',
                ]);
            }

            $variantAttribute->delete();
        });

        return back();
    }
}
