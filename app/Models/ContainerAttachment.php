<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContainerAttachment extends Model
{
    protected $guarded = [];

    public function container()
    {
        return $this->belongsTo(Container::class);
    }
}
