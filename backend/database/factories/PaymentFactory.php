<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'method' => fake()->randomElement(['paynow', 'card', 'cash']),
            'amount' => fake()->randomFloat(4, 2.00, 50.00),
            'transaction_id' => fake()->uuid(),
            'status' => fake()->randomElement(['pending', 'completed', 'failed', 'refunded']),
            'paynow_qr_code' => fake()->optional()->imageUrl(300, 300, 'qr'),
            'completed_at' => fake()->optional()->dateTimeBetween('-7 days', 'now'),
            'metadata' => fake()->randomElement([null, ['test' => 'data']]),
        ];
    }
}
