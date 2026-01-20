<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'unit_price' => fake()->numberBetween(200, 1500), // DECIMAL(10,4) $2.0000 - $15.0000
            'quantity' => fake()->numberBetween(1, 5),
            'unit_name' => fake()->randomElement(['cup', 'piece', 'set', 'bowl']),
            'notes' => fake()->sentence(5, true),
        ];
    }
}
