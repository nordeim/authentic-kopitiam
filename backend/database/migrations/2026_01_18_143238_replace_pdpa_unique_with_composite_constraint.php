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
            $table->dropUnique(['pseudonymized_id']);
            $table->unique(['pseudonymized_id', 'consent_type'], 'pdpa_consents_pseudonymized_consent_type_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pdpa_consents', function (Blueprint $table) {
            $table->dropUnique('pdpa_consents_pseudonymized_consent_type_unique');
            $table->unique(['pseudonymized_id'], 'pdpa_consents_pseudonymized_id_unique');
        });
    }
};
