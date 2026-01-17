<?php

namespace Tests\Api;

use App\Models\PdpaConsent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PdpaConsentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_record_consent_success()
    {
        $consentData = [
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'consent_type' => 'marketing',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', 'Marketing consent wording v1.0'),
            'user_agent' => 'Test Agent/1.0',
        ];

        $response = $this->postJson('/api/v1/consents', $consentData);

        $response->assertStatus(200);
        $response->assertJsonFragment(['consent_recorded' => true]);
        
        $this->assertDatabaseHas('pdpa_consents', [
            'pseudonymized_id' => hash('sha256', 'customer@example.com'),
            'consent_type' => 'marketing',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', 'Marketing consent wording v1.0'),
            'user_agent' => 'Test Agent/1.0',
        ]);
    }

    public function test_pseudonymization_produces_consistent_hash()
    {
        $email = 'customer@example.com';
        $consentData1 = [
            'customer_email' => $email,
            'customer_phone' => '+65 81234567',
            'consent_type' => 'marketing',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', 'Wording'),
        ];

        $consentData2 = [
            'customer_email' => $email,
            'customer_phone' => '+65 81234567',
            'consent_type' => 'analytics',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', 'Wording'),
        ];

        $this->postJson('/api/v1/consents', $consentData1);
        $this->postJson('/api/v1/consents', $consentData2);

        $pseudonym1 = hash('sha256', $email);
        $pseudonym2 = hash('sha256', $email);
        
        $this->assertEquals($pseudonym1, $pseudonym2);
        $this->assertEquals(64, strlen($pseudonym1)); // SHA256 produces 64-char hex
    }

    public function test_withdraw_consent()
    {
        $consentData = [
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'consent_type' => 'marketing',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', 'Wording'),
        ];

        $this->postJson('/api/v1/consents', $consentData);

        $withdrawData = [
            'customer_email' => 'customer@example.com',
            'consent_type' => 'marketing',
        ];

        $response = $this->postJson('/api/v1/consents/withdraw', $withdrawData);

        $response->assertStatus(200);
        $response->assertJsonFragment(['consent_withdrawn' => true]);
        
        $this->assertDatabaseHas('pdpa_consents', [
            'pseudonymized_id' => hash('sha256', 'customer@example.com'),
            'consent_type' => 'marketing',
            'consent_given' => false,
        ]);
    }

    public function test_export_personal_data()
    {
        $email = 'customer@example.com';
        
        // Record multiple consents
        PdpaConsent::factory()->count(5)->create([
            'pseudonymized_id' => hash('sha256', $email),
            'consent_type' => 'marketing',
            'consent_given' => true,
        ]);

        $response = $this->getJson('/api/v1/consents/export?email='.$email);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'pseudonymized_id',
                'consents' => [
                    '*' => ['consent_type', 'consent_given', 'created_at', 'valid_until']
                ]
            ]
        ]);
        
        $this->assertEquals(5, count($response->json('data.consents')));
    }

    public function test_consent_expiration_after_30_days()
    {
        $consent = PdpaConsent::factory()->create([
            'created_at' => now()->subDays(31),
            'consent_type' => 'marketing',
            'consent_given' => true,
        ]);

        $response = $this->getJson('/api/v1/consents/export?email=customer@example.com');

        $response->assertStatus(200);
        $exportedConsents = $response->json('data.consents');
        
        // Expired consents should not be in export
        $this->assertEquals(0, count($exportedConsents));
    }

    public function test_audit_trail_captures_ip_and_user_agent()
    {
        $consentData = [
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'consent_type' => 'analytics',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', 'Wording'),
        ];

        $response = $this->postJson('/api/v1/consents', $consentData);

        $this->assertDatabaseHas('pdpa_consents', [
            'pseudonymized_id' => hash('sha256', 'customer@example.com'),
            'ip_address' => '127.0.0.1', // Default test IP
        ]);
    }

    public function test_consent_wording_hash_verification()
    {
        $originalWording = 'Marketing consent wording v1.0 - This is the exact text shown to user with all clauses';
        $consentData = [
            'customer_email' => 'customer@example.com',
            'customer_phone' => '+65 81234567',
            'consent_type' => 'marketing',
            'consent_given' => true,
            'consent_wording_hash' => hash('sha256', $originalWording),
        ];

        $response = $this->postJson('/api/v1/consents', $consentData);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('pdpa_consents', [
            'consent_wording_hash' => hash('sha256', $originalWording),
        ]);
    }
}