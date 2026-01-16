<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\PdpaConsent;
use Illuminate\Database\Eloquent\Factories\Factory;

class PdpaConsentFactory extends Factory
{
    protected $model = PdpaConsent::class;

    public function definition(): array
    {
        return [
            'customer_id' => User::inRandomOrder()->first()?->id,
            'pseudonymized_id' => hash('sha256', fake()->uuid()),
            'consent_type' => fake()->randomElement(['marketing', 'analytics', 'third_party']),
            'consent_status' => fake()->randomElement(['granted', 'withdrawn', 'expired']),
            'consented_at' => fake()->dateTimeBetween('-6 months', 'now'),
            'withdrawn_at' => fake()->optional()->dateTimeBetween('-6 months', 'now'),
            'expires_at' => fake()->optional()->dateTimeBetween('now', '+2 years'),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'consent_wording_hash' => hash('sha256', 'I agree to terms and conditions'),
            'consent_version' => 'v1.0.0',
        ];
    }

    public function granted(): self
    {
        return $this->state(fn (array $attributes) => [
            'consent_status' => 'granted',
            'withdrawn_at' => null,
        ]);
    }
}
