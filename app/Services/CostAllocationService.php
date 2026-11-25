<?php

namespace App\Services;

use App\Models\Container;
use App\Models\RoadShipment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CostAllocationService
{
    public function lock(Container|RoadShipment $source): void
    {
        if ($source->allocation_locked_at) {
            throw ValidationException::withMessages(['allocation' => 'تم اعتماد التوزيع مسبقاً.']);
        }

        $source->load(['vehicles', 'expenses']);
        if ($source->vehicles->isEmpty()) {
            throw ValidationException::withMessages(['vehicles' => 'يجب إضافة سيارة واحدة على الأقل قبل التوزيع.']);
        }

        $totalCents = (int) round($source->expenses->sum(fn ($expense) => (float) $expense->amount) * 100);
        $count = $source->vehicles->count();
        $baseCents = intdiv($totalCents, $count);
        $remainder = $totalCents - ($baseCents * $count);
        $kind = $source instanceof Container ? 'container' : 'road_shipment';
        $vehicleColumn = $source instanceof Container ? 'container_cost' : 'road_cost';

        DB::transaction(function () use ($source, $baseCents, $remainder, $kind, $vehicleColumn) {
            foreach ($source->vehicles->values() as $index => $vehicle) {
                $cents = $baseCents + ($index < $remainder ? 1 : 0);
                $amount = $cents / 100;
                $source->allocations()->create([
                    'vehicle_id' => $vehicle->id,
                    'amount' => $amount,
                    'currency' => $source->currency ?: 'USD',
                    'kind' => $kind,
                ]);
                $vehicle->update([$vehicleColumn => $amount]);
            }
            $source->update(['allocation_locked_at' => now(), 'status' => 'allocated']);
        });
    }
}
