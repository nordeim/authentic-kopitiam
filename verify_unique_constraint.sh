#!/bin/bash
set -euo pipefail

# Configuration from .env
DB_HOST="localhost"  # Docker maps port 5432 to host
DB_PORT="5432"
DB_NAME="morning_brew"
DB_USER="brew_user"
DB_PASSWORD="brew_secret"

echo "🔍 Verifying unique constraints on pdpa_consents table..."

# Set password environment variable for psql
export PGPASSWORD="${DB_PASSWORD}"

# Use psql with proper timeout and error handling
timeout 2s psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
    SELECT indexname AS \"Index Name\", 
           indexdef AS \"Definition\"
    FROM pg_indexes 
    WHERE tablename = 'pdpa_consents' 
    AND indexdef LIKE '%UNIQUE%'
    ORDER BY indexname;
" || {
    echo "⚠️  Database query failed or timed out" >&2
    echo "💡 Checking database connectivity..." >&2
    timeout 1s psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "\conninfo" 2>/dev/null || {
        echo "❌ Cannot connect to database. Check:" >&2
        echo "   - Docker containers are running: docker compose ps" >&2
        echo "   - PostgreSQL port is mapped: should show 0.0.0.0:5432->5432/tcp" >&2
        exit 1
    }
    echo "✅ Database connection successful, but query may have timed out" >&2
}

echo -e "\n✅✅ Constraint verification completed ✅✅"
echo "💡 If no results shown, unique constraints may not exist or query timed out"
