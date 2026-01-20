<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentRefund;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PaymentService
{
    protected StripeService $stripeService;
    protected PayNowService $paynowService;
    protected InventoryService $inventoryService;

    public function __construct(
        StripeService $stripeService,
        PayNowService $paynowService,
        InventoryService $inventoryService
    ) {
        $this->stripeService = $stripeService;
        $this->paynowService = $paynowService;
        $this->inventoryService = $inventoryService;
    }

    /**
     * Process PayNow payment for an order
     * @param Order $order
     * @param float $amount
     * @param string $referenceNumber
     * @return Payment
     * @throws \Exception
     */
    public function processPayNowPayment(Order $order, float $amount, string $referenceNumber): Payment
    {
        if ($order->total_amount !== $amount) {
            throw new \Exception("Payment amount ({$amount}) does not match order total ({$order->total_amount})");
        }

        $existingPayment = Payment::where('order_id', $order->id)
            ->where('payment_method', 'paynow')
            ->where('status', 'pending')
            ->first();

        if ($existingPayment) {
            Log::info('Found existing pending PayNow payment', [
                'payment_id' => $existingPayment->id,
                'order_id' => $order->id,
            ]);
            return $existingPayment;
        }

        DB::beginTransaction();
        try {
            $qrData = $this->paynowService->generateQR($amount, $referenceNumber);

            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'paynow',
                'status' => 'pending',
                'amount' => $amount,
                'refunded_amount' => 0,
                'currency' => 'SGD',
                'payment_provider' => 'paynow',
                'provider_payment_id' => $qrData['transaction_reference'],
                'paynow_qr_data' => $qrData,
            ]);

            DB::commit();

            Log::info('PayNow payment created successfully', [
                'payment_id' => $payment->id,
                'order_id' => $order->id,
                'amount' => $amount,
            ]);

            return $payment;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PayNow payment creation failed', [
                'order_id' => $order->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Process Stripe card payment for an order
     * @param Order $order
     * @param float $amount
     * @param string $paymentMethodId
     * @return Payment
     * @throws \Exception
     */
    public function processStripeCardPayment(Order $order, float $amount, string $paymentMethodId): Payment
    {
        if ($order->total_amount !== $amount) {
            throw new \Exception("Payment amount ({$amount}) does not match order total ({$order->total_amount})");
        }

        $existingPayment = Payment::where('order_id', $order->id)
            ->where('payment_method', 'stripe_card')
            ->where('status', 'pending')
            ->first();

        if ($existingPayment) {
            Log::info('Found existing pending Stripe payment', [
                'payment_id' => $existingPayment->id,
                'order_id' => $order->id,
            ]);
            return $existingPayment;
        }

        DB::beginTransaction();
        try {
            $stripeData = $this->stripeService->createPaymentIntent(
                $amount,  // ✅ DECIMAL(10,4) → Stripe converts internally
                'SGD',
                [
                    'order_id' => $order->id,
                ]
            );

            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'stripe_card',
                'status' => 'pending',
                'amount' => $amount,
                'refunded_amount' => 0,
                'currency' => 'SGD',
                'payment_provider' => 'stripe',
                'provider_payment_id' => $stripeData['payment_intent_id'],
                'provider_payment_method_id' => $paymentMethodId,
                'provider_metadata' => $stripeData,
            ]);

            DB::commit();

            Log::info('Stripe payment created successfully', [
                'payment_id' => $payment->id,
                'order_id' => $order->id,
                'stripe_payment_intent_id' => $stripeData['payment_intent_id'],
                'amount' => $amount,
            ]);

            return $payment;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Stripe payment creation failed', [
                'order_id' => $order->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Process payment refund
     * @param Payment $payment
     * @param float $amount
     * @param string $reason
     * @param User|null $initiatedBy
     * @param bool $restoreInventory
     * @return PaymentRefund
     * @throws \Exception
     */
    public function refundPayment(Payment $payment, float $amount, string $reason, ?User $initiatedBy = null, bool $restoreInventory = false): PaymentRefund
    {
        $remainingRefundableAmount = $payment->amount - $payment->refunded_amount;

        if ($amount > $remainingRefundableAmount) {
            throw new \Exception("Refund amount ({$amount}) exceeds remaining refundable amount ({$remainingRefundableAmount})");
        }

        DB::beginTransaction();
        try {
            $refundData = null;

            if ($payment->payment_provider === 'stripe' && $payment->provider_payment_id) {
                $stripeRefundData = $this->stripeService->processRefund(
                    $payment->provider_payment_id,
                    $amount,  // ✅ DECIMAL(10,4) → Stripe converts internally
                    $reason,
                    [
                        'order_id' => $payment->order_id,
                        'refund_id' => $refund->id,
                    ]
                );
            } elseif ($payment->payment_provider === 'paynow') {
                Log::info('PayNow refund initiated - manual processing required', [
                    'payment_id' => $payment->id,
                    'transaction_reference' => $payment->provider_payment_id,
                ]);
            }

            $refund = PaymentRefund::create([
                'payment_id' => $payment->id,
                'amount' => $amount,
                'currency' => $payment->currency,
                'provider_refund_id' => $refundData ? $refundData['refund_id'] : null,
                'provider_metadata' => $refundData ?? [],
                'reason' => $reason,
                'inventory_restored' => false,
                'refunded_by' => $initiatedBy ? $initiatedBy->id : null,
            ]);

            $payment->update([
                'refunded_amount' => $payment->refunded_amount + $amount,
                'refunded_at' => now(),
            ]);

            if ($payment->refunded_amount >= $payment->amount) {
                $payment->update(['status' => 'refunded']);
            }

            DB::commit();

            if ($restoreInventory && $payment->order) {
                try {
                    $this->inventoryService->restoreInventoryForCancelledOrder($payment->order);
                    $refund->update(['inventory_restored' => true]);
                    Log::info('Inventory restored for refunded order', [
                        'order_id' => $payment->order->id,
                        'refund_id' => $refund->id,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to restore inventory for refund', [
                        'order_id' => $payment->order->id,
                        'refund_id' => $refund->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Payment refunded successfully', [
                'payment_id' => $payment->id,
                'refund_id' => $refund->id,
                'amount' => $amount,
                'reason' => $reason,
                'restore_inventory' => $restoreInventory,
            ]);

            return $refund;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment refund failed', [
                'payment_id' => $payment->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Sync payment status from provider
     * @param Payment $payment
     * @return Payment
     * @throws \Exception
     */
    public function syncPaymentStatus(Payment $payment): Payment
    {
        if ($payment->payment_provider === 'stripe' && $payment->provider_payment_id) {
            $statusData = $this->stripeService->getPaymentStatus($payment->provider_payment_id);

            if ($statusData['status'] === 'succeeded' && $payment->status !== 'completed') {
                $payment->markAsCompleted($statusData);
                Log::info('Payment status synced to completed from Stripe', [
                    'payment_id' => $payment->id,
                    'stripe_payment_intent_id' => $payment->provider_payment_id,
                ]);
            }
        }

        return $payment;
    }

    /**
     * Process webhook from payment provider
     * @param array $payload
     * @param string $signature
     * @param string $provider
     * @return void
     * @throws \Exception
     */
    public function processWebhook(array $payload, string $signature, string $provider): void
    {
        if ($provider === 'stripe') {
            $event = $this->stripeService->verifyWebhookSignature(
                json_encode($payload),
                $signature
            );

            $this->handleStripeWebhook($event);
        } elseif ($provider === 'paynow') {
            if (!$this->paynowService->verifyWebhookSignature(json_encode($payload), $signature)) {
                throw new \Exception('Invalid PayNow webhook signature');
            }

            $parsedData = $this->paynowService->parseWebhookPayload($payload);
            $this->handlePayNowWebhook($parsedData);
        } else {
            throw new \Exception("Unknown payment provider: {$provider}");
        }
    }

    /**
     * Handle Stripe webhook event
     * @param \Stripe\Event $event
     * @return void
     * @throws \Exception
     */
    protected function handleStripeWebhook(\Stripe\Event $event): void
    {
        $paymentIntent = $event->data->object;

        $payment = Payment::where('provider_payment_id', $paymentIntent->id)->first();

        if (!$payment) {
            Log::warning('Payment not found for webhook', [
                'stripe_payment_intent_id' => $paymentIntent->id,
                'event_type' => $event->type,
            ]);
            return;
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $payment->markAsCompleted(['stripe_event' => $event->type]);
                break;

            case 'payment_intent.payment_failed':
                $payment->markAsFailed(
                    $paymentIntent->last_payment_error->message ?? 'Payment failed',
                    ['stripe_event' => $event->type]
                );
                break;

            case 'payment_intent.processing':
                $payment->update(['status' => 'processing']);
                break;

            default:
                Log::debug('Unhandled Stripe webhook event', [
                    'payment_id' => $payment->id,
                    'event_type' => $event->type,
                ]);
                break;
        }

        Log::info('Stripe webhook processed', [
            'payment_id' => $payment->id,
            'event_type' => $event->type,
            'order_id' => $payment->order_id,
        ]);
    }

    /**
     * Handle PayNow webhook data
     * @param array $data
     * @return void
     * @throws \Exception
     */
    protected function handlePayNowWebhook(array $data): void
    {
        $payment = Payment::where('provider_payment_id', $data['transaction_reference'])->first();

        if (!$payment) {
            Log::warning('Payment not found for PayNow webhook', [
                'transaction_reference' => $data['transaction_reference'],
            ]);
            return;
        }

        switch ($data['status']) {
            case 'completed':
                $payment->markAsCompleted(['paynow_webhook' => $data]);
                break;

            case 'failed':
                $payment->markAsFailed('PayNow payment failed', ['paynow_webhook' => $data]);
                break;

            case 'expired':
                $payment->markAsFailed('PayNow QR code expired', ['paynow_webhook' => $data]);
                break;

            default:
                Log::debug('Unhandled PayNow webhook status', [
                    'payment_id' => $payment->id,
                    'status' => $data['status'],
                ]);
                break;
        }

        Log::info('PayNow webhook processed', [
            'payment_id' => $payment->id,
            'status' => $data['status'],
            'order_id' => $payment->order_id,
        ]);
    }
}