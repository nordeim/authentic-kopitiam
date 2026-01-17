<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;


class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = "string";
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id',
        'is_active',
        'image_url',
        'calories',
        'stock_quantity',
    ];

    protected $casts = [
        'price' => 'decimal:4',
        'is_active' => 'boolean',
        'calories' => 'integer',
        'stock_quantity' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInCategory($query, string $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'location_product')
            ->withPivot('is_available')
            ->withTimestamps();
    }

    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format($this->price, 2);
    }
}
