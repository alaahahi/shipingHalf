<?php

namespace Database\Seeders;

use App\Models\Container;
use App\Models\Trader;
use App\Models\User;
use App\Models\Vehicle;
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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'مدير النظام',
            'email' => 'admin@haulauto.local',
        ]);

        $trader = Trader::create(['name' => 'تاجر تجريبي', 'phone' => '0750 000 0000']);
        $container = Container::create(['container_no' => 'TCNU777821-0', 'bill_of_lading' => '10261203', 'arf_no' => '20261015/06-124', 'shipping_agent' => 'TURKON']);
        Vehicle::create(['trader_id' => $trader->id, 'container_id' => $container->id, 'stock_no' => 'CAR-0001', 'vin' => '1HGBH41JXMN109186', 'make' => 'Toyota', 'model' => 'Camry', 'year' => 2024, 'color' => 'أبيض', 'purchase_price' => 12500]);
    }
}
