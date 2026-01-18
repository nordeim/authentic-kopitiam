#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ROOT="/home/project/authentic-kopitiam"
ROUTES_FILE="${PROJECT_ROOT}/backend/routes/api.php"
BACKUP_DIR="${PROJECT_ROOT}/backend/routes/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/api_routes_${TIMESTAMP}.php"
TEMP_DIR="/tmp/route_update_$$"

# Pre-flight checks
echo "🔍 Starting payment routes update..."

# Create directories if they don't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "${TEMP_DIR}"

# Create backup before making changes
if [ -f "${ROUTES_FILE}" ]; then
    echo "✅ Creating backup: ${BACKUP_FILE}"
    cp "${ROUTES_FILE}" "${BACKUP_FILE}"
else
    echo "❌ ERROR: Routes file not found at ${ROUTES_FILE}"
    exit 1
fi

# Verify required imports exist
echo "🔍 Verifying required controller imports..."
if ! grep -q "use App\\\\Http\\\\Controllers\\\\Api\\\\PaymentController;" "${ROUTES_FILE}"; then
    echo "❌ ERROR: PaymentController import not found"
    echo "💡 Add this line at the top of the file:"
    echo "use App\Http\Controllers\Api\PaymentController;"
    cp "${BACKUP_FILE}" "${ROUTES_FILE}"
    exit 1
fi

if ! grep -q "use App\\\\Http\\\\Controllers\\\\Api\\\\WebhookController;" "${ROUTES_FILE}"; then
    echo "❌ ERROR: WebhookController import not found"
    echo "💡 Add this line at the top of the file:"
    echo "use App\Http\Controllers\Api\WebhookController;"
    cp "${BACKUP_FILE}" "${ROUTES_FILE}"
    exit 1
fi
echo "✅ Required controller imports verified"

# Find the insertion point - look for the closing brace of the v1 prefix group
INSERTION_LINE=$(grep -n "})->middleware(\['throttle:api', 'cors'\]);" "${ROUTES_FILE}" | cut -d: -f1)

if [ -z "${INSERTION_LINE}" ]; then
    # Fallback: look for any closing brace with middleware
    INSERTION_LINE=$(grep -n "})->middleware(" "${ROUTES_FILE}" | tail -1 | cut -d: -f1)
fi

if [ -z "${INSERTION_LINE}" ]; then
    echo "❌ ERROR: Could not find v1 group closing brace in ${ROUTES_FILE}"
    echo "💡 Manual intervention required - restoring backup"
    cp "${BACKUP_FILE}" "${ROUTES_FILE}"
    exit 1
fi

echo "✅ Found v1 group closing brace at line ${INSERTION_LINE}"

# Create the routes content in a temporary file
ROUTES_TEMP_FILE="${TEMP_DIR}/payment_routes.txt"
cat > "${ROUTES_TEMP_FILE}" << 'EOF'

  // Payments Resource
  Route::post('payments/{order}/paynow', [PaymentController::class, 'createPayNowPayment']);
  Route::post('payments/{order}/stripe', [PaymentController::class, 'createStripePayment']);
  Route::get('payments/{payment}', [PaymentController::class, 'show']);
  Route::post('payments/{payment}/refund', [PaymentController::class, 'refund']);

  // Webhooks
  Route::post('webhooks/stripe', [WebhookController::class, 'stripe']);
  Route::post('webhooks/paynow', [WebhookController::class, 'paynow']);
EOF

# Create a temporary file for the updated content
TEMP_FILE="${TEMP_DIR}/updated_routes.php"

# Copy all lines BEFORE the insertion point (not including the closing brace line)
head -n $((INSERTION_LINE - 1)) "${ROUTES_FILE}" > "${TEMP_FILE}"

# Insert the new routes (indented by 2 spaces)
while IFS= read -r line; do
    if [ -n "$line" ]; then
        echo "  $line" >> "${TEMP_FILE}"
    else
        echo "" >> "${TEMP_FILE}"
    fi
done < "${ROUTES_TEMP_FILE}"

# Copy the closing brace line and all remaining lines
tail -n +"${INSERTION_LINE}" "${ROUTES_FILE}" >> "${TEMP_FILE}"

# Replace the original file with the updated content
mv "${TEMP_FILE}" "${ROUTES_FILE}"

echo "✅ Payment routes added to ${ROUTES_FILE}"

# Clean up temporary directory
rm -rf "${TEMP_DIR}"

# Run PHP syntax check
echo "🔍 Running PHP syntax check..."
if ! docker compose exec -T backend php -l "/var/www/html/routes/api.php"; then
    echo "❌ PHP syntax check failed - restoring backup"
    cp "${BACKUP_FILE}" "${ROUTES_FILE}"
    echo "✅ Restored from backup: ${BACKUP_FILE}"
    exit 1
fi
echo "✅ PHP syntax check passed"

# Additional validation: Check if routes were added
if ! grep -q "payments/{order}/paynow" "${ROUTES_FILE}"; then
    echo "❌ ERROR: PayNow payment route not added successfully"
    cp "${BACKUP_FILE}" "${ROUTES_FILE}"
    echo "✅ Restored from backup"
    exit 1
fi

if ! grep -q "webhooks/stripe" "${ROUTES_FILE}"; then
    echo "❌ ERROR: Stripe webhook route not added successfully"
    cp "${BACKUP_FILE}" "${ROUTES_FILE}"
    echo "✅ Restored from backup"
    exit 1
fi

echo "✅✅ Payment routes added successfully ✅✅"
echo "💡 Routes added:"
echo "   - POST /api/v1/payments/{order}/paynow"
echo "   - POST /api/v1/payments/{order}/stripe" 
echo "   - GET /api/v1/payments/{payment}"
echo "   - POST /api/v1/payments/{payment}/refund"
echo "   - POST /api/v1/webhooks/stripe"
echo "   - POST /api/v1/webhooks/paynow"
echo "Backup preserved at: ${BACKUP_FILE}"
echo ""
echo "💡 Next steps:"
echo "   1. Verify routes are registered:"
echo "      docker compose exec backend php artisan route:list --path=api/v1/payments"
echo ""
echo "   2. Test payment creation:"
echo "      docker compose exec backend php artisan test --filter=PaymentControllerTest"
echo ""
echo "   3. Configure payment providers in .env file:"
echo "      STRIPE_KEY=your_stripe_key"
echo "      STRIPE_SECRET=your_stripe_secret"
echo "      PAYNOW_API_KEY=your_paynow_key"
echo "      PAYNOW_API_SECRET=your_paynow_secret"
echo ""
echo "   4. Create payment configuration file if needed:"
echo "      config/payment.php"
