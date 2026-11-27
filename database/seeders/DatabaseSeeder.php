<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Employee::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin',
            'password' => 123,
        ]);

        Customer::updateOrCreate([
            'email' => 'customer@example.com',
        ], [
            'name' => 'Customer',
            'password' => 123,
        ]);

        $this->call(ProductSeeder::class);
    }
}
