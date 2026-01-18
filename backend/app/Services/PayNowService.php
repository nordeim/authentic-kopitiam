<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PayNowService
{
    protected string $apiKey;
    protected string $uen;
    protected string $apiUrl;
    protected string $mode;

    public function __construct()
    {
        $this->apiKey = config('services.paynow.api_key');
        $this->uen = config('services.paynow.uen');
        $this->apiUrl = config('services.paynow.api_url');
        $this->mode = config('services.paynow.mode', 'test');
    }

    /**
     * Generate PayNow QR code for payment
     * @param float $amount Amount in SGD dollars
     * @param string $referenceNumber Unique reference number
     * @param string|null $expiry Expiry time in ISO8601 format
     * @param string|null $description Payment description
     * @return array QR code data and transaction reference
     * @throws \Exception
     */
    public function generateQR(float $amount, string $referenceNumber, ?string $expiry = null, ?string $description = null): array
    {
        try {
            if (!$this->validateUEN($this->uen)) {
                throw new \Exception('Invalid UEN format');
            }

            $payload = [
                'uen' => $this->uen,
                'amount' => number_format($amount, 2, '.', ''),
                'reference_number' => $referenceNumber,
                'description' => $description ?? "Payment for order {$referenceNumber}",
                'expiry' => $expiry ?? now()->addHours(1)->toIso8601String(),
                'format' => 'qr',
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$this->apiUrl}/api/v1/qr/generate", $payload);

            if ($response->failed()) {
                Log::error('PayNow QR generation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'reference_number' => $referenceNumber,
                    'amount' => $amount,
                ]);
                throw new \Exception("PayNow API error: " . $response->body());
            }

            $data = $response->json();

            Log::info('PayNow QR generated successfully', [
                'transaction_reference' => $data['transaction_reference'],
                'reference_number' => $referenceNumber,
                'amount' => $amount,
            ]);

            return [
                'qr_code_url' => $data['qr_code_url'],
                'qr_code_data' => $data['qr_code_data'],
                'transaction_reference' => $data['transaction_reference'],
                'expires_at' => $data['expires_at'],
                'amount' => $amount,
                'reference_number' => $referenceNumber,
            ];

        } catch (\Exception $e) {
            Log::error('PayNow QR generation error', [
                'error' => $e->getMessage(),
                'reference_number' => $referenceNumber,
                'amount' => $amount,
            ]);
            throw $e;
        }
    }

    /**
     * Validate UEN format
     * @param string $uen UEN to validate
     * @return bool True if valid
     */
    public function validateUEN(string $uen): bool
    {
        if (empty($uen)) {
            return false;
        }

        $uen = strtoupper(trim($uen));

        if (strlen($uen) !== 10 && strlen($uen) !== 9) {
            return false;
        }

        $pattern10 = '/^[0-9]{8}[A-Z]{1}$/'; // 8 digits + 1 letter
        $pattern9 = '/^[0-9]{9}$/'; // 9 digits

        return preg_match($pattern10, $uen) || preg_match($pattern9, $uen);
    }

    /**
     * Process PayNow webhook notification
     * @param array $payload Webhook payload
     * @return array Parsed webhook data
     * @throws \Exception
     */
    public function parseWebhookPayload(array $payload): array
    {
        try {
            $requiredFields = ['transaction_reference', 'status', 'amount', 'reference_number'];
            foreach ($requiredFields as $field) {
                if (!isset($payload[$field])) {
                    throw new \Exception("Missing required field: {$field}");
                }
            }

            $status = $payload['status'];
            $validStatuses = ['pending', 'completed', 'failed', 'expired'];

            if (!in_array($status, $validStatuses)) {
                throw new \Exception("Invalid status: {$status}");
            }

            Log::info('PayNow webhook parsed successfully', [
                'transaction_reference' => $payload['transaction_reference'],
                'status' => $status,
                'amount' => $payload['amount'],
            ]);

            return [
                'transaction_reference' => $payload['transaction_reference'],
                'reference_number' => $payload['reference_number'],
                'status' => $status,
                'amount' => (float) $payload['amount'],
                'payment_timestamp' => $payload['payment_timestamp'] ?? null,
                'payer_details' => $payload['payer_details'] ?? null,
                'metadata' => $payload['metadata'] ?? [],
            ];

        } catch (\Exception $e) {
            Log::error('PayNow webhook parsing error', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);
            throw $e;
        }
    }

    /**
     * Check transaction status
     * @param string $transactionReference Transaction reference from QR generation
     * @return array Transaction status data
     * @throws \Exception
     */
    public function getTransactionStatus(string $transactionReference): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->get("{$this->apiUrl}/api/v1/transaction/{$transactionReference}");

            if ($response->failed()) {
                Log::error('PayNow transaction status check failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'transaction_reference' => $transactionReference,
                ]);
                throw new \Exception("PayNow API error: " . $response->body());
            }

            $data = $response->json();

            Log::debug('PayNow transaction status retrieved', [
                'transaction_reference' => $transactionReference,
                'status' => $data['status'],
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('PayNow transaction status error', [
                'error' => $e->getMessage(),
                'transaction_reference' => $transactionReference,
            ]);
            throw $e;
        }
    }

    /**
     * Verify webhook signature (HMAC-SHA256)
     * @param string $payload Raw webhook payload
     * @param string $signature Signature from header
     * @return bool True if signature is valid
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $secret = $this->apiKey;
        $computedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        return hash_equals($computedSignature, $signature);
    }

    /**
     * Check if PayNow is configured properly
     * @return bool True if configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) &&
               !empty($this->uen) &&
               !empty($this->apiUrl) &&
               $this->validateUEN($this->uen);
    }

    /**
     * Get PayNow configuration details (for debugging)
     * @return array Configuration details
     */
    public function getConfig(): array
    {
        return [
            'mode' => $this->mode,
            'uen' => $this->uen,
            'api_url' => $this->apiUrl,
            'configured' => $this->isConfigured(),
        ];
    }
}