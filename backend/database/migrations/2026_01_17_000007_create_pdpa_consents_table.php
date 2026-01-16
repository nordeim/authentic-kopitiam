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
        Schema::create('pdpa_consents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id')->nullable();
            $table->string('pseudonymized_id', 64)->unique(); // SHA256 hash
            $table->enum('consent_type', ['marketing', 'analytics', 'third_party']);
            $table->enum('consent_status', ['granted', 'withdrawn', 'expired'])->default('granted');
            $table->timestamp('consented_at');
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('ip_address', 45);
            $table->string('user_agent', 500)->nullable();
            $table->string('consent_wording_hash', 64);
            $table->string('consent_version', 20);
            $table->timestamps();

            $table->index(['customer_id', 'consent_type', 'consent_status']); // Composite for queries
            $table->index('pseudonymized_id'); // Unique for GDPR/PDPA lookups
            $table->index('expires_at'); // For cleanup jobs
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pdpa_consents');
    }
};
