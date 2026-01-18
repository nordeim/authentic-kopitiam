<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
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
        'payment_method',
        'status',
        'amount',
        'refunded_amount',
        'currency',
        'payment_provider',
        'provider_payment_id',
        'provider_payment_method_id',
        'provider_metadata',
        'paynow_qr_data',
        'payment_completed_at',
        'payment_failed_at',
        'refunded_at',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'provider_metadata' => 'array',
        'paynow_qr_data' => 'array',
        'payment_completed_at' => 'datetime',
        'payment_failed_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(PaymentRefund::class);
    }

    public function markAsCompleted(array $providerData = []): void
    {
        $this->update([
            'status' => 'completed',
            'payment_completed_at' => now(),
            'provider_metadata' => $providerData,
        ]);

        $this->order->update(['status' => 'processing']);
    }

    public function markAsFailed(string $reason, array $providerData = []): void
    {
        $this->update([
            'status' => 'failed',
            'payment_failed_at' => now(),
            'failure_reason' => $reason,
            'provider_metadata' => $providerData,
        ]);

        $this->order->update(['status' => 'cancelled']);
    }
}