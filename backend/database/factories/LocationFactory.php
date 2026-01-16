<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            'name' => 'Morning Brew ' . fake()->randomElement(['Central', 'East', 'West', 'North', 'South']),
            'address_line1' => fake()->streetAddress(),
            'address_line2' => fake()->secondaryAddress(),
            'city' => 'Singapore',
            'postal_code' => str_pad(fake()->numberBetween(100000, 999999), 6, '0', STR_PAD_LEFT),
            'country' => 'Singapore',
            'latitude' => fake()->latitude(1.2, 1.5), // Singapore lat range
            'longitude' => fake()->longitude(103.6, 104.0), // Singapore lon range
            'phone' => '+65 ' . fake()->numberBetween(60000000, 99999999),
            'email' => fake()->companyEmail(),
            'operating_hours' => $this->generateOperatingHours(),
            'features' => fake()->randomElements(['wifi', 'ac', 'seating', 'parking', 'drive_thru', 'delivery'], rand(3, 6)),
            'is_active' => fake()->boolean(95), // 95% active
        ];
    }

    protected function generateOperatingHours(): array
    {
        $days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        $hours = [];

        foreach ($days as $day) {
            $hours[$day] = [
                'open' => fake()->randomElement(['07:00', '08:00']),
                'close' => fake()->randomElement(['21:00', '22:00']),
                'is_closed' => fake()->boolean(5), // 5% chance of closed
            ];
        }

        return $hours;
    }
}
