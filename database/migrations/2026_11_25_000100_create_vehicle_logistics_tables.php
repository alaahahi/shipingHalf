<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('traders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->decimal('opening_balance', 18, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('containers', function (Blueprint $table) {
            $table->id();
            $table->string('container_no')->unique();
            $table->string('bill_of_lading')->nullable()->index();
            $table->string('arf_no')->nullable();
            $table->string('shipping_agent')->nullable();
            $table->date('shipment_date')->nullable();
            $table->string('status')->default('draft');
            $table->char('currency', 3)->default('USD');
            $table->timestamp('allocation_locked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('road_shipments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('carrier_name')->nullable();
            $table->string('truck_plate')->nullable();
            $table->string('driver_name');
            $table->string('driver_phone');
            $table->date('loaded_at')->nullable();
            $table->date('arrived_at')->nullable();
            $table->string('status')->default('draft');
            $table->char('currency', 3)->default('USD');
            $table->timestamp('allocation_locked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trader_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('container_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('road_shipment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('stock_no')->unique();
            $table->string('vin', 32)->unique();
            $table->string('lot_no')->nullable();
            $table->string('make');
            $table->string('model');
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('color')->nullable();
            $table->string('status')->default('purchased');
            $table->char('currency', 3)->default('USD');
            $table->decimal('purchase_price', 18, 2)->default(0);
            $table->decimal('direct_expenses', 18, 2)->default(0);
            $table->decimal('container_cost', 18, 2)->default(0);
            $table->decimal('road_cost', 18, 2)->default(0);
            $table->decimal('penalties', 18, 2)->default(0);
            $table->decimal('sale_price', 18, 2)->nullable();
            $table->date('purchased_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('expenseable');
            $table->string('category');
            $table->string('description')->nullable();
            $table->decimal('amount', 18, 2);
            $table->char('currency', 3)->default('USD');
            $table->date('expense_date');
            $table->boolean('is_penalty')->default(false);
            $table->string('payment_status')->default('unpaid');
            $table->timestamps();
        });

        Schema::create('cost_allocations', function (Blueprint $table) {
            $table->id();
            $table->morphs('source');
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 18, 2);
            $table->char('currency', 3)->default('USD');
            $table->string('kind');
            $table->timestamps();
            $table->unique(['source_type', 'source_id', 'vehicle_id', 'kind'], 'allocation_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cost_allocations');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('road_shipments');
        Schema::dropIfExists('containers');
        Schema::dropIfExists('traders');
    }
};
