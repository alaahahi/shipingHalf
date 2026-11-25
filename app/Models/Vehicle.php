<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $appends = ['total_cost'];

    protected function casts(): array
    {
        return ['purchased_at' => 'date', 'purchase_price' => 'decimal:2'];
    }

    public function trader()
    {
        return $this->belongsTo(Trader::class);
    }

    public function container()
    {
        return $this->belongsTo(Container::class);
    }

    public function roadShipment()
    {
        return $this->belongsTo(RoadShipment::class);
    }

    public function getTotalCostAttribute(): string
    {
        return number_format(collect(['purchase_price', 'direct_expenses', 'container_cost', 'road_cost', 'penalties'])->sum(fn ($field) => (float) $this->{$field}), 2, '.', '');
    }
}
