<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class RoadShipment extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['loaded_at' => 'date', 'arrived_at' => 'date', 'allocation_locked_at' => 'datetime'];
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function expenses()
    {
        return $this->morphMany(Expense::class, 'expenseable');
    }

    public function allocations()
    {
        return $this->morphMany(CostAllocation::class, 'source');
    }

    protected function driverPhone(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value ? preg_replace('/[\s().-]+/', '', $value) : null,
            set: fn (?string $value) => $value ? preg_replace('/[\s().-]+/', '', $value) : null,
        );
    }
}
