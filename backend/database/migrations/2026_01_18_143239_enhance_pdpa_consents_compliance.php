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
        Schema::table('pdpa_consents', function (Blueprint $table) {
            // Add customer_id foreign key for authenticated users
            $table->uuid('customer_id')->nullable()->after('id');
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('set null');
            
            // Add consent versioning fields
            $table->string('consent_status', 20)->default('granted')->after('consent_type');
            $table->timestamp('withdrawn_at')->nullable()->after('consented_at');
            $table->timestamp('expires_at')->nullable()->after('withdrawn_at');
            $table->string('consent_wording_hash', 64)->nullable()->after('expires_at');
            $table->string('consent_version', 20)->nullable()->after('consent_wording_hash');
            
            // Add composite index for lookups
            $table->index(['pseudonymized_id', 'consent_type', 'consent_status'], 'pdpa_consents_lookup_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pdpa_consents', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
            $table->dropColumn('consent_status');
            $table->dropColumn('withdrawn_at');
            $table->dropColumn('expires_at');
            $table->dropColumn('consent_wording_hash');
            $table->dropColumn('consent_version');
            $table->dropIndex('pdpa_consents_lookup_index');
        });
    }
};
