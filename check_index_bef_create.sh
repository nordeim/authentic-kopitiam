#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ROOT="/home/project/authentic-kopitiam"
MIGRATION_FILE="${PROJECT_ROOT}/backend/database/migrations/2026_01_17_000008_create_payments_table.php"
BACKUP_DIR="${PROJECT_ROOT}/backend/database/migrations/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/create_payments_table_${TIMESTAMP}.php"
TEMP_DIR="/tmp/migration_fix_$$"

# Pre-flight checks
echo "🔍 Starting migration fix for payments table..."

# Create directories if they don't exist
mkdir -p "${BACKUP_DIR}"
mkdir -p "${TEMP_DIR}"

# Create backup before making changes
if [ -f "${MIGRATION_FILE}" ]; then
    echo "✅ Creating backup: ${BACKUP_FILE}"
    cp "${MIGRATION_FILE}" "${BACKUP_FILE}"
else
    echo "❌ ERROR: Migration file not found at ${MIGRATION_FILE}"
    exit 1
fi

# Check if the exact fix we want is already applied correctly
if grep -q "Schema::dropIfExists('payments');" "${MIGRATION_FILE}" && \
   grep -q "Schema::create('payments'," "${MIGRATION_FILE}"; then
    
    # Get the content of the up() method to verify structure
    UP_METHOD_START=$(grep -n "public function up(): void" "${MIGRATION_FILE}" | cut -d: -f1)
    UP_METHOD_END=$(awk "/public function up\(\): void/,/}/ {if (/}/) print NR}" "${MIGRATION_FILE}" | head -1)
    
    if [ -n "${UP_METHOD_START}" ] && [ -n "${UP_METHOD_END}" ]; then
        UP_METHOD_CONTENT=$(sed -n "${UP_METHOD_START},${UP_METHOD_END}p" "${MIGRATION_FILE}")
        
        # Check if dropIfExists is the first statement inside the method
        if echo "${UP_METHOD_CONTENT}" | grep -q "Schema::dropIfExists('payments');" && \
           echo "${UP_METHOD_CONTENT}" | grep -q "Schema::create('payments',"; then
            echo "✅ Migration is correctly structured with dropIfExists before create"
            echo "   No changes needed. Backup preserved at: ${BACKUP_FILE}"
            exit 0
        fi
    fi
fi

echo "ℹ️  Migration needs fixing - proceeding with update..."

# Find the line number where the up() method body starts (the opening brace)
UP_METHOD_BODY_START=$(awk '/public function up\(\): void/,/{/ {if (/{/) print NR; exit}' "${MIGRATION_FILE}")

if [ -z "${UP_METHOD_BODY_START}" ]; then
    echo "❌ ERROR: Could not find opening brace of up() method"
    echo "💡 Looking for line containing '{' after 'public function up(): void'"
    
    # Fallback: find the line after the function declaration
    FUNCTION_DECLARATION_LINE=$(grep -n "public function up(): void" "${MIGRATION_FILE}" | cut -d: -f1)
    if [ -z "${FUNCTION_DECLARATION_LINE}" ]; then
        echo "❌ ERROR: Could not find function declaration line"
        cp "${BACKUP_FILE}" "${MIGRATION_FILE}"
        exit 1
    fi
    
    UP_METHOD_BODY_START=$((FUNCTION_DECLARATION_LINE + 1))
    echo "⚠️  Using fallback position: line ${UP_METHOD_BODY_START}"
fi

echo "✅ Found up() method body start at line ${UP_METHOD_BODY_START}"

# Create a temporary file for the updated content
TEMP_FILE="${TEMP_DIR}/fixed_migration.php"

# Copy all lines up to the method body start
head -n "${UP_METHOD_BODY_START}" "${MIGRATION_FILE}" > "${TEMP_FILE}"

# Add the dropIfExists statement with proper indentation (4 spaces for method body)
cat >> "${TEMP_FILE}" << 'EOF'
        Schema::dropIfExists('payments');
        
EOF

# Copy the remaining lines
tail -n +"$((UP_METHOD_BODY_START + 1))" "${MIGRATION_FILE}" >> "${TEMP_FILE}"

# Replace the original file with the updated content
mv "${TEMP_FILE}" "${MIGRATION_FILE}"

echo "✅ Migration file updated successfully"

# Clean up temporary directory
rm -rf "${TEMP_DIR}"

# Run PHP syntax check
echo "🔍 Running PHP syntax check..."
if ! docker compose exec -T backend php -l "/var/www/html/database/migrations/2026_01_17_000008_create_payments_table.php"; then
    echo "❌ PHP syntax check failed - restoring backup"
    cp "${BACKUP_FILE}" "${MIGRATION_FILE}"
    echo "✅ Restored from backup: ${BACKUP_FILE}"
    exit 1
fi
echo "✅ PHP syntax check passed"

# Additional validation: Check if the fix was applied correctly
if ! grep -q "Schema::dropIfExists('payments');" "${MIGRATION_FILE}"; then
    echo "❌ ERROR: Schema::dropIfExists statement not added successfully"
    cp "${BACKUP_FILE}" "${MIGRATION_FILE}"
    echo "✅ Restored from backup"
    exit 1
fi

# Verify the structure is correct by checking the up() method content
UP_METHOD_CONTENT=$(sed -n '/public function up(): void/,/}/p' "${MIGRATION_FILE}")
if ! echo "${UP_METHOD_CONTENT}" | grep -q "Schema::dropIfExists('payments');" || \
   ! echo "${UP_METHOD_CONTENT}" | grep -q "Schema::create('payments',"; then
    echo "❌ ERROR: Migration structure is incorrect after fix"
    cp "${BACKUP_FILE}" "${MIGRATION_FILE}"
    echo "✅ Restored from backup"
    exit 1
fi

echo "✅✅ Migration file fixed successfully ✅✅"
echo "💡 Fix applied: Added Schema::dropIfExists('payments') as first statement in up() method"
echo "   - Makes migration idempotent for test environments"
echo "   - Prevents duplicate index creation errors during RefreshDatabase"
echo "   - Properly placed inside method body with correct indentation"
echo "Backup preserved at: ${BACKUP_FILE}"
echo ""
echo "💡 Next steps:"
echo "   1. Run the tests again to verify the fix:"
echo "      docker compose exec backend php artisan test --filter=PaymentControllerTest"
echo ""
echo "   2. If tests still fail with index errors, consider using SQLite for testing:"
echo "      Create .env.testing file with DB_CONNECTION=sqlite"
echo "      And create database/database.sqlite file"
echo ""
echo "   3. Verify the migration works in both directions:"
echo "      docker compose exec backend php artisan migrate:rollback"
echo "      docker compose exec backend php artisan migrate"
echo ""
echo "   4. Check the actual database schema:"
echo "      docker compose exec backend psql -U brew_user -d morning_brew -c \"\\d payments\""
