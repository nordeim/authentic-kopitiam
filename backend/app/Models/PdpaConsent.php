<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;


class PdpaConsent extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = "string";
    public $incrementing = false;

    protected $fillable = [
        'customer_id',
        'pseudonymized_id',
        'consent_type',
        'consent_status',
        'consented_at',
        'withdrawn_at',
        'expires_at',
        'ip_address',
        'user_agent',
        'consent_wording_hash',
        'consent_version',
    ];

    protected $casts = [
        'consented_at' => 'datetime',
        'withdrawn_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeGranted($query)
    {
        return $query->where('consent_status', 'granted')
            ->where('expires_at', '>', now());
    }

    public function scopeWithdrawn($query)
    {
        return $query->where('consent_status', 'withdrawn');
    }

    public function scopeExpired($query)
    {
        return $query->where('consent_status', 'expired')
            ->orWhere('expires_at', '<=', now());
    }

    public function isExpired(): bool
    {
        return !is_null($this->expires_at) && $this->expires_at->isPast();
    }
}
