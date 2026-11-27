<?php

use App\Http\Controllers\Admin\AuthenticatedSessionController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\VariantAttributeController;
use App\Http\Controllers\Customer\AuthenticatedSessionController as CustomerSessionController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ProductController as CustomerProductController;
use App\Http\Controllers\Customer\RegisteredCustomerController;
use App\Models\Order;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/products')->name('home');
Route::get('/products', [CustomerProductController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [CustomerProductController::class, 'show'])->name('products.show');
Route::post('/products/{product:slug}/cart', [CartController::class, 'store'])->name('cart.store')->block();
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::patch('/cart/{variant}', [CartController::class, 'update'])->whereNumber('variant')->name('cart.update')->block();
Route::delete('/cart/{variant}', [CartController::class, 'destroy'])->whereNumber('variant')->name('cart.destroy')->block();

Route::middleware('guest:customer')->group(function () {
    Route::get('/login', [CustomerSessionController::class, 'create'])->name('customer.login');
    Route::post('/login', [CustomerSessionController::class, 'store'])->middleware('throttle:5,1')->name('customer.login.store')->block();
    Route::get('/register', [RegisteredCustomerController::class, 'create'])->name('customer.register');
    Route::post('/register', [RegisteredCustomerController::class, 'store'])->middleware('throttle:5,1')->name('customer.register.store')->block();
});
Route::middleware('auth:customer')->group(function () {
    Route::post('/logout', [CustomerSessionController::class, 'destroy'])->name('customer.logout');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store')->block();
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order:invoice_number}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order:invoice_number}/pay', [OrderController::class, 'pay'])->name('orders.pay');
    Route::post('/orders/{order:invoice_number}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:web')->group(function () {
        Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('throttle:5,1')
            ->name('login.store');
    });

    Route::middleware('auth:web')->group(function () {
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
        Route::get('/', function () {
            $counts = Order::query()
                ->whereIn('status', [Order::PENDING, Order::PAID, 'processing', 'delivery'])
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            return Inertia::render('admin/dashboard', [
                'orderCounts' => [
                    'pending' => (int) $counts->get(Order::PENDING, 0),
                    'paid' => (int) $counts->get(Order::PAID, 0),
                    'processing' => (int) $counts->get('processing', 0),
                    'delivery' => (int) $counts->get('delivery', 0),
                ],
            ]);
        })->name('dashboard');
        Route::get('employees', [EmployeeController::class, 'index'])->name('employees');
        Route::get('customers', [CustomerController::class, 'index'])->name('customers');
        Route::get('products', [ProductController::class, 'index'])->name('products');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::scopeBindings()->group(function () {
            Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('products.variants.store');
            Route::put('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('products.variants.update');
            Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('products.variants.destroy');
        });
        Route::get('variant-attributes', [VariantAttributeController::class, 'index'])->name('variant-attributes');
        Route::post('variant-attributes', [VariantAttributeController::class, 'store'])->name('variant-attributes.store');
        Route::put('variant-attributes/{variantAttribute}', [VariantAttributeController::class, 'update'])->name('variant-attributes.update');
        Route::delete('variant-attributes/{variantAttribute}', [VariantAttributeController::class, 'destroy'])->name('variant-attributes.destroy');
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders');
        Route::patch('orders/{order}', [AdminOrderController::class, 'update'])->whereNumber('order')->name('orders.update');
    });
});
