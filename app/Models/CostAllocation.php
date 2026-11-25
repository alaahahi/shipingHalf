<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CostAllocation extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    public function source()
    {
        return $this->morphTo();
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
