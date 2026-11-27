<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/customers/index', [
            'customers' => Customer::query()
                ->select('id', 'name', 'email', 'email_verified_at', 'created_at')
                ->orderBy('id')
                ->paginate(10),
        ]);
    }
}
