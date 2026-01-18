# Payment Integration API Documentation
## Overview
The Morning Brew Collective payment system supports multiple payment methods:
- **PayNow QR** (Singapore local payments)
- **Stripe** (Credit/Debit cards)
## Base URL
```
https://api.morningbrew.sg/api/v1
```
## Authentication
Most payment endpoints require authentication via Sanctum tokens.
```bash
Authorization: Bearer {your_token}
```
Webhook endpoints are authenticated via signature verification.
## Payment Methods
### 1. PayNow QR Payment
#### Create PayNow Payment
**Endpoint**: `POST /api/v1/payments/{order}/paynow`
**Request Body**:
```json
{
  "amount": 25.50,
  "reference_number": "ORDER-9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k"
}
```
**Response (201 Created)**:
```json
{
  "payment": {
    "id": "f3e2d1c0-b9a8-7765-4433-2211ffeeddcc",
    "order_id": "9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
    "payment_method": "paynow",
    "status": "pending",
    "amount": 25.50,
    "currency": "SGD",
    "payment_provider": "paynow",
    "provider_payment_id": "TXN-9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
    "paynow_qr_data": {
      "qr_code_url": "https://api.paynow.com/qr/abc123",
      "qr_code_data": "000201010211...",
      "transaction_reference": "TXN-9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
      "expires_at": "2026-01-18T18:00:00Z"
    },
    "created_at": "2026-01-18T17:00:00Z",
    "updated_at": "2026-01-18T17:00:00Z"
  },
  "qr_code_url": "https://api.paynow.com/qr/abc123",
  "transaction_reference": "TXN-9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
  "expires_at": "2026-01-18T18:00:00Z"
}
```
**Error Responses**:
- `422 Unprocessable Entity` - Order not in pending status
- `422 Unprocessable Entity` - Amount does not match order total
- `500 Internal Server Error` - PayNow API error
---
### 2. Stripe Card Payment
#### Create Stripe Payment
**Endpoint**: `POST /api/v1/payments/{order}/stripe`
**Request Body**:
```json
{
  "payment_method_id": "pm_1GpvN2R7aL8Z9Q4",
  "amount": 45.99
}
```
**Response (201 Created)**:
```json
{
  "payment": {
    "id": "a1b2c3d4-e5f6-7788-9900-aabbccddeeff",
    "order_id": "9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
    "payment_method": "stripe_card",
    "status": "pending",
    "amount": 45.99,
    "currency": "SGD",
    "payment_provider": "stripe",
    "provider_payment_id": "pi_3J9kLmNpQ2R5S8T",
    "provider_payment_method_id": "pm_1GpvN2R7aL8Z9Q4",
    "provider_metadata": {
      "client_secret": "pi_3J9kLmNpQ2R5S8T_secret_abc123",
      "payment_intent_id": "pi_3J9kLmNpQ2R5S8T"
    },
    "created_at": "2026-01-18T17:00:00Z",
    "updated_at": "2026-01-18T17:00:00Z"
  },
  "client_secret": "pi_3J9kLmNpQ2R5S8T_secret_abc123",
  "payment_intent_id": "pi_3J9kLmNpQ2R5S8T"
}
```
**Error Responses**:
- `422 Unprocessable Entity` - Order not in pending status
- `422 Unprocessable Entity` - Amount does not match order total
- `500 Internal Server Error` - Stripe API error
---
### 3. Get Payment Details
**Endpoint**: `GET /api/v1/payments/{payment}`
**Path Parameter**:
- `payment` (UUID) - Payment ID
**Response (200 OK)**:
```json
{
  "payment": {
    "id": "a1b2c3d4-e5f6-7788-9900-aabbccddeeff",
    "order_id": "9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
    "payment_method": "stripe_card",
    "status": "completed",
    "amount": 45.99,
    "refunded_amount": 0,
    "currency": "SGD",
    "payment_provider": "stripe",
    "provider_payment_id": "pi_3J9kLmNpQ2R5S8T",
    "payment_completed_at": "2026-01-18T17:05:00Z",
    "provider_metadata": {
      "client_secret": "pi_3J9kLmNpQ2R5S8T_secret_abc123",
      "payment_intent_id": "pi_3J9kLmNpQ2R5S8T"
    },
    "created_at": "2026-01-18T17:00:00Z",
    "updated_at": "2026-01-18T17:05:00Z"
  }
}
```
**Payment Status Values**:
- `pending` - Payment initiated, awaiting completion
- `processing` - Payment being processed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Fully refunded
---
### 4. Process Refund
**Endpoint**: `POST /api/v1/payments/{payment}/refund`
**Request Body**:
```json
{
  "amount": 20.00,                    // Optional: null for full refund
  "reason": "requested_by_customer",  // required: requested_by_customer|fraudulent|duplicate
  "restore_inventory": true           // Optional: restore inventory for refunded items
}
```
**Valid Reason Values**:
- `requested_by_customer` - Customer requested refund
- `fraudulent` - Fraudulent transaction
- `duplicate` - Duplicate charge
**Response (200 OK)**:
```json
{
  "payment": {
    "id": "a1b2c3d4-e5f6-7788-9900-aabbccddeeff",
    "status": "completed",
    "amount": 45.99,
    "refunded_amount": 20.00,
    "refunded_at": "2026-01-18T18:00:00Z"
  },
  "refund": {
    "id": "b2c3d4e5-f6a7-b889-c0dd-eeffaabbccdd",
    "payment_id": "a1b2c3d4-e5f6-7788-9900-aabbccddeeff",
    "amount": 20.00,
    "currency": "SGD",
    "provider_refund_id": "re_3J9kLmNpQ2R5S8T",
    "reason": "requested_by_customer",
    "inventory_restored": true,
    "refunded_by": 1,
    "created_at": "2026-01-18T18:00:00Z"
  }
}
```
**Error Responses**:
- `422 Unprocessable Entity` - Only completed payments can be refunded
- `422 Unprocessable Entity` - Refund amount exceeds remaining refundable amount
- `400 Bad Request` - Invalid refund reason
---
## Webhooks
### Stripe Webhook
**Endpoint**: `POST /api/v1/webhooks/stripe`
**Headers**:
```
Stripe-Signature: t=1234567890,v1=signature_hash,v0=signature_hash
```
**Event Types**:
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.processing` - Payment processing
**Response**: Always return HTTP 200
```json
{
  "status": "received"
}
```
**Webhook Setup in Stripe**:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
3. Select events: `payment_intent.*`
4. Copy webhook secret to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```
---
### PayNow Webhook
**Endpoint**: `POST /api/v1/webhooks/paynow`
**Headers**:
```
X-PayNow-Signature: sha256=signature_hash
```
**Status Values**:
- `completed` - Payment successful
- `failed` - Payment failed
- `expired` - QR code expired
**Response**: Always return HTTP 200
```json
{
  "status": "received"
}
```
---
## Example: Complete PayNow Payment Flow
### Step 1: Create Order
```bash
curl -X POST https://api.morningbrew.sg/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "customer@example.com",
    "customer_name": "John Tan",
    "pickup_location_id": 1,
    "pickup_at": "2026-01-19T10:00:00",
    "items": [
      {
        "product_id": "a1b2c3d4-e5f6-7788-9900-aabbccddeeff",
        "quantity": 2,
        "unit_price": 12.75
      }
    ]
  }'
```
**Response**:
```json
{
  "order": {
    "id": "9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
    "total_amount": 25.50,
    "status": "pending"
  }
}
```
### Step 2: Generate PayNow QR
```bash
curl -X POST https://api.morningbrew.sg/api/v1/payments/9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k/paynow \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.50,
    "reference_number": "ORDER-9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k"
  }'
```
**Response**:
```json
{
  "qr_code_url": "https://api.paynow.com/qr/abc123",
  "transaction_reference": "TXN-9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k",
  "expires_at": "2026-01-18T18:00:00Z"
}
```
### Step 3: Display QR Code
Display the QR code URL to customer for scanning with their banking app.
### Step 4: Handle Webhook (Automatic)
System receives webhook from PayNow and updates order status:
- Payment status: `pending` → `completed`
- Order status: `pending` → `processing`
### Step 5: Check Payment Status
```bash
curl https://api.morningbrew.sg/api/v1/payments/f3e2d1c0-b9a8-7765-4433-2211ffeeddcc \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Response (Completed)**:
```json
{
  "payment": {
    "status": "completed",
    "payment_completed_at": "2026-01-18T17:05:00Z"
  }
}
```
---
## Example: Complete Stripe Payment Flow
### Step 1: Collect Payment Method (Frontend)
Use Stripe Elements to collect card details:
```javascript
const {token} = await stripe.createToken(cardElement);
const paymentMethodId = token.card.id; // e.g., "pm_1GpvN2R7aL8Z9Q4"
```
### Step 2: Create Payment
```bash
curl -X POST https://api.morningbrew.sg/api/v1/payments/9d8f7e6c-5b4a-3d2e-1f0g9h8i7j6k/stripe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method_id": "pm_1GpvN2R7aL8Z9Q4",
    "amount": 45.99
  }'
