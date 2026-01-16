<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $categories = [
            'Coffee' => 'coffee',
            'Breakfast' => 'breakfast',
            'Pastries' => 'pastries',
            'Sides' => 'sides',
        ];

        $name = fake()->randomElement(array_keys($categories));

        return [
            'name' => $name,
            'slug' => $categories[$name] . '-' . fake()->unique()->randomNumber(4),
            'description' => fake()->sentence(),
            'is_active' => fake()->boolean(95), // 95% active
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function active(): self
    {
        return $this->state(fn (array $attributes) => ['is_active' => true]);
    }
}
