<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_name' => fake()->name(),
            'customer_phone' => '+65 ' . fake()->numberBetween(80000000, 99999999),
            'customer_email' => fake()->email(),
            'location_id' => Location::inRandomOrder()->first()?->id,
            'pickup_at' => fake()->dateTimeBetween('now', '+7 days'),
            'status' => fake()->randomElement(['pending', 'confirmed', 'preparing', 'ready', 'completed']),
            'subtotal' => fake()->numberBetween(200, 3000), // DECIMAL(10,4) $2.0000 - $30.0000
            'gst_amount' => 0, // Calculated in afterCreating
            'total_amount' => 0, // Calculated in afterCreating
            'payment_method' => fake()->randomElement(['paynow', 'card', 'cash']),
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed']),
            'notes' => fake()->sentence(10, true),
            'user_id' => User::inRandomOrder()->first()?->id,
        ];
    }

    public function configure(): self
    {
        return $this->afterCreating(function (Order $order) {
            // Calculate GST (9%) - DECIMAL(10,4) precision
            $order->gst_amount = round($order->subtotal * 0.09, 4);
            $order->total_amount = round($order->subtotal + $order->gst_amount, 4);
            $order->save();

            // Create order items
            \App\Models\OrderItem::factory()
                ->count(fake()->numberBetween(1, 5))
                ->for($order)
                ->create();
        });
    }

    public function pending(): self
    {
        return $this->state(fn (array $attributes) => ['status' => 'pending']);
    }

    public function confirmed(): self
    {
        return $this->state(fn (array $attributes) => ['status' => 'confirmed']);
    }

    public function completed(): self
    {
        return $this->state(fn (array $attributes) => ['status' => 'completed']);
    }
}
