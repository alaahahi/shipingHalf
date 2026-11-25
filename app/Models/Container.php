<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Container extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['shipment_date' => 'date', 'arf_date' => 'date', 'paid_amount' => 'decimal:2', 'allocation_locked_at' => 'datetime'];
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

    public function attachments()
    {
        return $this->hasMany(ContainerAttachment::class);
    }
}
