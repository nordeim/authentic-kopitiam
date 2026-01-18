<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Handle Stripe webhook events
     * POST /api/webhooks/stripe
     */
    public function stripe(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        if (!$signature) {
            Log::warning('Stripe webhook received without signature');
            return response()->json(['error' => 'Missing signature'], 400);
        }

        try {
            $this->paymentService->processWebhook(
                json_decode($payload, true),
                $signature,
                'stripe'
            );

            Log::info('Stripe webhook processed successfully');
            return response()->json(['status' => 'received'], 200);

        } catch (\Exception $e) {
            Log::error('Stripe webhook processing failed', [
                'error' => $e->getMessage(),
                'signature' => $signature,
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle PayNow webhook events
     * POST /api/webhooks/paynow
     */
    public function paynow(Request $request)
    {
        $payload = $request->all();
        $signature = $request->header('X-PayNow-Signature');

        if (!$signature) {
            Log::warning('PayNow webhook received without signature');
            return response()->json(['error' => 'Missing signature'], 400);
        }

        try {
            $this->paymentService->processWebhook(
                $payload,
                $signature,
                'paynow'
            );

            Log::info('PayNow webhook processed successfully', [
                'transaction_reference' => $payload['transaction_reference'] ?? 'unknown',
            ]);

            return response()->json(['status' => 'received'], 200);

        } catch (\Exception $e) {
            Log::error('PayNow webhook processing failed', [
                'error' => $e->getMessage(),
                'transaction_reference' => $payload['transaction_reference'] ?? 'unknown',
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }
}