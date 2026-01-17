<?php

namespace Tests\Api;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    private $category;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->category = Category::factory()->create();
        $this->product = Product::factory()->create([
            'category_id' => $this->category->id,
            'price' => 13.50,
            'active' => true,
            'stock_quantity' => 50,
        ]);
    }

    public function test_list_products_paginated()
    {
        Product::factory()->count(25)->create(['category_id' => $this->category->id]);
        
        $response = $this->getJson('/api/v1/products');
        
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'slug', 'description', 'price', 'active', 'stock_quantity', 'category_id', 'created_at', 'updated_at']
            ],
            'meta' => ['current_page', 'per_page', 'total', 'last_page', 'from', 'to'],
            'links' => ['first', 'last', 'prev', 'next']
        ]);
        $this->assertEquals(20, count($response->json('data')));
        $this->assertEquals(26, $response->json('meta.total'));
    }

    public function test_list_products_with_pagination_custom_per_page()
    {
        Product::factory()->count(25)->create(['category_id' => $this->category->id]);
        
        $response = $this->getJson('/api/v1/products?per_page=50');
        
        $response->assertStatus(200);
        $this->assertEquals(26, count($response->json('data')));
    }

    public function test_list_products_max_pagination_limit()
    {
        Product::factory()->count(150)->create(['category_id' => $this->category->id]);
        
        $response = $this->getJson('/api/v1/products?per_page=200');
        
        $response->assertStatus(200);
        $this->assertEquals(100, count($response->json('data')));
    }

    public function test_list_products_filter_by_category()
    {
        $category2 = Category::factory()->create();
        Product::factory()->count(5)->create(['category_id' => $this->category->id]);
        Product::factory()->count(10)->create(['category_id' => $category2->id]);
        
        $response = $this->getJson('/api/v1/products?category_id='.$category2->id);
        
        $response->assertStatus(200);
        $this->assertEquals(10, count($response->json('data')));
    }

    public function test_list_products_filter_by_active()
    {
        Product::factory()->count(3)->create(['category_id' => $this->category->id, 'active' => false]);
        Product::factory()->count(7)->create(['category_id' => $this->category->id, 'active' => true]);
        
        $response = $this->getJson('/api/v1/products?active=true');
        
        $response->assertStatus(200);
        $this->assertEquals(7 + 1, count($response->json('data'))); // +1 from setUp
    }

    public function test_list_products_search_by_name()
    {
        Product::factory()->create(['category_id' => $this->category->id, 'name' => 'Special Coffee Blend']);
        Product::factory()->create(['category_id' => $this->category->id, 'name' => 'Regular Coffee']);
        
        $response = $this->getJson('/api/v1/products?search=Special');
        
        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    public function test_show_single_product()
    {
        $response = $this->getJson('/api/v1/products/'.$this->product->id);
        
        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['id', 'name', 'slug', 'description', 'price', 'active', 'stock_quantity', 'category_id', 'created_at', 'updated_at']]);
        $this->assertEquals($this->product->id, $response->json('data.id'));
    }

    public function test_show_non_existent_product_returns_404()
    {
        $response = $this->getJson('/api/v1/products/00000000-0000-0000-0000-000000000000');
        
        $response->assertStatus(404);
    }

    public function test_create_product_requires_authentication()
    {
        $response = $this->postJson('/api/v1/products', ['name' => 'New Product']);
        
        $response->assertStatus(401);
    }

    public function test_update_product_requires_authentication()
    {
        $response = $this->putJson('/api/v1/products/'.$this->product->id, ['name' => 'Updated Product']);
        
        $response->assertStatus(401);
    }

    public function test_delete_product_requires_authentication()
    {
        $response = $this->deleteJson('/api/v1/products/'.$this->product->id);
        
        $response->assertStatus(401);
    }
}
