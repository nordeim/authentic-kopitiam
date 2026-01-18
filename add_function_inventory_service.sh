#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ROOT="/home/project/authentic-kopitiam"
SERVICE_FILE="${PROJECT_ROOT}/backend/app/Services/InventoryService.php"
BACKUP_DIR="${PROJECT_ROOT}/backend/app/Services/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/InventoryService_${TIMESTAMP}.php"

# Pre-flight checks
echo "🔍 Starting inventory service update..."

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create backup before making changes
if [ -f "${SERVICE_FILE}" ]; then
    echo "✅ Creating backup: ${BACKUP_FILE}"
    cp "${SERVICE_FILE}" "${BACKUP_FILE}"
else
    echo "❌ ERROR: Service file not found at ${SERVICE_FILE}"
    exit 1
fi

# Find the line number of the final closing brace of the class
# Look for the line that contains only "}" (with optional whitespace)
CLOSING_BRACE_LINE=$(grep -n "^}$" "${SERVICE_FILE}" | tail -1 | cut -d: -f1)

if [ -z "${CLOSING_BRACE_LINE}" ]; then
    echo "❌ ERROR: Could not find class closing brace in ${SERVICE_FILE}"
    echo "💡 Manual intervention required - restoring backup"
    cp "${BACKUP_FILE}" "${SERVICE_FILE}"
    exit 1
fi

echo "✅ Found class closing brace at line ${CLOSING_BRACE_LINE}"

# Create a temporary file with the new content
TEMP_FILE=$(mktemp)

# Copy all lines up to (but not including) the closing brace
head -n $((CLOSING_BRACE_LINE - 1)) "${SERVICE_FILE}" > "${TEMP_FILE}"

# Add the new method using heredoc to avoid quote escaping issues
cat >> "${TEMP_FILE}" << 'EOF'

    /**
     * Restore inventory for cancelled/refunded order
     * @param \App\Models\Order $order
     * @return void
     * @throws \Exception
     */
    public function restoreInventoryForCancelledOrder($order): void
    {
        if (!$order) {
            throw new \Exception("Order is required for inventory restoration");
        }
        
        // Load order items relationship if not already loaded
        if (!$order->relationLoaded('items')) {
            $order->load('items');
        }
        
        foreach ($order->items as $item) {
            try {
                $product = \App\Models\Product::findOrFail($item->product_id);
                $product->increment('stock_quantity', $item->quantity);
                
                \Illuminate\Support\Facades\Log::info('Inventory restored for cancelled/refunded order', [
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity_restored' => $item->quantity,
                    'new_stock_quantity' => $product->fresh()->stock_quantity,
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to restore inventory for product', [
                    'order_id' => $order->id,
                    'product_id' => $item->product_id ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
                // Don't throw exception to allow other items to be processed
                continue;
            }
        }
    }
EOF

# Add the closing brace back
echo "}" >> "${TEMP_FILE}"

# Replace the original file with the updated content
mv "${TEMP_FILE}" "${SERVICE_FILE}"

echo "✅ Method added to ${SERVICE_FILE}"

# Run PHP syntax check
echo "🔍 Running PHP syntax check..."
if ! docker compose exec -T backend php -l "/var/www/html/app/Services/InventoryService.php"; then
    echo "❌ PHP syntax check failed - restoring backup"
    cp "${BACKUP_FILE}" "${SERVICE_FILE}"
    echo "✅ Restored from backup: ${BACKUP_FILE}"
    exit 1
fi
echo "✅ PHP syntax check passed"

# Additional validation: Check if method was added
if ! grep -q "restoreInventoryForCancelledOrder" "${SERVICE_FILE}"; then
    echo "❌ ERROR: Method was not added successfully"
    cp "${BACKUP_FILE}" "${SERVICE_FILE}"
    echo "✅ Restored from backup"
    exit 1
fi

echo "✅✅ Inventory service updated successfully ✅✅"
echo "💡 Method added: restoreInventoryForCancelledOrder"
echo "   - Restores inventory when orders are cancelled/refunded"
echo "   - Handles product loading and stock incrementing"
echo "   - Includes comprehensive logging and error handling"
echo "Backup preserved at: ${BACKUP_FILE}"
echo ""
echo "💡 Next steps:"
echo "   - Test the method in tinker:"
echo "     docker compose exec backend php artisan tinker"
echo "     >>> app(App\\Services\\InventoryService::class)->restoreInventoryForCancelledOrder(Order::find('your-order-id'))"
echo ""
echo "   - Verify the method works with your order cancellation flow"
echo "   - Check logs for inventory restoration events"
echo "   - Run related tests if available"
