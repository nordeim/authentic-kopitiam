<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;


class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    protected $keyType = "string";
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'unit_price',
        'quantity',
        'unit_name',
        'notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:4',
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

    public function getSubtotalAttribute(): float
    {
        return $this->unit_price * $this->quantity;
    }

    public function getFormattedSubtotalAttribute(): string
    {
        $subtotal = $this->subtotal;
        return '$' . number_format($subtotal, 2);
    }
}
