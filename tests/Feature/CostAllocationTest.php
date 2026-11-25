<?php

namespace Tests\Feature;

use App\Models\Container;
use App\Models\Trader;
use App\Models\Vehicle;
use App\Services\CostAllocationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CostAllocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_container_expenses_are_distributed_exactly_across_vehicles(): void
    {
        $container = Container::create(['container_no' => 'CONT-1']);
        $trader = Trader::create(['name' => 'Trader']);

        foreach (range(1, 3) as $index) {
            Vehicle::create([
                'trader_id' => $trader->id,
                'container_id' => $container->id,
                'stock_no' => "CAR-{$index}",
                'vin' => "VIN000000000000{$index}",
                'make' => 'Toyota',
                'model' => 'Camry',
            ]);
        }

        $container->expenses()->create([
            'category' => 'shipping',
            'amount' => 100,
            'expense_date' => now()->toDateString(),
        ]);

        app(CostAllocationService::class)->lock($container);

        $this->assertSame(100.0, (float) $container->allocations()->sum('amount'));
        $this->assertEqualsCanonicalizing([33.34, 33.33, 33.33], $container->allocations()->pluck('amount')->map(fn ($amount) => (float) $amount)->all());
        $this->assertNotNull($container->fresh()->allocation_locked_at);
    }

    public function test_container_cannot_accept_more_than_four_vehicles(): void
    {
        $container = Container::create(['container_no' => 'CONT-2']);

        foreach (range(1, 5) as $index) {
            $vehicle = Vehicle::create([
                'stock_no' => "LIMIT-{$index}",
                'vin' => "LIMITVIN0000000{$index}",
                'make' => 'Honda',
                'model' => 'Civic',
            ]);
            $response = $this->post("/containers/{$container->id}/vehicles", ['vehicle_id' => $vehicle->id]);
        }

        $response->assertSessionHasErrors('vehicle_id');
        $this->assertSame(4, $container->vehicles()->count());
    }
}
