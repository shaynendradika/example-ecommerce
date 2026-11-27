<?php

namespace Database\Seeders;

use App\Http\Services\ProductImageService;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\VariantAttribute;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Image;
use Illuminate\Support\Str;
use RuntimeException;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(ProductImageService $images): void
    {
        $products = [
            [
                'name' => 'Cleansing Balm',
                'description' => <<<'MD'
                    Balm pembersih bertekstur lembut yang **meleleh menjadi minyak** saat diusapkan, lalu berubah menjadi susu ringan ketika terkena air. Mengangkat makeup, sunscreen, dan kotoran tanpa membuat kulit terasa ketarik.

                    ### Manfaat
                    - Melarutkan makeup *waterproof* dengan mudah
                    - Menjaga kelembapan alami kulit
                    - Membantu membersihkan pori dan komedo halus

                    ### Cara Pakai
                    1. Ambil secukupnya dengan spatula, usapkan pada wajah kering.
                    2. Pijat lembut selama 30-60 detik.
                    3. Tambahkan sedikit air hingga menjadi susu, lalu bilas bersih.

                    > Gunakan sebagai langkah pertama *double cleansing* di malam hari.
                    MD,
                'variants' => [
                    [['size' => '50g', 'scent' => 'Rose'], 59000],
                    [['size' => '50g', 'scent' => 'Delicious Almond'], 62000],
                    [['size' => '100g', 'scent' => 'Rose'], 99000],
                    [['size' => '100g', 'scent' => 'Delicious Almond'], 105000],
                    [['size' => '150g', 'scent' => 'Rose'], 139000],
                    [['size' => '150g', 'scent' => 'Delicious Almond'], 145000],
                ],
            ],
            [
                'name' => 'Body Scrub',
                'description' => <<<'MD'
                    Scrub tubuh dengan perpaduan **gula dan garam laut** yang mengangkat sel kulit mati, meninggalkan kulit terasa halus dan cerah sejak pemakaian pertama.

                    ### Manfaat
                    - Eksfoliasi lembut untuk kulit kasar dan kusam
                    - Diperkaya minyak nabati agar kulit tidak kering setelah dibilas
                    - Membantu bulu tumbuh ke dalam berkurang

                    ### Cara Pakai
                    1. Gunakan pada kulit basah saat mandi.
                    2. Pijat dengan gerakan memutar, fokus pada siku, lutut, dan tumit.
                    3. Bilas hingga bersih. Gunakan **2-3 kali seminggu**.

                    *Hindari penggunaan pada kulit yang luka atau iritasi.*
                    MD,
                'variants' => [
                    [['size' => '100g'], 45000],
                    [['size' => '200g'], 79000],
                    [['size' => '400g'], 139000],
                ],
            ],
            [
                'name' => 'Clay Cleanser',
                'description' => <<<'MD'
                    Pembersih wajah berbahan **kaolin clay** yang menyerap minyak berlebih dan kotoran di pori, tanpa meninggalkan rasa kering. Pilih aroma sesuai kebutuhan kulitmu.

                    ### Pilihan Varian
                    - **Green Tea**: menenangkan kulit yang mudah kemerahan
                    - **Charcoal**: membantu membersihkan pori lebih dalam
                    - **Lavender**: aroma relaksasi untuk rutinitas malam

                    ### Cara Pakai
                    1. Basahi wajah, lalu tuang sedikit pembersih ke telapak tangan.
                    2. Busakan dan pijat lembut ke seluruh wajah selama 30 detik.
                    3. Bilas dengan air hangat.

                    Cocok untuk kulit **berminyak dan kombinasi**.
                    MD,
                'variants' => [
                    [['scent' => 'Green Tea'], 75000],
                    [['scent' => 'Charcoal'], 79000],
                    [['scent' => 'Lavender'], 82000],
                ],
            ],
            [
                'name' => 'Facial Serum',
                'description' => <<<'MD'
                    Serum ringan dengan **niacinamide 5%** dan hyaluronic acid yang cepat meresap. Membantu meratakan warna kulit sekaligus menjaga hidrasi sepanjang hari.

                    ### Manfaat
                    - Menyamarkan noda hitam dan bekas jerawat
                    - Menghidrasi tanpa terasa lengket
                    - Memperkuat *skin barrier*

                    ### Cara Pakai
                    1. Setelah toner, teteskan 2-3 tetes ke telapak tangan.
                    2. Tepuk lembut ke seluruh wajah dan leher.
                    3. Lanjutkan dengan pelembap. Bisa dipakai **pagi dan malam**.

                    > Varian *Unscented* direkomendasikan untuk kulit sensitif.
                    MD,
                'variants' => [
                    [['size' => '15ml', 'scent' => 'Unscented'], 69000],
                    [['size' => '15ml', 'scent' => 'Tutti Fruity'], 72000],
                    [['size' => '30ml', 'scent' => 'Unscented'], 119000],
                    [['size' => '30ml', 'scent' => 'Tutti Fruity'], 125000],
                    [['size' => '50ml', 'scent' => 'Unscented'], 179000],
                    [['size' => '50ml', 'scent' => 'Tutti Fruity'], 185000],
                ],
            ],
            [
                'name' => 'Sunscreen',
                'description' => <<<'MD'
                    Tabir surya **SPF 50 PA++++** dengan tekstur *gel-cream* yang ringan dan tidak meninggalkan *white cast*. Nyaman dipakai sehari-hari di bawah makeup.

                    ### Keunggulan
                    - Perlindungan UVA dan UVB spektrum luas
                    - *Non-comedogenic* dan cepat menyerap
                    - Hasil akhir natural, tidak berminyak

                    ### Cara Pakai
                    1. Gunakan sebagai langkah terakhir *skincare* pagi.
                    2. Aplikasikan sekitar **dua ruas jari** untuk wajah dan leher.
                    3. Ulangi setiap 2-3 jam saat beraktivitas di luar ruangan.
                    MD,
                'variants' => [
                    [['size' => '30ml'], 65000],
                    [['size' => '50ml'], 99000],
                    [['size' => '100ml'], 179000],
                ],
            ],
            [
                'name' => 'Body Lotion',
                'description' => <<<'MD'
                    Losion tubuh yang **melembapkan hingga 24 jam** dengan *shea butter* dan vitamin E. Teksturnya cepat meresap, meninggalkan wangi lembut yang tahan lama.

                    ### Pilihan Aroma
                    - **Sakura**: segar dan floral
                    - **Vanilla**: manis dan hangat
                    - **Coconut**: tropis dan menenangkan

                    ### Cara Pakai
                    1. Oleskan ke seluruh tubuh setelah mandi, saat kulit masih sedikit lembap.
                    2. Ratakan hingga meresap sempurna.

                    *Cocok untuk semua jenis kulit, termasuk kulit kering.*
                    MD,
                'variants' => [
                    [['scent' => 'Sakura'], 39000],
                    [['scent' => 'Vanilla'], 42000],
                    [['scent' => 'Coconut'], 45000],
                ],
            ],
        ];

        $images->transaction(function (Collection $createdPaths) use ($products, $images) {
            $this->call(VariantAttributeSeeder::class);
            $attributes = VariantAttribute::whereIn('code', ['size', 'scent'])->get()->keyBy('code');

            foreach ($products as $data) {
                $slug = Str::slug($data['name']);
                $product = Product::withTrashed()->firstOrCreate(['slug' => $slug], ['name' => $data['name'], 'is_active' => true]);
                if ($product->trashed()) {
                    throw new RuntimeException("Cannot seed the soft-deleted product: {$slug}.");
                }
                if (blank($product->description)) {
                    $product->update(['description' => $data['description']]);
                }

                $codes = array_keys($data['variants'][0][0]);
                $expectedIds = collect($codes)->map(fn ($code) => $attributes[$code]->id)->sort()->values()->all();
                if ($product->wasRecentlyCreated) {
                    foreach ($expectedIds as $attributeId) {
                        $product->productAttributes()->create(['variant_attribute_id' => $attributeId]);
                    }
                } elseif ($product->productAttributes()->pluck('variant_attribute_id')->sort()->values()->all() !== $expectedIds) {
                    throw new RuntimeException("Cannot seed {$slug}: existing product attributes do not match.");
                }

                $productAttributes = $product->productAttributes()->get()->keyBy('variant_attribute_id');
                $initials = Str::of($data['name'])->initials()->upper();
                foreach ($data['variants'] as [$values, $price]) {
                    $scent = $values['scent'] ?? '';
                    $scentCode = str_contains($scent, ' ')
                        ? Str::initials($scent, capitalize: true)
                        : Str::upper(mb_substr($scent, 0, 1).mb_substr($scent, -1));
                    $sku = $initials.'-'.Str::upper($values['size'] ?? '').$scentCode;
                    $legacySkus = [
                        Str::upper(Str::slug($initials.' '.implode(' ', $values))),
                        Str::upper(Str::slug($data['name'].' '.implode(' ', $values))),
                    ];
                    foreach (array_unique($legacySkus) as $legacySku) {
                        if ($legacySku === $sku) {
                            continue;
                        }

                        $legacyVariant = $product->variants()->withTrashed()->where('sku', $legacySku)->first();
                        if ($legacyVariant) {
                            if ($legacyVariant->trashed()) {
                                throw new RuntimeException("Cannot seed the soft-deleted variant: {$legacySku}.");
                            }

                            if (ProductVariant::withTrashed()->where('sku', $sku)->exists()) {
                                throw new RuntimeException("Cannot rename {$legacySku}: variant {$sku} already exists.");
                            }

                            $legacyVariant->update(['sku' => $sku]);
                        }
                    }

                    $variant = $product->variants()->withTrashed()->firstOrCreate(
                        ['sku' => $sku],
                        ['price' => $price, 'stock' => random_int(0, 20), 'is_active' => true],
                    );
                    if ($variant->trashed()) {
                        throw new RuntimeException("Cannot seed the soft-deleted variant: {$sku}.");
                    }

                    foreach ($values as $code => $value) {
                        $variantValue = $variant->values()->withTrashed()->firstOrCreate([
                            'product_attribute_id' => $productAttributes[$attributes[$code]->id]->id,
                        ], ['value' => $value]);
                        if ($variantValue->trashed()) {
                            throw new RuntimeException("Cannot seed a soft-deleted value for variant: {$sku}.");
                        }
                    }

                    if (! $variant->images()->exists()) {
                        $source = resource_path('images/'.Str::slug($data['name'].' '.implode(' ', $values)).'.jpeg');
                        if (! is_file($source)) {
                            throw new RuntimeException("Missing demo image for variant {$sku}: {$source}.");
                        }

                        $path = $images->store(Image::fromPath($source));
                        $createdPaths->push($path);
                        $variant->images()->create(['product_id' => $product->id, 'path' => $path]);
                    }
                }
            }
        });
    }
}
