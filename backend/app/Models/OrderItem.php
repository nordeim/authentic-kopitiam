<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;


class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = "string";
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'unit_price_cents',
        'quantity',
        'unit_name',
        'notes',
    ];

    protected $casts = [
        'unit_price_cents' => 'integer',
        'quantity' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getSubtotalCentsAttribute(): int
    {
        return $this->unit_price_cents * $this->quantity;
    }

    public function getFormattedSubtotalAttribute(): string
    {
        $subtotal = $this->subtotal_cents / 100;
        return '$' . number_format($subtotal, 2);
    }
}
