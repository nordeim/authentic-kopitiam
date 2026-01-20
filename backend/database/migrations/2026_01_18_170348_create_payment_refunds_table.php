<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_refunds', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->foreignUuid('payment_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 4)->unsigned();
            $table->string('currency', 3)->default('SGD');
            $table->string('provider_refund_id')->nullable();
            $table->json('provider_metadata')->nullable();
            $table->string('reason');
            $table->boolean('inventory_restored')->default(false);
            $table->foreignId('refunded_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_refunds');
    }
};
