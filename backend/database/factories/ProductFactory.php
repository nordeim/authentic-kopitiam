<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Kopi-O', 'Kopi-C', 'Kopi-O Kosong', 'Kopi-Peng',
                'Kaya Toast', 'Half-Boiled Eggs', 'French Toast',
                'Roti Prata', 'Mee Goreng', 'Nasi Lemak',
                'Char Kway Teow', 'Hokkien Mee', 'Laksa',
            ]),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(4, 2.00, 15.00), // DECIMAL(10,4)
            'category_id' => $this->getValidCategoryId(),
            'is_active' => fake()->boolean(90), // 90% active
            'image_url' => fake()->imageUrl(400, 300, 'coffee'),
            'calories' => fake()->numberBetween(50, 500),
            'stock_quantity' => fake()->numberBetween(10, 100),
        ];
    }

    private function getValidCategoryId(): string
    {
        // During seeding or when no categories exist, create one
        $category = Category::inRandomOrder()->first();
        
        if (!$category) {
            $category = Category::factory()->create();
        }
        
        return $category->id;
    }

    public function active(): self
    {
        return $this->state(fn (array $attributes) => ['is_active' => true]);
    }
}
