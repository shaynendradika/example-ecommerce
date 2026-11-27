<?php

namespace App\Http\Services;

use App\Models\ProductImage;
use Closure;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\UploadedFile;
use Illuminate\Image\Image as CatalogImage;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class ProductImageService
{
    /** @param Closure(Collection<int, string>, Collection<int, string>): void $operation */
    public function transaction(Closure $operation): void
    {
        $createdPaths = $this->paths();
        $removedPaths = $this->paths();

        try {
            DB::transaction(function () use ($operation, $createdPaths, $removedPaths) {
                $operation($createdPaths, $removedPaths);
            });
        } catch (Throwable $exception) {
            if ($createdPaths->isNotEmpty() && ! Storage::disk('public')->delete($createdPaths->all())) {
                report(new RuntimeException('Failed to clean up uploaded catalog images.'));
            }

            throw $exception;
        }

        if ($removedPaths->isNotEmpty() && ! Storage::disk('public')->delete($removedPaths->all())) {
            throw new RuntimeException('Failed to delete removed catalog images.');
        }
    }

    /**
     * @param  HasMany<ProductImage, *>  $images
     * @param  array<int, UploadedFile>  $uploads
     * @param  array<int, int|string>  $removedIds
     * @param  Collection<int, string>  $createdPaths
     * @param  Collection<int, string>  $removedPaths
     */
    public function sync(HasMany $images, int $productId, array $uploads, array $removedIds, bool $required, int $maxImages, Collection $createdPaths, Collection $removedPaths): void
    {
        $existing = $images->get();
        $removedIds = collect($removedIds)->map(fn ($id) => (int) $id);
        $removed = $existing->whereIn('id', $removedIds);
        if ($removed->count() !== $removedIds->count()) {
            throw ValidationException::withMessages(['images' => 'One or more images do not belong to this item.']);
        }
        $count = $existing->count() - $removed->count() + count($uploads);
        if (($required && $count < 1) || $count > $maxImages) {
            throw ValidationException::withMessages(['images' => $required && $count < 1
                ? 'Add at least one product image.'
                : "You may upload at most {$maxImages} ".($maxImages === 1 ? 'image.' : 'images.')]);
        }

        foreach ($uploads as $file) {
            $path = $this->store(Image::fromUpload($file));
            $createdPaths->push($path);
            $images->create(['product_id' => $productId, 'path' => $path]);
        }

        foreach ($removed as $image) {
            $removedPaths->push($image->path);
            $image->delete();
        }
    }

    public function store(CatalogImage $image): string
    {
        $image = $image->orient();
        if ($image->width() > 1024 || $image->height() > 1024) {
            $image = $image->scale(1024, 1024);
        }
        $path = 'products/'.Str::uuid().'.webp';
        $bytes = $image->optimize(format: 'webp', quality: 80)->toBytes();
        if (! Storage::disk('public')->put($path, $bytes)) {
            throw new RuntimeException('Failed to store a catalog image.');
        }

        return $path;
    }

    /** @return Collection<int, string> */
    private function paths(): Collection
    {
        return collect();
    }
}
