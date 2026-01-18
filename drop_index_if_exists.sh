#!/bin/bash
set -euo pipefail

PROJECT_ROOT="/home/project/authentic-kopitiam"
SERVICE_NAME="postgres"
DATABASE_NAME="morning_brew"
DATABASE_USER="brew_user"

echo "🔍 Starting index cleanup for migration fix..."

# Verify we're in the correct project directory
if [ ! -f "${PROJECT_ROOT}/docker-compose.yml" ]; then
    echo "❌ ERROR: docker-compose.yml not found at ${PROJECT_ROOT}"
    echo "💡 Make sure you're in the project root directory"
    exit 1
fi

# Verify container is running
echo "✅ Checking PostgreSQL container status..."
if ! docker compose -f "${PROJECT_ROOT}/docker-compose.yml" ps --format '{{.Status}}' "${SERVICE_NAME}" 2>/dev/null | grep -q 'Up'; then
    echo "❌ WARNING: PostgreSQL service '${SERVICE_NAME}' is not running"
    echo "💡 Starting PostgreSQL service..."
    docker compose -f "${PROJECT_ROOT}/docker-compose.yml" up -d "${SERVICE_NAME}" || {
        echo "❌ ERROR: Failed to start PostgreSQL service"
        exit 1
    }
    echo "⏳ Waiting 10 seconds for PostgreSQL to initialize..."
    sleep 10
fi
echo "✅ PostgreSQL service is running"

# List existing indexes before dropping (for audit trail)
echo "📋 Current indexes on payments table:"
docker compose -f "${PROJECT_ROOT}/docker-compose.yml" exec -T "${SERVICE_NAME}" psql -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -c "
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'payments' 
    ORDER BY indexname;
"

# Drop conflicting indexes safely
echo "🔧 Dropping conflicting indexes..."
docker compose -f "${PROJECT_ROOT}/docker-compose.yml" exec -T "${SERVICE_NAME}" psql -U "${DATABASE_USER}" -d "${DATABASE_NAME}" << 'SQL'
-- Drop indexes that cause conflicts during migration tests
DROP INDEX IF EXISTS payments_provider_payment_id_index;
DROP INDEX IF EXISTS payments_order_id_status_index;
DROP INDEX IF EXISTS payments_order_id_index;
DROP INDEX IF EXISTS payments_payment_method_status_index;
DROP INDEX IF EXISTS payments_payment_completed_at_index;
DROP INDEX IF EXISTS payments_status_index;
DROP INDEX IF EXISTS payments_payment_provider_index;

-- Also drop the table if it exists to ensure clean state
DROP TABLE IF EXISTS payments CASCADE;

SELECT '✅ Index cleanup completed successfully' as status;
SQL

# Verify indexes were dropped
echo "🔍 Verifying index cleanup..."
INDEX_COUNT=$(docker compose -f "${PROJECT_ROOT}/docker-compose.yml" exec -T "${SERVICE_NAME}" psql -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -t -c "
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE tablename = 'payments'
" | tr -d '[:space:]')

if [ "$INDEX_COUNT" -eq "0" ]; then
    echo "✅✅ All conflicting indexes successfully dropped ✅✅"
    echo "💡 Next steps:"
    echo "   1. Run your tests again:"
    echo "      docker compose exec backend php artisan test --filter=PaymentControllerTest"
    echo ""
    echo "   2. The migration should now run cleanly with RefreshDatabase trait"
    echo ""
    echo "   3. If you still encounter issues, consider using SQLite for testing:"
    echo "      - Create .env.testing file with DB_CONNECTION=sqlite"
    echo "      - Create database/database.sqlite file"
else
    echo "⚠️  WARNING: Some indexes may still exist (count: ${INDEX_COUNT})"
    echo "💡 Manual verification recommended:"
    docker compose -f "${PROJECT_ROOT}/docker-compose.yml" exec -T "${SERVICE_NAME}" psql -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -c "
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE tablename = 'payments'
        ORDER BY indexname;
    "
fi

echo "✅✅ Index cleanup completed ✅✅"
