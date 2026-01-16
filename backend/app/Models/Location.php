<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'address_line1',
        'address_line2',
        'city',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'phone',
        'email',
        'operating_hours',
        'features',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'operating_hours' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithFeature($query, string $feature)
    {
        return $query->whereJsonContains('features', $feature);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'location_product')
            ->withPivot('is_available')
            ->withTimestamps();
    }

    public function isOpenAt(string $datetime): bool
    {
        $date = \Carbon\Carbon::parse($datetime);
        $day = strtolower($date->format('D'));

        if (!isset($this->operating_hours[$day])) {
            return false;
        }

        $hours = $this->operating_hours[$day];

        if ($hours['is_closed'] ?? false) {
            return false;
        }

        $time = $date->format('H:i');
        $open = $hours['open'];
        $close = $hours['close'];

        return $time >= $open && $time <= $close;
    }

    public function getDistanceFrom(float $lat, float $lon): float
    {
        $lat1 = deg2rad($this->latitude);
        $lat2 = deg2rad($lat);
        $lon1 = deg2rad($this->longitude);
        $lon2 = deg2rad($lon);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a = sin($dlat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dlon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return 6371 * $c; // Distance in kilometers
    }
}
