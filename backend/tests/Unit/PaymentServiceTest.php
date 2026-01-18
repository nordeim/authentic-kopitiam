<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentRefund;
use App\Models\Product;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\StripeService;
use App\Services\PayNowService;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Mockery;

class PaymentServiceTest extends \Tests\TestCase
{
    use RefreshDatabase;

    protected PaymentService $paymentService;
    protected StripeService $stripeService;
    protected PayNowService $paynowService;
    protected InventoryService $inventoryService;

    public function setUp(): void
    {
        parent::setUp();

        $this->stripeService = Mockery::mock(StripeService::class);
        $this->paynowService = Mockery::mock(PayNowService::class);
        $this->inventoryService = Mockery::mock(InventoryService::class);

        $this->paymentService = new PaymentService(
            $this->stripeService,
            $this->paynowService,
            $this->inventoryService
        );
    }

    /**
     * Test PayNow QR generation creates payment record
     */
    public function test_create_paynow_payment_generates_qr_code_and_payment_record()
    {
        $order = Order::factory()->create(['total_amount' => 25.50, 'status' => 'pending']);

        $this->paynowService->shouldReceive('generateQR')
            ->once()
            ->with(25.50, 'ORDER-' . $order->id)
            ->andReturn([
                'qr_code_url' => 'https://api.paynow.com/qr/abc123',
                'qr_code_data' => '000201010211...',
                'transaction_reference' => 'TXN-' . $order->id,
                'expires_at' => now()->addHour()->toIso8601String(),
                'amount' => 25.50,
                'reference_number' => 'ORDER-' . $order->id,
            ]);

        $payment = $this->paymentService->processPayNowPayment($order, 25.50, 'ORDER-' . $order->id);

        $this->assertInstanceOf(Payment::class, $payment);
        $this->assertEquals('paynow', $payment->payment_method);
        $this->assertEquals('pending', $payment->status);
        $this->assertEquals(25.50, $payment->amount);
        $this->assertEquals('SGD', $payment->currency);
        $this->assertEquals('paynow', $payment->payment_provider);
        $this->assertEquals('TXN-' . $order->id, $payment->provider_payment_id);
        $this->assertNotNull($payment->paynow_qr_data);
        $this->assertEquals('https://api.paynow.com/qr/abc123', $payment->paynow_qr_data['qr_code_url']);
        $this->assertEquals('ORDER-' . $order->id, $payment->paynow_qr_data['reference_number']);
    }

    /**
     * Test Stripe payment intent creation and payment record
     */
    public function test_create_stripe_payment_intent_and_payment_record()
    {
        $order = Order::factory()->create(['total_amount' => 45.99, 'status' => 'pending']);

        $this->stripeService->shouldReceive('createPaymentIntent')
            ->once()
            ->with(4599, 'SGD', ['order_id' => $order->id])
            ->andReturn([
                'client_secret' => 'pi_test_client_secret',
                'payment_intent_id' => 'pi_test_payment_intent_id',
                'amount' => 4599,
                'currency' => 'SGD',
            ]);

        $payment = $this->paymentService->processStripeCardPayment($order, 45.99, 'pm_test_payment_method');

        $this->assertInstanceOf(Payment::class, $payment);
        $this->assertEquals('stripe_card', $payment->payment_method);
        $this->assertEquals('pending', $payment->status);
        $this->assertEquals(45.99, $payment->amount);
        $this->assertEquals('SGD', $payment->currency);
        $this->assertEquals('stripe', $payment->payment_provider);
        $this->assertEquals('pi_test_payment_intent_id', $payment->provider_payment_id);
        $this->assertEquals('pm_test_payment_method', $payment->provider_payment_method_id);
        $this->assertNotNull($payment->provider_metadata);
        $this->assertEquals('pi_test_client_secret', $payment->provider_metadata['client_secret']);
    }

