<?php

namespace Tests\Feature;

use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VehicleVinTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_warns_when_vin_already_exists(): void
    {
        Vehicle::create([
            'stock_no' => 'CAR-55',
            'vin' => '1HGCM82633A123456',
            'make' => 'Honda',
            'model' => 'Accord',
            'year' => 2023,
        ]);

        $this->getJson('/api/vehicles/vin/1hgcm82633a123456')
            ->assertOk()
            ->assertJson([
                'exists' => true,
                'valid' => true,
                'vehicle' => ['stock_no' => 'CAR-55', 'make' => 'Honda'],
            ]);
    }

    public function test_it_decodes_available_vin_through_backend(): void
    {
        Http::fake([
            'vpic.nhtsa.dot.gov/*' => Http::response([
                'Results' => [[
                    'Make' => 'TOYOTA',
                    'Model' => 'CAMRY',
                    'ModelYear' => '2024',
                    'BodyClass' => 'Sedan/Saloon',
                    'VehicleType' => 'PASSENGER CAR',
                ]],
            ]),
        ]);

        $this->getJson('/api/vehicles/vin/4T1BF1FK5HU123456')
            ->assertOk()
            ->assertJson([
                'exists' => false,
                'valid' => true,
                'vehicle' => ['make' => 'TOYOTA', 'model' => 'CAMRY', 'year' => 2024],
            ]);
    }
}
