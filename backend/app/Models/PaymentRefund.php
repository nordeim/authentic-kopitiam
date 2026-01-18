<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PaymentRefund extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    protected $keyType = "string";
    public $incrementing = false;

    protected $fillable = [
        'payment_id',
        'amount',
        'currency',
        'provider_refund_id',
        'provider_metadata',
        'reason',
        'inventory_restored',
        'refunded_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'provider_metadata' => 'array',
        'inventory_restored' => 'boolean',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function refundedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }
}
