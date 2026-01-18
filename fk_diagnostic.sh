#!/usr/bin/env bash
set -euo pipefail

# Configuration - use project's backend directory for file creation
PROJECT_ROOT="/home/project/authentic-kopitiam"
BACKEND_HOST_DIR="${PROJECT_ROOT}/backend"
BACKEND_CONTAINER_DIR="/var/www/html"
SCRIPT_NAME="fk_diagnostic_$(date +%s).php"
CONTAINER_SERVICE="backend"
TIMEOUT_SECONDS=10

echo "🔍 Starting foreign key diagnostic..."

# Pre-flight container health check
echo "✅ Checking container health..."
if ! docker compose ps --format '{{.Status}}' "${CONTAINER_SERVICE}" 2>/dev/null | grep -q 'Up'; then
    echo "❌ Container '${CONTAINER_SERVICE}' is not running or unhealthy" >&2
    echo "💡 Start it with: docker compose up -d ${CONTAINER_SERVICE}" >&2
    exit 1
fi
echo "✅ Container is healthy"

# Create diagnostic script in HOST'S backend directory
SCRIPT_PATH="${BACKEND_HOST_DIR}/${SCRIPT_NAME}"

# Get database credentials from .env file (host side)
ENV_FILE="${PROJECT_ROOT}/.env"
if [ ! -f "${ENV_FILE}" ]; then
    echo "❌ ERROR: .env file not found at ${ENV_FILE}" >&2
    exit 1
fi

