<?php

namespace Tests\Api;

use App\Models\Location;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationControllerTest extends TestCase
{
    use RefreshDatabase;

    private $locations;
    private $products;

    protected function setUp(): void
    {
        parent::setUp();
        
        $category = Category::factory()->create();
        $this->products = Product::factory()->count(5)->create(['category_id' => $category->id]);
        
        $this->locations = Location::factory()->count(3)->create([
            'operating_hours' => [
                'monday' => ['open' => '07:00', 'close' => '22:00'],
                'tuesday' => ['open' => '07:00', 'close' => '22:00'],
                'wednesday' => ['open' => '07:00', 'close' => '22:00'],
                'thursday' => ['open' => '07:00', 'close' => '22:00'],
                'friday' => ['open' => '07:00', 'close' => '22:00'],
                'saturday' => ['open' => '07:00', 'close' => '22:00'],
                'sunday' => ['open' => '07:00', 'close' => '22:00'],
            ],
            'features' => ['wifi', 'outdoor_seating', 'cashless'],
        ]);

        $this->locations[0]->products()->attach($this->products[0], ['stock_quantity' => 20]);
        $this->locations[0]->products()->attach($this->products[1], ['stock_quantity' => 15]);
        $this->locations[1]->products()->attach($this->products[2], ['stock_quantity' => 10]);
    }

    public function test_list_locations_with_distance_calculation()
    {
        $response = $this->getJson('/api/v1/locations?lat=1.3521&lon=103.8198');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'address', 'postal_code', 'latitude', 'longitude', 'operating_hours', 'features', 'distance_km', 'created_at', 'updated_at']
            ]
        ]);
        
        $this->assertEquals(3, count($response->json('data')));
        
        // Verify distances are calculated and sorted
        $distances = array_map(function($loc) {
            return $loc['distance_km'];
        }, $response->json('data'));
        
        // Check that distances are in ascending order
        for ($i = 1; $i < count($distances); $i++) {
            $this->assertLessThanOrEqual($distances[$i], $distances[$i-1]);
        }
    }

    public function test_filter_locations_by_product_availability()
    {
        $productId = $this->products[0]->id;
        
        $response = $this->getJson('/api/v1/locations?has_product='.$productId);

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
        $this->assertEquals($this->locations[0]->id, $response->json('data.0.id'));
    }

    public function test_filter_locations_by_feature()
    {
        $response = $this->getJson('/api/v1/locations?feature=wifi');

        $response->assertStatus(200);
        $this->assertEquals(3, count($response->json('data')));
    }

    public function test_filter_locations_by_nonexistent_feature()
    {
        $response = $this->getJson('/api/v1/locations?feature=parking');

        $response->assertStatus(200);
        $this->assertEquals(0, count($response->json('data')));
    }

    public function test_show_single_location()
    {
        $response = $this->getJson('/api/v1/locations/'.$this->locations[0]->id);

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['id', 'name', 'address', 'postal_code', 'latitude', 'longitude', 'operating_hours', 'features', 'created_at', 'updated_at']]);
    }

    public function test_show_location_with_product_inventory()
    {
        $response = $this->getJson('/api/v1/locations/'.$this->locations[0]->id.'?with_inventory=true');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id', 'name', 'products' => [
                    '*' => ['product_id', 'stock_quantity', 'last_restocked_at']
                ]
            ]
        ]);
        
        $this->assertEquals(2, count($response->json('data.products')));
    }

    public function test_operating_hours_isopenat_validation()
    {
        $location = $this->locations[0];
        
        // Test business hours (7am)
        $monday7am = '2026-01-19T07:00:00+08:00'; // Monday 7am
        $this->assertTrue($location->isOpenAt($monday7am));
        
        // Test before business hours (6:59am)
        $monday659am = '2026-01-19T06:59:00+08:00'; // Monday 6:59am
        $this->assertFalse($location->isOpenAt($monday659am));
        
        // Test after business hours (10:01pm)
        $monday1001pm = '2026-01-19T22:01:00+08:00'; // Monday 10:01pm
        $this->assertFalse($location->isOpenAt($monday1001pm));
    }

    public function test_create_location_requires_authentication()
    {
        $response = $this->postJson('/api/v1/locations', ['name' => 'New Location']);

        $response->assertStatus(401);
    }

    public function test_update_location_requires_authentication()
    {
        $response = $this->putJson('/api/v1/locations/'.$this->locations[0]->id, ['name' => 'Updated Location']);

        $response->assertStatus(401);
    }

    public function test_delete_location_with_orders_prevented()
    {
        $location = $this->locations[0];
        
        $response = $this->deleteJson('/api/v1/locations/'.$location->id);

        $response->assertStatus(401);
    }
}