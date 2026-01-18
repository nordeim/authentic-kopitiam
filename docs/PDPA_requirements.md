### 📋 PDPA Consent Architecture Recommendation for Phase 4.7

Based on Singapore PDPA requirements and industry best practices, here are the recommended strategies:

## 1. **Concurrent Consent Types: YES, Support Multiple Types**

✅ **Recommendation: Support concurrent consent types** (marketing + analytics + third party) in single order requests

**Compliance Rationale:**
- PDPA requires **express consent** that is clear and explicit for each purpose 
- Organizations must provide **granular consent options** allowing individuals to choose which purposes they consent to 
- Modern privacy frameworks emphasize **user autonomy** - customers should control which data uses they permit 

**Implementation Pattern:**
```php
// Single request can contain multiple consent types
'consent' => [
    [
        'type' => 'marketing',
        'wording' => 'I consent to receive marketing communications',
        'version' => '1.0'
    ],
    [
        'type' => 'analytics', 
        'wording' => 'I consent to data analytics for service improvement',
        'version' => '1.0'
    ]
]
```

## 2. **Consent Renewal: UPDATE Existing Records (No Duplicates)**

✅ **Recommendation: Renew/Update existing consents** - prevent duplicate records for same consent type

**Compliance Rationale:**
- PDPA requires **proper management of consent records** to maintain accurate and current consent status 
- Organizations must demonstrate **accountability** by maintaining clear consent history 
- Duplicate consents create compliance risk and potential **regulatory penalties** under PDPA enforcement framework

**Implementation Pattern:**
```php
// Check for existing consent before creating new one
$existingConsent = PdpaConsent::where('customer_id', $customerId)
    ->where('consent_type', $consentType)
    ->where('consent_status', 'granted')
    ->latest()
    ->first();

if ($existingConsent && $this->pdpaService->verifyWording($existingConsent->consent_wording_hash, $newWording)) {
    // Update timestamp rather than create duplicate
    $existingConsent->update(['consented_at' => now()]);
} else {
    // Create new consent record
    $this->pdpaService->recordConsent(...);
}
```

## 🏗️ **Recommended Architecture Implementation**

### **Data Model Structure**
```php
// Single table with composite unique constraint
Schema::create('pdpa_consents', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('customer_id')->nullable(); // null for anonymous
    $table->string('pseudonymized_id'); // SHA256 hash
    $table->string('consent_type'); // marketing, analytics, third_party
    $table->string('consent_status'); // granted, withdrawn
    $table->timestamp('consented_at');
    $table->timestamp('withdrawn_at')->nullable();
    $table->timestamp('expires_at'); // Auto-expiry per PDPC guidelines
    $table->string('consent_wording_hash'); // For version tracking
    $table->string('consent_version');
    
    // Composite unique constraint prevents duplicates
    $table->unique(['customer_id', 'consent_type', 'consent_status'], 'unique_active_consent');
});
```

### **API Endpoint Design**
```
POST /api/v1/orders
{
  "customer_email": "customer@example.com",
  "items": [...],
  "consent": [
    {
      "type": "marketing",
      "wording": "I consent to marketing communications about kopitiam offers",
      "version": "2026-01-v1"
    },
    {
      "type": "analytics", 
      "wording": "I consent to analytics for improving service quality",
      "version": "2026-01-v1"
    }
  ]
}
```

## 🚨 **Critical Compliance Requirements**

### **Must-Have Features:**
1. **Granular Consent Options**: Separate checkboxes for each consent type in UI 
2. **Version Tracking**: Store consent wording hash to detect changes 
3. **Auto-Expiry**: Implement consent TTL (30 days recommended per PDPC guidance) 
4. **Easy Withdrawal**: Single endpoint to withdraw specific consent types 
5. **Audit Trail**: Full history of consent changes with timestamps 

### **Testing Requirements:**
```php
// Test scenarios to implement
public function test_multiple_consent_types_recorded()
public function test_consent_renewal_updates_existing_record()
public function test_consent_withdrawal_invalidates_record()
public function test_consent_expiry_removes_active_status()
public function test_consent_wording_version_tracking()
```

## 📅 **Implementation Timeline**

| Phase | Task | Effort | Compliance Criticality |
|-------|------|--------|------------------------|
| 4.7.1 | Update PdpaConsent model with composite unique constraint | 1 hour | 🔴 Critical |
| 4.7.2 | Modify OrderController to handle multiple consent array | 2 hours | 🔴 Critical |
| 4.7.3 | Implement consent renewal logic in PdpaService | 3 hours | 🔴 Critical |
| 4.7.4 | Add consent withdrawal API endpoint | 2 hours | 🟡 High |
| 4.7.5 | Create consent export/import functionality | 4 hours | 🟡 High |

## ✅ **Confirmation Required**

Based on Singapore PDPA requirements and industry best practices:

1. **✅ CONFIRM**: Support concurrent consent types (marketing + analytics + third_party) in single order requests
2. **✅ CONFIRM**: Update existing consents rather than creating duplicates (with version tracking)

**Next Step**: Proceed with implementation using the composite unique constraint approach to prevent duplicate active consents while allowing multiple consent types per customer.

This architecture meets PDPC guidelines for consent management while providing the flexibility needed for your kopitiam business model. The approach prioritizes compliance while maintaining practical usability for your development team.

> 💡 **Pro Tip**: Implement a consent dashboard in your admin panel showing active consents by type and expiry dates - this will be invaluable during PDPC audits and demonstrates proactive compliance management.
