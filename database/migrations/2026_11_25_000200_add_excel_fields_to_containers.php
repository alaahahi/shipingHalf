<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->unsignedInteger('sequence_no')->nullable()->after('id');
            $table->date('arf_date')->nullable()->after('arf_no');
            $table->decimal('paid_amount', 18, 2)->default(0)->after('currency');
            $table->unique('sequence_no');
        });
    }

    public function down(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->dropUnique(['sequence_no']);
            $table->dropColumn(['sequence_no', 'arf_date', 'paid_amount']);
        });
    }
};
