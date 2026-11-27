<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Services\CartService;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('customer/login');
    }

    public function store(Request $request, CartService $cart): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Masukkan email.',
            'email.email' => 'Masukkan email yang valid.',
            'password.required' => 'Masukkan kata sandi.',
        ]);

        if (! Auth::guard('customer')->attempt($credentials)) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi salah.']);
        }

        $customer = Auth::guard('customer')->user();
        assert($customer instanceof Customer);
        try {
            $cart->mergeGuest($request, $customer);
        } catch (ValidationException $exception) {
            Auth::guard('customer')->logout();
            throw $exception;
        }
        $request->session()->forget('cart');
        $request->session()->regenerate();

        return redirect()->intended(route('products.index'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('customer')->logout();
        $request->session()->regenerate(true);
        $request->session()->regenerateToken();

        return redirect()->route('products.index');
    }
}
