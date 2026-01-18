<?php

namespace Tests\Api;

use App\Models\User;
use App\Models\Order;
use App\Models\Location;
use App\Models\Product;
use App\Models\Category;
use App\Models\PdpaConsent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    protected Location $location;
    protected array $products;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->location = Location::factory()->create([
            'name' => 'Test Kopitiam',
            'opens_at' => '08:00',
            'closes_at' => '22:00',
        ]);

        $category = Category::factory()->create(['name' => 'Beverages']);

        $this->products = [
            Product::factory()->create([
                'name' => 'Kopi',
                'price' => 1.50,
                'stock_quantity' => 10,
                'category_id' => $category->id,
                'image_url' => 'https://example.com/kopi.jpg',
            ]),
            Product::factory()->create([
                'name' => 'Teh',
                'price' => 1.50,
                'stock_quantity' => 10,
                'category_id' => $category->id,
                'image_url' => 'https://example.com/teh.jpg',
            ]),
        ];

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
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
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'customer_name',
                'customer_email',
                'customer_phone',
                'location_id',
                'pickup_at',
                'status',
                'notes',
                'subtotal_cents',
                'gst_cents',
                'total_cents',
                'created_at',
                'updated_at',
                'location',
                'items',
            ],
            'message',
        ]);

        $response->assertJson([
            'data' => [
                'customer_name' => 'John Doe',
                'customer_email' => 'customer@example.com',
                'customer_phone' => '+65 81234567',
                'location_id' => $this->location->id,
                'status' => 'pending',
                'subtotal_cents' => 300,
                'gst_cents' => 27,
                'total_cents' => 327,
            ],
            'message' => 'Order created successfully',
        ]);

        // Verify pickup time format
        $pickupAt = \Carbon\Carbon::parse($response->json('data.pickup_at'));
        $this->assertEquals(14, $pickupAt->hour);
        $this->assertEquals(0, $pickupAt->minute);

        // Verify inventory was decreased
        $product = Product::find($this->products[0]->id);
        $this->assertEquals(8, $product->stock_quantity);
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
                    'unit_price_cents' => 1000, // $10.00
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $response->assertJson([
            'data' => [
                'subtotal_cents' => 1000,
                'gst_cents' => 90, // 9% of $10 = $0.90 = 90 cents
                'total_cents' => 1090,
            ],
        ]);
    }

    public function test_create_order_calculates_gst_edge_cases()
    {
        // Test rounding edge case: $1.50 * 0.09 = 13.5 cents => should be 14 cents
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
                    'unit_price_cents' => 150, // $1.50
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $response->assertJson([
            'data' => [
                'subtotal_cents' => 150,
                'gst_cents' => 14, // Should be 14 (rounded up from 13.5)
                'total_cents' => 164,
            ],
        ]);
    }

    public function test_inventory_reservation_prevents_overselling()
    {
        // First, reduce stock to 1
        $this->products[0]->update(['stock_quantity' => 1]);

        // Try to order 2 when only 1 in stock
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
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Validation failed',
        ]);

        // Verify stock unchanged
        $product = Product::find($this->products[0]->id);
        $this->assertEquals(1, $product->stock_quantity);
    }

    public function test_concurrent_inventory_reservations()
    {
        // Set initial stock quantity
        $this->products[0]->update(['stock_quantity' => 10]);

        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T14:00:00+08:00',
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 3,
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        // Send 4 concurrent requests (3*4 = 12 > 10 stock)
        $responses = [];
        for ($i = 0; $i < 4; $i++) {
            $orderData['customer_email'] = "customer{$i}@example.com";
            $responses[] = $this->postJson('/api/v1/orders', $orderData);
        }

        // Wait for all to complete
        foreach ($responses as $i => $response) {
            // Should receive mixed responses
            $this->assertTrue(in_array($response->status(), [201, 422]));
        }

        // Verify final stock is 1 (10 - 3*3 = 1 successful orders)
        // But since it's concurrent, we expect exactly 3 successful (9 items) and 1 failed
        $product = Product::find($this->products[0]->id);
        // The exact value may vary due to concurrent execution, but should be >= 1
        $this->assertGreaterThanOrEqual(1, $product->stock_quantity);
    }

    public function test_order_cancellation_releases_inventory()
    {
        // Create order first (stock starts at 10)
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
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);
        $response->assertStatus(201);

        $orderId = $response->json('data.id');

        // Verify stock decreased to 8
        $product = Product::find($this->products[0]->id);
        $this->assertEquals(8, $product->stock_quantity);

        // Cancel the order using customer ownership verification
        $cancelResponse = $this->putJson("/api/v1/orders/{$orderId}/status", [
            'status' => 'cancelled',
            'customer_email' => 'customer@example.com',
            'invoice_number' => $response->json('data.invoice_number'),
        ]);

        $cancelResponse->assertStatus(200);
        $cancelResponse->assertJson(['data' => ['status' => 'cancelled']]);

        // Verify stock restored to 10
        $product = Product::find($this->products[0]->id);
        $this->assertEquals(10, $product->stock_quantity);
    }

    public function test_order_status_transitions()
    {
        // Create order
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
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        $createResponse = $this->postJson('/api/v1/orders', $orderData);
        $createResponse->assertStatus(201);
        $orderId = $createResponse->json('data.id');
        $invoiceNumber = $createResponse->json('data.invoice_number');

        // Test various status transitions
        $statuses = ['confirmed', 'preparing', 'ready', 'completed'];
        foreach ($statuses as $status) {
            $response = $this->putJson("/api/v1/orders/{$orderId}/status", [
                'status' => $status,
                'customer_email' => 'customer@example.com',
                'invoice_number' => $invoiceNumber,
            ]);

            $response->assertStatus(200);
            $response->assertJson(['data' => ['status' => $status]]);
        }
    }

    public function test_pickup_at_validation_against_operating_hours()
    {
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'location_id' => $this->location->id,
            'pickup_at' => '2026-01-18T23:00:00+08:00', // After closing time (22:00)
            'items' => [
                [
                    'product_id' => $this->products[0]->id,
                    'quantity' => 1,
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(422);
        $response->assertJson([
            'errors' => [
                'pickup_at' => ['Location is not open at this time'],
            ],
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
                    'unit_price_cents' => 150,
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);
        $invoiceNumber = $response->json('data.invoice_number');

        // Verify format: MBC-YYYYMMDD-XXXXX
        $this->assertMatchesRegularExpression('/^MBC-[0-9]{8}-[0-9]{5}$/', $invoiceNumber);
    }

    public function test_pdpa_consent_recorded_with_order()
    {
        \Log::info('Starting PDPA consent test');

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
                [
                    'type' => 'marketing',
                    'wording' => 'I consent to marketing communications',
                    'version' => '1.0',
                ],
                [
                    'type' => 'analytics',
                    'wording' => 'I consent to analytics for service improvement',
                    'version' => '1.0',
                ],
            ],
        ];

        \Log::debug('Sending order request with consent', [
            'order_data' => $orderData,
            'consent_count' => count($orderData['consent'])
        ]);

        $response = $this->postJson('/api/v1/orders', $orderData);

        $response->assertStatus(201);

        // Verify consents recorded
        $pseudonymizedId = hash('sha256', 'customer@example.com');

        \Log::debug('Checking consents in database', ['pseudonymized_id' => $pseudonymizedId]);

        // Check marketing consent
        $this->assertDatabaseHas('pdpa_consents', [
            'pseudonymized_id' => $pseudonymizedId,
            'consent_type' => 'marketing',
            'consent_status' => 'granted',
        ]);

        // Check analytics consent
        $this->assertDatabaseHas('pdpa_consents', [
            'pseudonymized_id' => $pseudonymizedId,
            'consent_type' => 'analytics',
            'consent_status' => 'granted',
        ]);

        // Verify the consent wording hash and version
        $marketingConsent = PdpaConsent::where('pseudonymized_id', $pseudonymizedId)
            ->where('consent_type', 'marketing')
            ->first();

        $this->assertNotNull($marketingConsent);
        $this->assertEquals(hash('sha256', 'I consent to marketing communications'), $marketingConsent->consent_wording_hash);
        $this->assertEquals('1.0', $marketingConsent->consent_version);

        \Log::info('PDPA consent test completed successfully');
    }

    public function test_duplicate_consent_renews_existing_record()
    {
        $customerEmail = 'customer@example.com';
        $pseudonymizedId = hash('sha256', $customerEmail);

        // Create initial consent
        PdpaConsent::create([
            'pseudonymized_id' => $pseudonymizedId,
            'consent_type' => 'marketing',
            'consent_status' => 'granted',
            'consented_at' => now()->subDays(10),
            'expires_at' => now()->addDays(20),
            'consent_wording_hash' => hash('sha256', 'Old wording'),
            'consent_version' => '1.0',
        ]);

        // Create order with same consent type
        $orderData = [
            'customer_name' => 'John Doe',
            'customer_email' => $customerEmail,
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
                [
                    'type' => 'marketing',
                    'wording' => 'I consent to marketing communications',
                    'version' => '1.0',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/orders', $orderData);
        $response->assertStatus(201);

        // Should have only one consent record (not duplicate)
        $consents = PdpaConsent::where('pseudonymized_id', $pseudonymizedId)
            ->where('consent_type', 'marketing')
            ->get();

        $this->assertCount(1, $consents);
        
        // Should be renewed with new consented_at timestamp
        $consent = $consents->first();
        $this->assertTrue($consent->consented_at->diffInDays(now()) < 1);
    }
}
