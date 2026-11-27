<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Services\CartService;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredCustomerController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('customer/register');
    }

    public function store(Request $request, CartService $cart): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ], [
            'name.required' => 'Masukkan nama.',
            'name.max' => 'Nama terlalu panjang.',
            'email.required' => 'Masukkan email.',
            'email.email' => 'Masukkan email yang valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'email.max' => 'Email terlalu panjang.',
            'password.required' => 'Masukkan kata sandi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
        ]);

        $customer = DB::transaction(function () use ($validated, $request, $cart) {
            $customer = Customer::create($validated);
            $cart->mergeGuest($request, $customer);

            return $customer;
        });
        $request->session()->forget('cart');
        Auth::guard('customer')->login($customer);
        $request->session()->regenerate();

        return redirect()->intended(route('products.index'));
    }
}
