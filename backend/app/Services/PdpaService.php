<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Models\PdpaConsent;

class PdpaService
{
    /**
     * Pseudonymize customer data (SHA256 with salt)
     * @param string $data Data to pseudonymize
     * @param string|null $salt Custom salt (default: app salt)
     * @return string SHA256 hash
     */
    public function pseudonymize(string $data, ?string $salt = null): string
    {
        $salt = $salt ?? config('pdpa.salt', config('app.key'));
        $hashData = $data . $salt;
        return hash('sha256', $hashData);
    }

    /**
     * Record consent
     * @param string|null $customerId Customer UUID (null = anonymous)
     * @param string $consentType Consent type
     * @param string $wording Consent text
     * @param string $version Consent version
     * @param Request $request HTTP request for IP/user agent
     */
    public function recordConsent(
        ?string $customerId,
        string $consentType,
        string $wording,
        string $version,
        Request $request
    ): PdpaConsent {
        $pseudonymizedId = $this->pseudonymize($customerId ?? $request->ip());
        $consentWordingHash = $this->hashConsentWording($wording);
        $expiresAt = $this->calculateExpirationDate();

        $consent = PdpaConsent::create([
            'customer_id' => $customerId,
            'pseudonymized_id' => $pseudonymizedId,
            'consent_type' => $consentType,
            'consent_status' => 'granted',
            'consented_at' => now(),
            'withdrawn_at' => null,
            'expires_at' => $expiresAt,
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
            'consent_wording_hash' => $consentWordingHash,
            'consent_version' => $version,
        ]);

        return $consent;
    }

    /**
     * Check if consent granted and active
     * @param string|null $customerId Customer UUID (null = anonymous)
     * @param string $consentType Consent type
     * @return bool Consent status
     */
    public function hasConsent(?string $customerId, string $consentType): bool
    {
        if (!$customerId) {
            return false;
        }

        $consent = PdpaConsent::where('customer_id', $customerId)
            ->where('consent_type', $consentType)
            ->granted()
            ->latest('consented_at')
            ->first();

        return !is_null($consent);
    }

    /**
     * Withdraw consent
     * @param string $consentId Consent UUID
     */
    public function withdrawConsent(string $consentId): void
    {
        $consent = PdpaConsent::findOrFail($consentId);

        $consent->update([
            'consent_status' => 'withdrawn',
            'withdrawn_at' => now(),
        ]);
    }

    /**
     * Verify consent wording
     * @param string $wording Consent text
     * @param string $hash Stored hash
     * @return bool Match status
     */
    public function verifyWording(string $wording, string $hash): bool
    {
        $wordingHash = $this->hashConsentWording($wording);
        return hash_equals($hash, $wordingHash);
    }

    /**
     * Export customer data (GDPR/PDPA right to access)
     * @param string $customerId Customer UUID
     * @return array Customer data
     */
    public function exportData(string $customerId): array
    {
        $user = \App\Models\User::findOrFail($customerId);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toIso8601String(),
            ],
            'consents' => PdpaConsent::where('customer_id', $customerId)
                ->get()
                ->map(function ($consent) {
                    return [
                        'id' => $consent->id,
                        'consent_type' => $consent->consent_type,
                        'consent_status' => $consent->consent_status,
                        'consented_at' => $consent->consented_at->toIso8601String(),
                        'withdrawn_at' => $consent->withdrawn_at?->toIso8601String(),
                        'expires_at' => $consent->expires_at?->toIso8601String(),
                        'consent_version' => $consent->consent_version,
                    ];
                })
                ->toArray(),
            'orders' => \App\Models\Order::where('user_id', $customerId)
                ->with('items', 'payment', 'location')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'invoice_number' => $order->invoice_number,
                        'status' => $order->status,
                        'subtotal_cents' => $order->subtotal_cents,
                        'gst_cents' => $order->gst_cents,
                        'total_cents' => $order->total_cents,
                        'created_at' => $order->created_at->toIso8601String(),
                    ];
                })
                ->toArray(),
        ];
    }

    /**
     * Delete customer data (GDPR/PDPA right to erasure)
     * @param string $customerId Customer UUID
     */
    public function deleteData(string $customerId): void
    {
        $user = \App\Models\User::findOrFail($customerId);

        // Pseudonymize consents
        PdpaConsent::where('customer_id', $customerId)
            ->update([
                'pseudonymized_id' => $this->pseudonymize('DELETED_' . $customerId),
                'customer_id' => null,
            ]);

        // Soft delete user
        $user->delete();

        // Soft delete orders
        \App\Models\Order::where('user_id', $customerId)
            ->get()
            ->each(function ($order) {
                $order->delete();
            });
    }

    /**
     * Hash consent wording
     * @param string $wording Consent text
     * @return string SHA256 hash
     */
    protected function hashConsentWording(string $wording): string
    {
        return hash('sha256', $wording);
    }

    /**
     * Calculate expiration date for consent
     * @return \Carbon\Carbon Expiration date
     */
    protected function calculateExpirationDate(): \Carbon\Carbon
    {
        $days = config('pdpa.consent_ttl_days', 30);
        return now()->addDays($days);
    }
}
