#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ROOT="/home/project/authentic-kopitiam"
SERVICES_DIR="${PROJECT_ROOT}/backend/app/Services"
SERVICE_FILE="${SERVICES_DIR}/StripeService.php"
BACKUP_DIR="${PROJECT_ROOT}/backend/app/Services/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/StripeService_${TIMESTAMP}.php"

# Pre-flight checks
echo "🔍 Starting StripeService creation..."

# Create services directory if it doesn't exist
mkdir -p "${SERVICES_DIR}"
mkdir -p "${BACKUP_DIR}"

# Create backup if file already exists
if [ -f "${SERVICE_FILE}" ]; then
    echo "✅ Creating backup: ${BACKUP_FILE}"
    cp "${SERVICE_FILE}" "${BACKUP_FILE}"
else
    echo "ℹ️  StripeService file doesn't exist, creating new file"
fi

# Create the service file with proper content
cat > "${SERVICE_FILE}" << 'EOF'
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
        
        // Set Stripe API version for consistency
        Stripe::setApiVersion('2024-04-10');
    }

    /**
     * Create a payment intent
     * @param int $amount Amount in cents
     * @param string $currency Currency code
     * @param array $metadata Additional metadata
     * @return array Payment intent data
     * @throws \Exception
     */
    public function createPaymentIntent(int $amount, string $currency = null, array $metadata = []): array
    {
        try {
            $currency = $currency ?: $this->currency;
            
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);
            
            Log::info('Stripe payment intent created', [
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => $currency
            ]);
            
            return [
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => $currency,
            ];
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe API error creating payment intent', [
                'error' => $e->getError()->message,
                'amount' => $amount,
                'currency' => $currency
            ]);
            
            throw new \Exception('Payment processing failed: ' . $e->getError()->message);
        } catch (\Exception $e) {
            Log::error('Unexpected error creating payment intent', [
                'error' => $e->getMessage(),
                'amount' => $amount,
                'currency' => $currency
            ]);
            
            throw new \Exception('Payment processing failed: ' . $e->getMessage());
        }
    }

    /**
     * Process a refund
     * @param string $paymentIntentId Payment intent ID to refund
     * @param int|null $amount Amount to refund in cents (null for full refund)
     * @param string $reason Reason for refund
     * @param array $metadata Additional metadata
     * @return array Refund data
     * @throws \Exception
     */
    public function processRefund(string $paymentIntentId, ?int $amount = null, string $reason = 'requested_by_customer', array $metadata = []): array
    {
        try {
            $refundParams = [
                'payment_intent' => $paymentIntentId,
                'reason' => $reason,
                'metadata' => $metadata,
            ];
            
            if ($amount !== null) {
                $refundParams['amount'] = $amount;
            }
            
            $refund = Refund::create($refundParams);
            
            Log::info('Stripe refund processed', [
                'refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $refund->amount,
                'reason' => $reason
            ]);
            
            return [
                'refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $refund->amount,
                'currency' => $refund->currency,
                'status' => $refund->status,
                'reason' => $reason,
            ];
            
        } catch (ApiErrorException $e) {
            Log::error('Stripe API error processing refund', [
                'error' => $e->getError()->message,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount
            ]);
            
            throw new \Exception('Refund processing failed: ' . $e->getError()->message);
        } catch (\Exception $e) {
            Log::error('Unexpected error processing refund', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount
            ]);
            
            throw new \Exception('Refund processing failed: ' . $e->getMessage());
        }
    }

    /**
     * Verify webhook signature
     * @param string $payload Raw webhook payload
     * @param string $signature Header signature
     * @param string|null $secret Webhook secret (defaults to config)
     * @return \Stripe\Event Verified event
     * @throws \Exception
     */
    public function verifyWebhookSignature(string $payload, string $signature, ?string $secret = null): \Stripe\Event
    {
        try {
            $secret = $secret ?: config('services.stripe.webhook_secret');
            
            return \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                $secret
            );
            
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid Stripe webhook signature', [
                'error' => $e->getMessage(),
                'signature' => $signature
            ]);
            
            throw new \Exception('Invalid webhook signature');
        } catch (\Exception $e) {
            Log::error('Error verifying webhook signature', [
                'error' => $e->getMessage(),
                'signature' => $signature
            ]);
            
            throw new \Exception('Webhook verification failed');
        }
    }

    /**
     * Get payment status
     * @param string $paymentIntentId Payment intent ID
     * @return array Payment status data
     * @throws \Exception
     */
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

    /**
     * Check if Stripe is configured properly
     * @return bool True if configured, false otherwise
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && $this->apiKey !== 'sk_test_...' && $this->apiKey !== 'sk_live_...';
    }

    /**
     * Get Stripe configuration details (for debugging)
     * @return array Configuration details
     */
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
EOF

