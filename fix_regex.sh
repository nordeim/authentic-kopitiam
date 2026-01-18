#!/bin/bash
set -euo pipefail

# Configuration
TEST_FILE="/home/project/authentic-kopitiam/backend/tests/Api/OrderControllerTest.php"
BACKUP_DIR="/home/project/authentic-kopitiam/backend/tests/Api/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/OrderControllerTest_${TIMESTAMP}.php"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create backup before making changes
echo "✅ Creating backup: ${BACKUP_FILE}"
cp "${TEST_FILE}" "${BACKUP_FILE}"

# Fix 1: Add Log facade import at the top of the file
echo "🔧 Fixing Log facade import..."
# Check if the import already exists to avoid duplicate
if ! grep -q "use Illuminate\\Support\\Facades\\Log;" "${TEST_FILE}"; then
    # Insert the Log facade import before the closing use statement block
    sed -i '/use Tests\\TestCase;/i\
use Illuminate\\Support\\Facades\\Log;' "${TEST_FILE}"
    echo "✅ Added Log facade import"
else
    echo "ℹ️ Log facade import already exists, skipping"
fi

# Fix 2: Fix regex pattern in invoice number test
echo "🔧 Fixing regex pattern in invoice number test..."
# First, check if the fix is already applied
if grep -q "\$this->assertMatchesRegularExpression('/^MBC-\[0-9\]{8}-\[0-9\]{5}\$/', \$invoiceNumber);" "${TEST_FILE}"; then
    echo "ℹ️ Regex pattern already fixed, skipping"
else
    # Fix the regex pattern - look for the specific line and replace it
    sed -i "/\\\$this->assertMatchesRegularExpression(/c\
        \$this->assertMatchesRegularExpression('/^MBC-[0-9]{8}-[0-9]{5}\$/', \$invoiceNumber);" "${TEST_FILE}"
    echo "✅ Fixed regex pattern"
fi

# Verify changes were applied
echo "🔍 Verifying changes..."
if grep -q "use Illuminate\\Support\\Facades\\Log;" "${TEST_FILE}"; then
    echo "✅ Log facade import verified"
else
    echo "❌ Log facade import not found - manual check required"
    exit 1
fi

if grep -q "\$this->assertMatchesRegularExpression('/^MBC-\[0-9\]{8}-\[0-9\]{5}\$/', \$invoiceNumber);" "${TEST_FILE}"; then
    echo "✅ Regex pattern verified"
else
    echo "❌ Regex pattern not fixed - manual check required"
    exit 1
fi

# Run PHP syntax check to ensure no syntax errors were introduced
echo "🔍 Running PHP syntax check..."
if docker compose exec -T backend php -l "/var/www/html/tests/Api/OrderControllerTest.php"; then
    echo "✅ PHP syntax check passed"
else
    echo "❌ PHP syntax check failed - restoring backup"
    cp "${BACKUP_FILE}" "${TEST_FILE}"
    exit 1
fi

echo "✅✅ All fixes applied successfully ✅✅"
echo "Backup preserved at: ${BACKUP_FILE}"
echo "💡 Next steps:"
echo "   - Run the test: docker compose exec backend php artisan test --filter='OrderControllerTest::test_pdpa_consent_recorded_with_order'"
echo "   - If issues persist, restore from backup: cp ${BACKUP_FILE} ${TEST_FILE}"
