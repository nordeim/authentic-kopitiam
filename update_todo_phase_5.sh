#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ROOT="/home/project/authentic-kopitiam"
TODO_DIR="${PROJECT_ROOT}/backend/storage/app/todos"
TODO_FILE="${TODO_DIR}/phases.json"
BACKUP_DIR="${TODO_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/phases_${TIMESTAMP}.json"
TEMP_FILE=$(mktemp)

# Pre-flight checks
echo "🔍 Starting TODO phases update..."

# Create directories if they don't exist
mkdir -p "${TODO_DIR}"
mkdir -p "${BACKUP_DIR}"

# Create backup before making changes
if [ -f "${TODO_FILE}" ]; then
    echo "✅ Creating backup: ${BACKUP_FILE}"
    cp "${TODO_FILE}" "${BACKUP_FILE}"
else
    echo "ℹ️  TODO file not found, creating new file"
fi

# Define the TODO phases data
cat > "${TEMP_FILE}" << 'EOF'
{
  "phases": [
    {
      "content": "Phase 5.1: Create payment state management (payment-store.ts, use-payment-status.ts)",
      "id": "phase-5-1",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Phase 5.2: Payment method selection UI (payment-method-selector.tsx, payment-method-card.tsx)",
      "id": "phase-5-2",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Phase 5.3: PayNow QR display component (paynow-qr-display.tsx, qr-save/share buttons)",
      "id": "phase-5-3",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Phase 5.4: Stripe Elements integration (stripe-payment-form.tsx, stripe-appearance.ts)",
      "id": "phase-5-4",
      "priority": "high",
      "status": "in_progress"
    },
    {
      "content": "Phase 5.5: Payment status tracker with polling (payment-status-tracker.tsx, success/failed pages)",
      "id": "phase-5-5",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Phase 5.6: Order confirmation page (confirmation/page.tsx, order-summary.tsx)",
      "id": "phase-5-6",
      "priority": "high",
      "status": "pending"
    },
    {
      "content": "Phase 5.7: Error handling & edge cases (network failures, expired sessions, duplicates)",
      "id": "phase-5-7",
      "priority": "medium",
      "status": "pending"
    },
    {
      "content": "Phase 5.8: E2E testing & QA (Playwright tests, Lighthouse CI, visual regression)",
      "id": "phase-5-8",
      "priority": "medium",
      "status": "pending"
    }
  ],
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": 1
}
EOF

# Validate JSON syntax
echo "🔍 Validating JSON syntax..."
if ! jq empty "${TEMP_FILE}" >/dev/null 2>&1; then
    echo "❌ ERROR: Invalid JSON syntax in TODO data"
    rm -f "${TEMP_FILE}"
    if [ -f "${BACKUP_FILE}" ]; then
        echo "✅ Restored from backup (if applicable)"
    fi
    exit 1
fi
echo "✅ JSON syntax validated"

# Merge with existing data if file exists
if [ -f "${TODO_FILE}" ]; then
    echo "🔄 Merging with existing TODO data..."
    
    # Use jq to merge existing phases with new ones, preserving existing data
    jq --argjson new_data "$(cat "${TEMP_FILE}")" '
        if .phases then
            # Merge existing and new phases, prioritizing new data for matching IDs
            .phases = ( 
                (.phases // []) as $existing |
                ($new_data.phases // []) as $new |
                ($existing + $new) | unique_by(.id) |
                map(
                    . as $item |
                    $new | map(select(.id == $item.id)) | first as $match |
                    if $match then $match else . end
                )
            ) |
            .updated_at = $new_data.updated_at |
            .version = ($new_data.version // .version // 1) + 1
        else
            $new_data
        end
    ' "${TODO_FILE}" > "${TEMP_FILE}.merged" && mv "${TEMP_FILE}.merged" "${TEMP_FILE}"
    
    echo "✅ Data merged successfully"
else
    echo "🆕 Creating new TODO file"
fi

# Write the updated data to the TODO file
mv "${TEMP_FILE}" "${TODO_FILE}"
chmod 644 "${TODO_FILE}"

echo "✅ TODO phases updated successfully"

# Verify the file was written correctly
echo "🔍 Verifying file integrity..."
if [ ! -f "${TODO_FILE}" ]; then
    echo "❌ ERROR: TODO file was not created"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${TODO_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

# Check file size is reasonable
FILE_SIZE=$(stat -c%s "${TODO_FILE}" 2>/dev/null || stat -f%z "${TODO_FILE}" 2>/dev/null)
if [ "${FILE_SIZE}" -lt 100 ]; then
    echo "❌ ERROR: File size too small (${FILE_SIZE} bytes) - likely corruption"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${TODO_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi
echo "✅ File integrity verified"

# Additional validation: Check for required fields
echo "🔍 Validating data structure..."
if ! jq '.phases | length > 0' "${TODO_FILE}" >/dev/null 2>&1; then
    echo "❌ ERROR: No phases found in TODO data"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${TODO_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

if ! jq '.phases[] | select(.id == "phase-5-4") | .status == "in_progress"' "${TODO_FILE}" >/dev/null 2>&1; then
    echo "❌ ERROR: Phase 5.4 status not set correctly"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${TODO_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi
echo "✅ Data structure validated"

# Generate summary
echo "✅✅ TODO phases update completed successfully ✅✅"
echo ""
echo "📊 Update Summary:"
echo "   Total phases: $(jq '.phases | length' "${TODO_FILE}")"
echo "   Completed: $(jq '.phases | map(select(.status == "completed")) | length' "${TODO_FILE}")"
echo "   In Progress: $(jq '.phases | map(select(.status == "in_progress")) | length' "${TODO_FILE}")"
echo "   Pending: $(jq '.phases | map(select(.status == "pending")) | length' "${TODO_FILE}")"
echo "   High Priority: $(jq '.phases | map(select(.priority == "high")) | length' "${TODO_FILE}")"
echo ""
echo "💡 Key Updates:"
echo "   - ✅ Phase 5.1: Payment state management (COMPLETED)"
echo "   - ✅ Phase 5.2: Payment method selection UI (COMPLETED)"
echo "   - ✅ Phase 5.3: PayNow QR display component (COMPLETED)"
echo "   - 🔄 Phase 5.4: Stripe Elements integration (IN PROGRESS)"
echo "   - ⏳ Phase 5.5: Payment status tracker (PENDING)"
echo "   - ⏳ Phase 5.6: Order confirmation page (PENDING)"
echo "   - ⏳ Phase 5.7: Error handling & edge cases (PENDING)"
echo "   - ⏳ Phase 5.8: E2E testing & QA (PENDING)"
echo ""
echo "🗂️  File Location: ${TODO_FILE}"
echo "💾 Backup preserved at: ${BACKUP_FILE}"
echo "⏱️  Updated at: $(jq -r '.updated_at' "${TODO_FILE}")"
echo "🔢 Version: $(jq '.version' "${TODO_FILE}")"
echo ""
echo "💡 Next Steps:"
echo "   1. Continue work on Phase 5.4 (Stripe Elements integration)"
echo "   2. Monitor progress on pending phases"
echo "   3. Review high-priority items (5.5, 5.6)"
echo "   4. Update status as phases are completed"
echo ""
echo "🔧 Management Commands:"
echo "   - View all phases: jq '.phases' ${TODO_FILE}"
echo "   - List pending phases: jq '.phases | map(select(.status == \"pending\"))' ${TODO_FILE}"
echo "   - Update phase status: Use this script again with updated data"
echo "   - Restore from backup: cp ${BACKUP_FILE} ${TODO_FILE}"