    /**
     * Test payment status sync updates order status
     */
    public function test_payment_status_sync_updates_order_status_to_processing_on_success()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
            'payment_method' => 'stripe_card',
            'payment_provider' => 'stripe',
            'provider_payment_id' => 'pi_test_sync',
        ]);

        $this->stripeService->shouldReceive('getPaymentStatus')
            ->once()
            ->with('pi_test_sync')
            ->andReturn([
                'id' => 'pi_test_sync',
                'status' => 'succeeded',
                'amount' => 2999,
                'currency' => 'SGD',
                'created' => time(),
                'updated' => time(),
            ]);

        $updatedPayment = $this->paymentService->syncPaymentStatus($payment);

        $this->assertEquals('completed', $updatedPayment->status);
        $this->assertNotNull($updatedPayment->payment_completed_at);
        $this->assertEquals('processing', $updatedPayment->order->status);
    }

    /**
     * Test webhook processing updates payment status (Stripe)
     */
    public function test_webhook_processing_updates_payment_status_stripe_success()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
            'payment_method' => 'stripe_card',
            'payment_provider' => 'stripe',
            'provider_payment_id' => 'pi_test_webhook',
        ]);

        $eventPayload = [
            'id' => 'evt_test',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_test_webhook',
                    'status' => 'succeeded',
                    'amount' => 3999,
                    'currency' => 'SGD',
                ]
            ]
        ];

        $this->stripeService->shouldReceive('verifyWebhookSignature')
            ->once()
            ->andReturn(new \Stripe\Event($eventPayload));

        $this->paymentService->processWebhook($eventPayload, 'v1.valid_signature', 'stripe');

        $updatedPayment = Payment::find($payment->id);
        $this->assertEquals('completed', $updatedPayment->status);
        $this->assertNotNull($updatedPayment->payment_completed_at);
        $this->assertEquals('processing', $updatedPayment->order->fresh()->status);
    }

    /**
     * Test refund processing updates payment and creates refund record
     */
    public function test_refund_processing_updates_payment_and_creates_refund_record()
    {
        $order = Order::factory()->create();
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'completed',
            'amount' => 55.00,
            'refunded_amount' => 0,
        ]);

        $this->stripeService->shouldReceive('processRefund')
            ->once()
            ->with('pi_test_refund', 2000, 'requested_by_customer')
            ->andReturn([
                'refund_id' => 're_test_refund',
                'payment_intent_id' => 'pi_test_refund',
                'amount' => 2000,
                'currency' => 'SGD',
                'status' => 'succeeded',
                'reason' => 'requested_by_customer',
            ]);

        $refund = $this->paymentService->refundPayment($payment, 20.00, 'requested_by_customer', null, false);

        $this->assertInstanceOf(PaymentRefund::class, $refund);
        $this->assertEquals($payment->id, $refund->payment_id);
        $this->assertEquals(20.00, $refund->amount);
        $this->assertEquals('re_test_refund', $refund->provider_refund_id);
        $this->assertEquals('requested_by_customer', $refund->reason);

        $updatedPayment = Payment::find($payment->id);
        $this->assertEquals(20.00, $updatedPayment->refunded_amount);
        $this->assertNotNull($updatedPayment->refunded_at);
    }

    /**
     * Test refund restores inventory when configured
     */
    public function test_refund_restores_inventory_when_configured()
    {
        $product = Product::factory()->create(['stock_quantity' => 10]);
        $order = Order::factory()->create();
        $order->items()->create([
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 15.00,
        ]);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'completed',
            'amount' => 30.00,
            'refunded_amount' => 0,
        ]);

        $this->stripeService->shouldReceive('processRefund')->andReturn([
            'refund_id' => 're_test_inventory',
            'amount' => 1500,
            'status' => 'succeeded',
        ]);

        $this->inventoryService->shouldReceive('restoreInventoryForCancelledOrder')
            ->once()
            ->with($order);

        $refund = $this->paymentService->refundPayment($payment, 15.00, 'requested_by_customer', null, true);

        $this->assertTrue($refund->inventory_restored);
    }

    /**
     * Test duplicate webhook is idempotent
     */
    public function test_duplicate_webhook_is_idempotent()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
            'payment_method' => 'paynow',
            'payment_provider' => 'paynow',
            'provider_payment_id' => 'txn_test_duplicate',
        ]);

        $this->paynowService->shouldReceive('verifyWebhookSignature')
            ->twice()
            ->andReturn(true);

        $this->paynowService->shouldReceive('parseWebhookPayload')
            ->twice()
            ->andReturn([
                'transaction_reference' => 'txn_test_duplicate',
                'reference_number' => 'ORDER-123',
                'status' => 'completed',
                'amount' => 45.00,
            ]);

        // Process webhook twice
        $this->paymentService->processWebhook([
            'transaction_reference' => 'txn_test_duplicate',
            'status' => 'completed',
        ], 'valid_signature', 'paynow');

        $this->paymentService->processWebhook([
            'transaction_reference' => 'txn_test_duplicate',
            'status' => 'completed',
        ], 'valid_signature', 'paynow');

        $updatedOrder = Order::find($order->id);
        $this->assertEquals('processing', $updatedOrder->status);

        $refundCount = PaymentRefund::where('payment_id', $payment->id)->count();
        $this->assertEquals(0, $refundCount); // No duplicate refunds created
    }

    /**
     * Test payment amount validation prevents overpayment
     */
    public function test_payment_amount_validation_prevents_overpayment()
    {
        $order = Order::factory()->create(['total_amount' => 100.00]);

        try {
            $this->paymentService->processPayNowPayment($order, 150.00, 'ORDER-' . $order->id);
            $this->fail('Exception should have been thrown for overpayment');
        } catch (\Exception $e) {
            $this->assertStringContainsString('does not match order total', $e->getMessage());
            $this->assertEquals(150.00, $order->total_amount); // Order unchanged
        }

        $paymentCount = Payment::where('order_id', $order->id)->count();
        $this->assertEquals(0, $paymentCount); // No payment created
    }

    /**
     * Test refund amount validation prevents over-refund
     */
    public function test_refund_amount_validation_prevents_over_refund()
    {
        $payment = Payment::factory()->create([
            'status' => 'completed',
            'amount' => 75.00,
            'refunded_amount' => 50.00,
        ]);

        try {
            $this->paymentService->refundPayment($payment, 30.00, 'requested_by_customer', null, false);
            $this->fail('Exception should have been thrown for over-refund');
        } catch (\Exception $e) {
            $this->assertStringContainsString('exceeds remaining refundable amount', $e->getMessage());
            $this->assertEquals(50.00, $payment->refunded_amount); // Refund amount unchanged
        }

        $refundCount = PaymentRefund::where('payment_id', $payment->id)->count();
        $this->assertEquals(0, $refundCount); // No refund created
    }

    /**
     * Test PayNow webhook processing updates order status
     */
    public function test_paynow_webhook_processing_updates_order_status_to_completed()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
            'payment_method' => 'paynow',
            'payment_provider' => 'paynow',
            'provider_payment_id' => 'txn_paynow_webhook',
        ]);

        $webhookPayload = [
            'transaction_reference' => 'txn_paynow_webhook',
            'reference_number' => 'ORDER-' . $order->id,
            'status' => 'completed',
            'amount' => 60.00,
        ];

        $this->paynowService->shouldReceive('verifyWebhookSignature')
            ->once()
            ->andReturn(true);

        $this->paynowService->shouldReceive('parseWebhookPayload')
            ->once()
            ->with($webhookPayload)
            ->andReturn($webhookPayload);

        $this->paymentService->processWebhook($webhookPayload, 'valid_signature', 'paynow');

        $updatedPayment = Payment::find($payment->id);
        $this->assertEquals('completed', $updatedPayment->status);
        $this->assertNotNull($updatedPayment->payment_completed_at);

        $updatedOrder = Order::find($order->id);
        $this->assertEquals('processing', $updatedOrder->status);
    }

    /**
     * Test PayNow webhook fail status cancels order
     */
    public function test_paynow_webhook_failed_status_cancels_order()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'status' => 'pending',
            'payment_method' => 'paynow',
            'payment_provider' => 'paynow',
            'provider_payment_id' => 'txn_paynow_failed',
        ]);

        $webhookPayload = [
            'transaction_reference' => 'txn_paynow_failed',
            'reference_number' => 'ORDER-' . $order->id,
            'status' => 'failed',
            'amount' => 50.00,
        ];

        $this->paynowService->shouldReceive('verifyWebhookSignature')->andReturn(true);
        $this->paynowService->shouldReceive('parseWebhookPayload')->andReturn($webhookPayload);

        $this->paymentService->processWebhook($webhookPayload, 'valid_signature', 'paynow');

        $updatedPayment = Payment::find($payment->id);
        $this->assertEquals('failed', $updatedPayment->status);
        $this->assertNotNull($updatedPayment->payment_failed_at);

        $updatedOrder = Order::find($order->id);
        $this->assertEquals('cancelled', $updatedOrder->status);
    }

    public function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}