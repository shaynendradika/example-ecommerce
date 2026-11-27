<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/employees/index', [
            'employees' => Employee::query()
                ->select('id', 'name', 'email', 'email_verified_at', 'created_at')
                ->orderBy('id')
                ->paginate(10),
        ]);
    }
}