```
**Response**:
```json
{
  "client_secret": "pi_3J9kLmNpQ2R5S8T_secret_abc123",
  "payment_intent_id": "pi_3J9kLmNpQ2R5S8T"
}
```
### Step 3: Confirm Payment (Frontend)
```javascript
const {paymentIntent} = await stripe.confirmCardPayment(
  'pi_3J9kLmNpQ2R5S8T_secret_abc123'
);
```
### Step 4: Handle Webhook (Automatic)
System receives `payment_intent.succeeded` webhook and updates statuses.
### Step 5: Verify Payment
```bash
curl https://api.morningbrew.sg/api/v1/payments/a1b2c3d4-e5f6-7788-9900-aabbccddeeff \
  -H "Authorization: Bearer YOUR_TOKEN"
```
---
## Configuration
### Environment Variables
Add to `.env`:
```bash
# Stripe Configuration
STRIPE_KEY=pk_test_your_publishable_key
STRIPE_SECRET=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
# PayNow Configuration
PAYNOW_UEN=202312345R
PAYNOW_API_KEY=your_paynow_api_key
PAYNOW_API_SECRET=your_paynow_api_secret
PAYNOW_API_URL=https://api.paynow.com
# General Payment Settings
PAYMENT_CURRENCY=SGD
```
---
## Testing
### Run Payment Tests
```bash
# Run all payment tests
docker compose exec backend php artisan test --filter=Payment
# Run specific test
docker compose exec backend php artisan test --filter=test_create_paynow_payment_generates_qr_code
# Check test coverage
docker compose exec backend php artisan test --coverage
```
### Using Tinker
```bash
docker compose exec backend php artisan tinker
# Test PayNow QR generation
>>> $order = Order::find('your-order-id');
>>> $paymentService = app(App\Services\PaymentService::class);
>>> $payment = $paymentService->processPayNowPayment($order, 25.50, 'ORDER-123');
>>> $payment->paynow_qr_data['qr_code_url'];
# Test Stripe payment intent
>>> $payment = $paymentService->processStripeCardPayment($order, 45.99, 'pm_test');
>>> $payment->provider_metadata['client_secret'];
# Test refund
>>> $payment = Payment::find('payment-id');
>>> $refund = $paymentService->refundPayment($payment, 20.00, 'requested_by_customer', Auth::user(), true);
```
---
## Security Best Practices
1. **Never log sensitive data**: Card numbers, CVV, API keys
2. **Use signature verification**: Always verify webhook signatures
3. **Idempotency**: Use provider IDs to prevent duplicates
4. **HTTPS only**: All webhook endpoints must use HTTPS
5. **IP whitelisting**: Restrict webhook endpoints to provider IPs
6. **PCI compliance**: Never store card data; use tokens only
7. **Amount validation**: Always validate payment amount matches order
8. **Status locking**: Prevent race conditions with optimistic locking
---
## Troubleshooting
### Stripe Webhook Not Working
1. Check webhook secret in `.env` matches Stripe dashboard
2. Verify endpoint is accessible: `curl -X POST https://your-domain.com/api/v1/webhooks/stripe`
3. Check logs: `docker compose exec backend tail -f storage/logs/laravel.log`
4. Test signature verification: `artisan tinker` → `$service->verifyWebhookSignature($payload, $sig)`
### PayNow QR Not Generating
1. Verify UEN format: 9 digits or 8 digits + 1 letter
2. Check API credentials in `.env`
3. Test UEN validation: `$paynowService->validateUEN('202312345R')`
4. Check PayNow API URL is accessible
### Payment Status Not Updating
1. Verify webhook endpoint is receiving requests
2. Check provider_payment_id matches between payment and webhook
3. Review error logs for webhook processing failures
4. Manually sync status: `$paymentService->syncPaymentStatus($payment)`
---
## Support
- **Stripe API Docs**: https://stripe.com/docs/api
- **PayNow API Docs**: https://api.paynow.com/docs
- **Morning Brew Collective Issues**: https://github.com/your-repo/issues
**Last Updated**: January 18, 2026