echo "✅ StripeService created at ${SERVICE_FILE}"

# Verify file was created successfully
if [ ! -f "${SERVICE_FILE}" ]; then
    echo "❌ ERROR: File was not created successfully"
    if [ -f "${BACKUP_FILE}" ]; then
        echo "🔄 Restoring from backup..."
        cp "${BACKUP_FILE}" "${SERVICE_FILE}"
    fi
    exit 1
fi

# Run PHP syntax check
echo "🔍 Running PHP syntax check..."
if ! docker compose exec -T backend php -l "/var/www/html/app/Services/StripeService.php"; then
    echo "❌ PHP syntax check failed - restoring backup"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${SERVICE_FILE}"
        echo "✅ Restored from backup: ${BACKUP_FILE}"
    fi
    exit 1
fi
echo "✅ PHP syntax check passed"

# Additional validation: Check for critical elements
echo "🔍 Performing additional validation..."

# Check for namespace and class definition
if ! grep -q "namespace App\\\\Services;" "${SERVICE_FILE}"; then
    echo "❌ ERROR: Namespace not found"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${SERVICE_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

# Check for payment intent method
if ! grep -q "createPaymentIntent" "${SERVICE_FILE}"; then
    echo "❌ ERROR: createPaymentIntent method not found"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${SERVICE_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

# Check for refund method
if ! grep -q "processRefund" "${SERVICE_FILE}"; then
    echo "❌ ERROR: processRefund method not found"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${SERVICE_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

# Check for Stripe imports
if ! grep -q "use Stripe\\\\" "${SERVICE_FILE}"; then
    echo "❌ ERROR: Stripe imports missing"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${SERVICE_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

echo "✅✅ StripeService created successfully ✅✅"
echo "💡 Service features implemented:"
echo "   - Payment intent creation with error handling"
echo "   - Refund processing (partial and full)"
echo "   - Webhook signature verification"
echo "   - Payment status checking"
echo "   - Configuration validation and debugging"
echo "   - Comprehensive logging and error handling"
echo "Backup preserved at: ${BACKUP_FILE}"
echo ""
echo "💡 Next steps:"
echo "   1. Add Stripe configuration to your .env file:"
echo "      STRIPE_KEY=your_publishable_key"
echo "      STRIPE_SECRET=your_secret_key"
echo "      STRIPE_WEBHOOK_SECRET=your_webhook_secret"
echo ""
echo "   2. Add service configuration to config/services.php:"
echo "      'stripe' => ["
echo "          'secret' => env('STRIPE_SECRET'),"
echo "          'key' => env('STRIPE_KEY'),"
echo "          'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),"
echo "          'currency' => 'sgd',"
echo "          'mode' => env('STRIPE_MODE', 'test'),"
echo "      ],"
echo ""
echo "   3. Test the service in tinker:"
echo "      docker compose exec backend php artisan tinker"
echo "      >>> app(App\\Services\\StripeService::class)->getConfig()"
echo ""
echo "   4. Create webhook endpoint controller:"
echo "      docker compose exec backend php artisan make:controller Api/StripeWebhookController"
