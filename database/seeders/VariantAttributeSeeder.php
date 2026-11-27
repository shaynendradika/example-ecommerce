<?php

namespace Database\Seeders;

use App\Models\VariantAttribute;
use Illuminate\Database\Seeder;
use RuntimeException;

class VariantAttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['size' => 'Size', 'scent' => 'Aroma'] as $code => $name) {
            $attribute = VariantAttribute::withTrashed()->firstOrCreate(['code' => $code], ['name' => $name]);

            if ($attribute->trashed()) {
                throw new RuntimeException("Cannot seed the soft-deleted variant attribute: {$code}.");
            }
        }
    }
}
