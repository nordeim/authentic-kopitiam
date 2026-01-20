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
if (Schema::hasTable('payments')) {            return;        }
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method'); // 'paynow', 'stripe_card', 'stripe_paynow'
            $table->string('status'); // 'pending', 'processing', 'completed', 'failed', 'refunded'
            $table->decimal('amount', 10, 2)->unsigned();
            $table->decimal('refunded_amount', 10, 2)->unsigned()->default(0);
            $table->string('currency', 3)->default('SGD');
            $table->string('payment_provider'); // 'stripe', 'paynow'
            $table->string('provider_payment_id')->nullable()->index();
            $table->string('provider_payment_method_id')->nullable();
            $table->json('provider_metadata')->nullable();
            $table->json('paynow_qr_data')->nullable();
            $table->timestamp('payment_completed_at')->nullable();
            $table->timestamp('payment_failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['order_id', 'status']);
            $table->index(['payment_method', 'status']);
            $table->index(['payment_completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
