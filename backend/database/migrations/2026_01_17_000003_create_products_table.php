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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 4); // DECIMAL(10,4) for GST precision
            $table->uuid('category_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('image_url')->nullable();
            $table->integer('calories')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->index(['is_active', 'category_id']); // Composite for category filtering
            $table->index('created_at'); // For sorting
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