# Extract database credentials using bash (no PHP dependencies)
DB_HOST=$(grep -E "^DB_HOST=" "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\r')
DB_PORT=$(grep -E "^DB_PORT=" "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\r')
DB_DATABASE=$(grep -E "^DB_DATABASE=" "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\r')
DB_USERNAME=$(grep -E "^DB_USERNAME=" "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\r')
DB_PASSWORD=$(grep -E "^DB_PASSWORD=" "${ENV_FILE}" | cut -d '=' -f2- | tr -d '\r')

# Validate credentials were extracted
if [ -z "${DB_HOST}" ] || [ -z "${DB_DATABASE}" ] || [ -z "${DB_USERNAME}" ]; then
    echo "❌ ERROR: Failed to extract database credentials from .env file" >&2
    echo "💡 Check that your .env file contains DB_HOST, DB_DATABASE, and DB_USERNAME" >&2
    exit 1
fi

# Set defaults if not found
DB_PORT=${DB_PORT:-5432}
DB_PASSWORD=${DB_PASSWORD:-}

echo "✅ Extracted database credentials from .env"
echo "   Host: ${DB_HOST}, Database: ${DB_DATABASE}, User: ${DB_USERNAME}"

# Create minimal PHP script with extracted credentials
cat > "${SCRIPT_PATH}" << EOF
<?php
declare(strict_types=1);

// Database credentials passed from host environment
\$dbHost = '${DB_HOST}';
\$dbPort = '${DB_PORT}';
\$dbName = '${DB_DATABASE}';
\$dbUser = '${DB_USERNAME}';
\$dbPass = '${DB_PASSWORD}';

try {
    // Create direct PDO connection without any framework dependencies
    \$dsn = "pgsql:host={\$dbHost};port={\$dbPort};dbname={\$dbName}";
    \$pdo = new PDO(\$dsn, \$dbUser, \$dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ
    ]);
    
    echo "✅ Direct database connection successful\\n\\n";
    
    // Get foreign keys for pdpa_consents table
    echo "🔍 FOREIGN KEYS FOR pdpa_consents:\\n";
    echo "===================================\\n\\n";
    
    \$stmt = \$pdo->prepare("
        SELECT 
            tc.constraint_name AS constraint_name,
            kcu.column_name AS column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'pdpa_consents'
            AND tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.constraint_name
    ");
    
    \$stmt->execute();
    \$results = \$stmt->fetchAll();
    
    if (empty(\$results)) {
        echo "⚠️  NO FOREIGN KEYS FOUND\\n";
        echo "   Note: This may be intentional for GDPR/PDPA compliance\\n";
    } else {
        foreach (\$results as \$fk) {
            echo "Constraint: " . htmlspecialchars(\$fk->constraint_name) . "\\n";
            echo "Column:     pdpa_consents.{\$fk->column_name}\\n";
            echo "References: {\$fk->foreign_table_name}.{\$fk->foreign_column_name}\\n";
            echo "─────────────────────────────────────────────\\n";
        }
    }
    
    // Get indexes
    echo "\\n🔍 INDEXES FOR pdpa_consents:\\n";
    echo "=============================\\n\\n";
    
    \$indexStmt = \$pdo->prepare("
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'pdpa_consents'
        ORDER BY indexname
    ");
    \$indexStmt->execute();
    \$indexes = \$indexStmt->fetchAll();
    
    if (empty(\$indexes)) {
        echo "⚠️  NO INDEXES FOUND\\n";
    } else {
        foreach (\$indexes as \$idx) {
            \$isUnique = stripos(\$idx->indexdef, 'UNIQUE') !== false ? 'UNIQUE' : 'NORMAL';
            echo "{\$idx->indexname} ({\$isUnique})\\n";
            echo "   " . htmlspecialchars(substr(\$idx->indexdef, 0, 80)) . "...\\n";
        }
    }
    
    echo "\\n✅ DIAGNOSTIC COMPLETED SUCCESSFULLY\\n";
    exit(0);
    
} catch (PDOException \$e) {
    echo "❌ DATABASE ERROR: " . \$e->getMessage() . "\\n";
    echo "💡 Connection attempt:\\n";
    echo "   DSN: pgsql:host={\$dbHost};port={\$dbPort};dbname={\$dbName}\\n";
    echo "   User: {\$dbUser}\\n";
    exit(1);
} catch (Exception \$e) {
    echo "❌ GENERAL ERROR: " . \$e->getMessage() . "\\n";
    exit(1);
}
EOF

echo "✅ Created minimal diagnostic script at: ${SCRIPT_PATH}"

# Execute in container using mapped path
CONTAINER_SCRIPT_PATH="${BACKEND_CONTAINER_DIR}/${SCRIPT_NAME}"
echo "🔍 Executing diagnostic in container..."
echo "   Container path: ${CONTAINER_SCRIPT_PATH}"
echo "   Timeout: ${TIMEOUT_SECONDS} seconds"

# Execute with proper timeout handling
{
    timeout "${TIMEOUT_SECONDS}"s docker compose exec -T "${CONTAINER_SERVICE}" \
        php -d max_execution_time=${TIMEOUT_SECONDS} "${CONTAINER_SCRIPT_PATH}"
} || {
    EXIT_CODE=$?
    case $EXIT_CODE in
        124) 
            echo "⚠️  WARNING: Execution timed out after ${TIMEOUT_SECONDS} seconds" >&2
            echo "💡 TIPS:" >&2
            echo "   - Check database is reachable: docker compose exec backend ping -c 2 ${DB_HOST}" >&2
            echo "   - Verify credentials in .env file" >&2
            ;;
        137)
            echo "⚠️  WARNING: Process killed (likely memory or resource limits)" >&2
            ;;
        *)
            echo "❌ ERROR: Script failed with exit code ${EXIT_CODE}" >&2
            ;;
    esac
}

# Clean up - remove from HOST directory only
echo "🧹 Cleaning up temporary script..."
rm -f "${SCRIPT_PATH}" 2>/dev/null || true

echo "✅✅ FOREIGN KEY DIAGNOSTIC COMPLETED ✅✅"
echo "💡 Next steps based on findings:"
echo "   - If no foreign keys: Consider adding FK for customer_id → users(id)"
echo "   - If unique index on pseudonymized_id: Plan composite index migration"
echo "   - Review index performance for consent lookups"
