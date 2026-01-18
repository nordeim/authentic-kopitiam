#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ROOT="/home/project/authentic-kopitiam"
MODEL_FILE="${PROJECT_ROOT}/backend/app/Models/PaymentRefund.php"
BACKUP_DIR="${PROJECT_ROOT}/backend/app/Models/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/PaymentRefund_${TIMESTAMP}.php"

# Pre-flight checks
echo "🔍 Starting PaymentRefund model update..."

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create backup before making changes
if [ -f "${MODEL_FILE}" ]; then
    echo "✅ Creating backup: ${BACKUP_FILE}"
    cp "${MODEL_FILE}" "${BACKUP_FILE}"
else
    echo "⚠️  Original file not found, will create new file"
fi

# Define the corrected content with proper syntax
cat > "${MODEL_FILE}" << 'EOF'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PaymentRefund extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    protected $keyType = "string";
    public $incrementing = false;

    protected $fillable = [
        'payment_id',
        'amount',
        'currency',
        'provider_refund_id',
        'provider_metadata',
        'reason',
        'inventory_restored',
        'refunded_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'provider_metadata' => 'array',
        'inventory_restored' => 'boolean',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function refundedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }
}
EOF

echo "✅ Content written to ${MODEL_FILE}"

# Verify file was created successfully
if [ ! -f "${MODEL_FILE}" ]; then
    echo "❌ ERROR: File was not created successfully"
    if [ -f "${BACKUP_FILE}" ]; then
        echo "🔄 Restoring from backup..."
        cp "${BACKUP_FILE}" "${MODEL_FILE}"
    fi
    exit 1
fi

# Run PHP syntax check
echo "🔍 Running PHP syntax check..."
if ! docker compose exec -T backend php -l "/var/www/html/app/Models/PaymentRefund.php"; then
    echo "❌ PHP syntax check failed - restoring backup"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${MODEL_FILE}"
        echo "✅ Restored from backup: ${BACKUP_FILE}"
    fi
    exit 1
fi
echo "✅ PHP syntax check passed"

# Additional validation: Check for critical syntax elements
echo "🔍 Performing additional validation..."

# Check for Str import (using proper pattern matching)
if ! grep -q "use Illuminate\\\\Support\\\\Str;" "${MODEL_FILE}"; then
    echo "❌ ERROR: Str facade import missing"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${MODEL_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

# Check for fillable array syntax
if ! grep -q "protected \$fillable = \[" "${MODEL_FILE}"; then
    echo "❌ ERROR: \$fillable array syntax is incorrect"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${MODEL_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

# Check for boot method with UUID generation
if ! grep -q "static::creating(function" "${MODEL_FILE}" || ! grep -q "Str::uuid()" "${MODEL_FILE}"; then
    echo "❌ ERROR: UUID boot method not properly implemented"
    if [ -f "${BACKUP_FILE}" ]; then
        cp "${BACKUP_FILE}" "${MODEL_FILE}"
        echo "✅ Restored from backup"
    fi
    exit 1
fi

echo "✅✅ PaymentRefund model updated successfully ✅✅"
echo "💡 Key changes made:"
echo "   - Added HasFactory trait and UUID boot method"
echo "   - Fixed \$fillable array syntax with proper brackets"
echo "   - Added proper imports for Str, BelongsTo, and HasFactory"
echo "   - Set correct key type (string) and disabled incrementing"
echo "   - Added cast definitions for amount, provider_metadata, and inventory_restored"
echo "   - Implemented relationships: payment() and refundedBy()"
echo "Backup preserved at: ${BACKUP_FILE}"
echo ""
echo "💡 Next steps:"
echo "   - Verify model relationships: docker compose exec backend php artisan tinker"
echo "   - Test model creation: PaymentRefund::factory()->create()"
echo "   - Check database migration exists for payment_refunds table"
echo "   - Run related tests if available"
