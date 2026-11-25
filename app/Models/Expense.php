<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'expense_date' => 'date', 'is_penalty' => 'boolean'];
    }

    public function expenseable()
    {
        return $this->morphTo();
    }
}
