<?php

namespace Tests\Api;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    private $category;
    private $products;
    private $location;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->category = Category::factory()->create();
        $this->products = Product::factory()->count(3)->create([
            'category_id' => $this->category->id,
            'price' => 13.50,
            'stock_quantity' => 10,
        ]);
        $this->location = \App\Models\Location::factory()->create([
            'operating_hours' => [
                'mon' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
                'tue' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
                'wed' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
                'thu' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
                'fri' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
                'sat' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
                'sun' => ['open' => '07:00', 'close' => '22:00', 'is_closed' => false],
            ],
        ]);
    }

    public function test_create_order_with_valid_data()
    {
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 2,
                    'unit_price_cents' => 1350,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['id', 'customer_email', 'customer_phone', 'status', 'subtotal_cents', 'gst_cents', 'total_cents', 'location_id', 'pickup_at', 'invoice_number', 'created_at', 'updated_at']
        ]);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_create_order_calculates_gst_correctly()
    {
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1,
                    'unit_price_cents' => 1350,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $response->assertJsonFragment(['subtotal_cents' => 1350]);
        
        // GST at 9%: 1350 * 0.09 = 121.5 → rounded to 122 cents
        $response->assertJsonFragment(['gst_cents' => 122]);
        $response->assertJsonFragment(['total_cents' => 1472]); // 1350 + 122 = 1472
    }

    public function test_create_order_calculates_gst_edge_cases()
    {
        // Test $0.01 → GST should be $0.00 (rounded down)
        $this->products[0]->price = 0.01;
        $this->products[0]->save();

        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1,
                    'unit_price_cents' => 1,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $response->assertJsonFragment(['subtotal_cents' => 1]);
        $response->assertJsonFragment(['gst_cents' => 0]); // 1 * 0.09 = 0.09 → 0
        $response->assertJsonFragment(['total_cents' => 1]);

        // Test $999.99 → GST calculation
        $this->products[1]->price = 999.99;
        $this->products[1]->save();

        $orderData['items'] = [[
            'product_id' => $this->products[1]->id,
            'quantity' => 1,
            'unit_price_cents' => 99999,
        ]];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        // GST: 99999 * 0.09 = 8999.91 → 9000 cents
        $response->assertJsonFragment(['gst_cents' => 9000]);
        $response->assertJsonFragment(['total_cents' => 108999]); // 99999 + 9000 = 108999
    }

    public function test_inventory_reservation_prevents_overselling()
    {
        $product = $this->products[0];
        $product->stock_quantity = 5;
        $product->save();


        // Try to create 6th order - should fail
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'unit_price_cents' => 1350,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(422);
        $response->assertJsonFragment(['insufficient_stock' => true]);
    }

    public function test_concurrent_inventory_reservations()
    {
        $product = $this->products[0];
        $product->stock_quantity = 100;
        $product->save();

        // Simulate 100 concurrent orders
        $responses = [];
        for ($i = 0; $i < 100; $i++) {
            $orderData = [
                'customer_email' => "customer$i@example.com",
                'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 1,
                        'unit_price_cents' => 1350,
                    ],
                ],
            ];

            $responses[] = $this->postJson('/api/v1/orders', $orderData);
        }

        // All should succeed
        foreach ($responses as $response) {
            $response->assertStatus(201);
        }

        // Verify exactly 100 orders created
        $this->assertEquals(100, Order::count());

        // Verify stock is now 0
        $this->assertEquals(0, $product->fresh()->stock_quantity);
    }

    public function test_order_cancellation_releases_inventory()
    {
        $product = $this->products[0];
        $initialStock = $product->stock_quantity;

        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 3,
                    'unit_price_cents' => 1350,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);
        $response->assertStatus(201);
        $orderId = $response->json('data.id');

        // Verify stock reduced
        $this->assertEquals($initialStock - 3, $product->fresh()->stock_quantity);

        // Cancel order
        $this->putJson('/api/v1/orders/'.$orderId.'/status', ['status' => 'cancelled']);

        // Verify stock restored
        $this->assertEquals($initialStock, $product->fresh()->stock_quantity);
    }

    public function test_order_status_transitions()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'confirmed'])
            ->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'preparing'])
            ->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'ready'])
            ->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'completed'])
            ->assertStatus(200);

        $order->refresh();
        $this->assertEquals('completed', $order->status);
    }

    public function test_pdpa_consent_recorded_with_order()
    {
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1,
                    'unit_price_cents' => 1350,
                ],
            ],
            'consent' => [
                'marketing' => true,
                'analytics' => true,
                'consent_wording_hash' => hash('sha256', 'test wording'),
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('pdpa_consents', [
            'pseudonymized_id' => hash('sha256', 'customer@example.com'),
            'consent_type' => 'marketing',
            'consent_given' => true,
        ]);
    }

    public function test_invoice_number_generation_format()
    {
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1,
                    'unit_price_cents' => 1350,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $invoiceNumber = $response->json('data.invoice_number');
        
        // Should match pattern: INV-2026-NNNNNN
        $this->assertMatchesRegularExpression('/^INV-\d{4}-\d{6}$/', $invoiceNumber);
        $this->assertStringContainsString('2026', $invoiceNumber);
    }

    public function test_pickup_at_validation_against_operating_hours()
    {
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-19T23:00:00+08:00', // Outside operating hours (7am-10pm)
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1,
                    'unit_price_cents' => 1350,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(422);
        $response->assertJsonFragment(['pickup_at' => 'Location is closed at this time']);
    }
}
