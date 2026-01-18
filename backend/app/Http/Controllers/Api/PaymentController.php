<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StripeService;
use App\Services\PayNowService;
use App\Services\PaymentService;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    protected StripeService $stripeService;
    protected PayNowService $paynowService;
    protected PaymentService $paymentService;

    public function __construct(
        StripeService $stripeService,
        PayNowService $paynowService,
        PaymentService $paymentService
    ) {
        $this->stripeService = $stripeService;
        $this->paynowService = $paynowService;
        $this->paymentService = $paymentService;
    }

    /**
     * Process PayNow payment for an order
     * POST /api/payments/{order}/paynow
     */
    public function createPayNowPayment(Order $order, Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:0.01',
                'reference_number' => 'required|string|max:50',
            ]);

            if ($order->status !== 'pending') {
                return response()->json([
                    'error' => 'Order cannot be paid. Current status: ' . $order->status
                ], 422);
            }

            $amount = (float) $request->amount;
            $referenceNumber = $request->reference_number;

            $payment = $this->paymentService->processPayNowPayment($order, $amount, $referenceNumber);

            Log::info('PayNow payment created', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'amount' => $amount,
            ]);

            return response()->json([
                'payment' => $payment,
                'qr_code_url' => $payment->paynow_qr_data['qr_code_url'],
                'transaction_reference' => $payment->paynow_qr_data['transaction_reference'],
                'expires_at' => $payment->paynow_qr_data['expires_at'],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('PayNow payment creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Process Stripe payment for an order
     * POST /api/payments/{order}/stripe
     */
    public function createStripePayment(Order $order, Request $request)
    {
        try {
            $request->validate([
                'payment_method_id' => 'required|string',
                'amount' => 'required|numeric|min:0.01',
            ]);

            if ($order->status !== 'pending') {
                return response()->json([
                    'error' => 'Order cannot be paid. Current status: ' . $order->status
                ], 422);
            }

            $amount = (float) $request->amount;
            $paymentMethodId = $request->payment_method_id;

            $payment = $this->paymentService->processStripeCardPayment($order, $amount, $paymentMethodId);

            Log::info('Stripe payment created', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'stripe_payment_intent_id' => $payment->provider_payment_id,
                'amount' => $amount,
            ]);

            return response()->json([
                'payment' => $payment,
                'client_secret' => $payment->provider_metadata['client_secret'],
                'payment_intent_id' => $payment->provider_payment_id,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Stripe payment creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get payment details
     * GET /api/payments/{payment}
     */
    public function show(Payment $payment)
    {
        return response()->json(['payment' => $payment], 200);
    }

    /**
     * Refund a payment
     * POST /api/payments/{payment}/refund
     */
    public function refund(Payment $payment, Request $request)
    {
        try {
            $request->validate([
                'amount' => 'nullable|numeric|min:0.01',
                'reason' => 'required|string|in:requested_by_customer,fraudulent,duplicate',
                'restore_inventory' => 'boolean',
            ]);

            if ($payment->status !== 'completed') {
                return response()->json([
                    'error' => 'Only completed payments can be refunded'
                ], 422);
            }

            $amount = $request->amount ?? $payment->amount;
            if ($amount > ($payment->amount - $payment->refunded_amount)) {
                return response()->json([
                    'error' => 'Refund amount exceeds remaining refundable amount'
                ], 422);
            }

            $reason = $request->reason;
            $restoreInventory = $request->restore_inventory ?? false;

            $refund = $this->paymentService->refundPayment($payment, $amount, $reason, Auth::user(), $restoreInventory);

            Log::info('Payment refunded', [
                'payment_id' => $payment->id,
                'refund_id' => $refund->id,
                'amount' => $amount,
                'refunded_by' => Auth::id(),
            ]);

            return response()->json([
                'payment' => $payment,
                'refund' => $refund,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Payment refund failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}