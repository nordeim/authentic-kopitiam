<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('invoice_number', 50)->unique();
            $table->string('customer_name', 255);
            $table->string('customer_phone', 20);
            $table->string('customer_email', 255);
            $table->uuid('location_id');
            $table->timestamp('pickup_at');
            $table->enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->integer('subtotal_cents')->unsigned();
            $table->integer('gst_cents')->unsigned(); // 9% GST stored separately
            $table->integer('total_cents')->unsigned();
            $table->enum('payment_method', ['paynow', 'card', 'cash']);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('location_id')->references('id')->on('locations')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['status', 'created_at']); // Composite for status filtering
            $table->index('invoice_number');
            $table->index('customer_email');
            $table->index('pickup_at');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
