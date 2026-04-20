<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Add Admin User
        \App\Models\User::factory()->create([
            'name' => 'Admin Just Marrakech',
            'email' => 'admin@justmarrakech.com',
            'password' => bcrypt('marrakech2024'),
        ]);
    }
}
