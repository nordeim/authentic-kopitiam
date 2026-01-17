<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'address' => trim($this->address_line1 . ' ' . $this->address_line2),
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'country' => $this->country,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'operating_hours' => $this->operating_hours,
            'features' => $this->features,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        if (isset($this->distance_km)) {
            $data['distance_km'] = $this->distance_km;
        }

        if ($request->input('with_inventory') === 'true') {
            $data['products'] = $this->products->map(function ($product) {
                return [
                    'product_id' => $product->id,
                    'stock_quantity' => $product->stock_quantity,
                    'last_restocked_at' => $product->last_restocked_at,
                    'is_available' => $product->is_available,
                    'name' => $product->name,
                    'sku' => $product->sku,
                ];
            });
        }

        return $data;
    }
}