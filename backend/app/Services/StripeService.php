<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Exception\ApiErrorException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class StripeService
{
    protected string $apiKey;
    protected string $currency;
    protected string $mode;

    public function __construct()
    {
        $this->apiKey = config('services.stripe.secret');
        $this->currency = config('services.stripe.currency', 'sgd');
        $this->mode = config('services.stripe.mode', 'test');
        
        Stripe::setApiKey($this->apiKey);
        Stripe::setApiVersion('2024-04-10');
    }

    private function convertToCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    public function createPaymentIntent(float $amount, ?string $currency = null, array $metadata = []): array
    {
        try {
            $currency = $currency ?: $this->currency;
            $amountInCents = $this->convertToCents($amount);
            
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => ['enabled' => true],
            ]);
            
            Log::info('Stripe payment intent created', [
                'payment_intent_id' => $paymentIntent->id,
                'amount_decimal' => $amount,
                'amount_cents' => $amountInCents,
                'currency' => $currency
            ]);
            
            return [
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amountInCents,
                'amount_decimal' => $amount,
                'currency' => $currency,
            ];
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe API error creating payment intent', [
                'error' => $e->getError()->message,
                'amount_decimal' => $amount,
                'currency' => $currency
            ]);
            throw new \Exception('Payment processing failed: ' . $e->getError()->message);
        } catch (\Exception $e) {
            Log::error('Unexpected error creating payment intent', [
                'error' => $e->getMessage(),
                'amount_decimal' => $amount,
                'currency' => $currency
            ]);
            throw new \Exception('Payment processing failed: ' . $e->getMessage());
        }
    }

    public function processRefund(string $paymentIntentId, ?float $amount = null, string $reason = 'requested_by_customer', array $metadata = []): array
    {
        try {
            $refundParams = [
                'payment_intent' => $paymentIntentId,
                'reason' => $reason,
                'metadata' => $metadata,
            ];
            
            if ($amount !== null) {
                $refundParams['amount'] = $this->convertToCents($amount);
            }
            
            $refund = Refund::create($refundParams);
            
            Log::info('Stripe refund processed', [
                'refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount_decimal' => $amount,
                'amount_cents' => $refund->amount,
                'reason' => $reason
            ]);
            
            return [
                'refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $refund->amount,
                'amount_decimal' => $amount,
                'currency' => $refund->currency,
                'status' => $refund->status,
                'reason' => $reason,
            ];
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe API error processing refund', [
                'error' => $e->getError()->message,
                'payment_intent_id' => $paymentIntentId,
                'amount_decimal' => $amount
            ]);
            throw new \Exception('Refund processing failed: ' . $e->getError()->message);
        } catch (\Exception $e) {
            Log::error('Unexpected error processing refund', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
                'amount_decimal' => $amount
            ]);
            throw new \Exception('Refund processing failed: ' . $e->getMessage());
        }
    }

    public function verifyWebhookSignature(string $payload, string $signature, ?string $secret = null): \Stripe\Event
    {
        try {
            $secret = $secret ?: config('services.stripe.webhook_secret');
            return \Stripe\Webhook::constructEvent($payload, $signature, $secret);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid Stripe webhook signature', ['error' => $e->getMessage(), 'signature' => $signature]);
            throw new \Exception('Invalid webhook signature');
        } catch (\Exception $e) {
            Log::error('Error verifying webhook signature', ['error' => $e->getMessage(), 'signature' => $signature]);
            throw new \Exception('Webhook verification failed');
        }
    }

    public function getPaymentStatus(string $paymentIntentId): array
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            return [
                'id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'amount' => $paymentIntent->amount,
                'currency' => $paymentIntent->currency,
                'created' => $paymentIntent->created,
                'updated' => $paymentIntent->updated,
            ];
        } catch (ApiErrorException $e) {
            Log::error('Stripe API error getting payment status', [
                'error' => $e->getError()->message,
                'payment_intent_id' => $paymentIntentId
            ]);
            throw new \Exception('Failed to get payment status: ' . $e->getError()->message);
        } catch (\Exception $e) {
            Log::error('Unexpected error getting payment status', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId
            ]);
            throw new \Exception('Failed to get payment status: ' . $e->getMessage());
        }
    }

    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && $this->apiKey !== 'sk_test_...' && $this->apiKey !== 'sk_live_...';
    }

    public function getConfig(): array
    {
        return [
            'mode' => $this->mode,
            'currency' => $this->currency,
            'configured' => $this->isConfigured(),
            'api_version' => Stripe::getApiVersion(),
        ];
    }
}