<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 4)->nullable()->after('subtotal_cents');
            $table->decimal('gst_amount', 10, 4)->nullable()->after('gst_cents');
            $table->decimal('total_amount', 10, 4)->nullable()->after('total_cents');
        });
        
        DB::statement('UPDATE orders SET subtotal = subtotal_cents / 100.0, gst_amount = gst_cents / 100.0, total_amount = total_cents / 100.0');
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal_cents', 'gst_cents', 'total_cents']);
            $table->decimal('subtotal', 10, 4)->unsigned()->change();
            $table->decimal('gst_amount', 10, 4)->unsigned()->change();
            $table->decimal('total_amount', 10, 4)->unsigned()->change();
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('unit_price', 10, 4)->nullable()->after('unit_price_cents');
        });
        
        DB::statement('UPDATE order_items SET unit_price = unit_price_cents / 100.0');
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('unit_price_cents');
            $table->decimal('unit_price', 10, 4)->unsigned()->change();
        });
        
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 10, 4)->unsigned()->change();
            $table->decimal('refunded_amount', 10, 4)->unsigned()->default(0)->change();
        });
        
        Schema::table('payment_refunds', function (Blueprint $table) {
            $table->decimal('amount', 10, 4)->unsigned()->change();
        });
    }
    
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('subtotal_cents')->unsigned()->nullable()->after('subtotal');
            $table->integer('gst_cents')->unsigned()->nullable()->after('gst_amount');
            $table->integer('total_cents')->unsigned()->nullable()->after('total_amount');
        });
        
        DB::statement('UPDATE orders SET subtotal_cents = CAST(subtotal * 100 AS INTEGER), gst_cents = CAST(gst_amount * 100 AS INTEGER), total_cents = CAST(total_amount * 100 AS INTEGER)');
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'gst_amount', 'total_amount']);
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->integer('unit_price_cents')->unsigned()->nullable()->after('unit_price');
        });
        
        DB::statement('UPDATE order_items SET unit_price_cents = CAST(unit_price * 100 AS INTEGER)');
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('unit_price');
        });
        
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->unsigned()->change();
            $table->decimal('refunded_amount', 10, 2)->unsigned()->default(0)->change();
        });
        
        Schema::table('payment_refunds', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->unsigned()->change();
        });
    }
};
