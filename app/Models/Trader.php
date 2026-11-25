<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trader extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['opening_balance' => 'decimal:2'];
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    protected function phone(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value ? preg_replace('/[\s().-]+/', '', $value) : null,
            set: fn (?string $value) => $value ? preg_replace('/[\s().-]+/', '', $value) : null,
        );
    }
}
