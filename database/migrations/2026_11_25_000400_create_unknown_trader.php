<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $id = DB::table('traders')->where('name', 'غير محدد')->value('id');
        if (! $id) {
            $id = DB::table('traders')->insertGetId([
                'name' => 'غير محدد', 'opening_balance' => 0, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        DB::table('vehicles')->whereNull('trader_id')->update(['trader_id' => $id]);
    }

    public function down(): void
    {
        // Keep the trader and vehicle ownership history when rolling back.
    }
};
