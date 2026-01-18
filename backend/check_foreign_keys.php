<?php
declare(strict_types=1);

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    echo "🔍 FOREIGN KEY ANALYSIS FOR pdpa_consents TABLE\n";
    echo "=============================================\n\n";

    // Get foreign keys using Laravel's schema builder for safety
    $foreignKeys = DB::select("
        SELECT 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name, 
            ccu.column_name AS foreign_column_name 
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu 
            ON tc.constraint_name = ccu.constraint_name 
        WHERE tc.table_name = ? 
            AND tc.constraint_type = 'FOREIGN KEY'
    ", ['pdpa_consents']);

    if (empty($foreignKeys)) {
        echo "⚠️  NO FOREIGN KEYS FOUND on pdpa_consents table\n";
        echo "   This may be intentional for GDPR/PDPA compliance,\n";
        echo "   but typically customer_id should reference users table.\n";
    } else {
        echo "✅ FOUND " . count($foreignKeys) . " FOREIGN KEY(S):\n\n";
        foreach ($foreignKeys as $fk) {
            echo "Constraint: " . htmlspecialchars($fk->constraint_name) . "\n";
            echo "Column:     " . htmlspecialchars($fk->table_name) . "." . htmlspecialchars($fk->column_name) . "\n";
            echo "References: " . htmlspecialchars($fk->foreign_table_name) . "." . htmlspecialchars($fk->foreign_column_name) . "\n";
            echo "─────────────────────────────────────────────────────────\n";
        }
    }

    // Additional validation checks
    echo "\n🔍 ADDITIONAL VALIDATION CHECKS:\n";
    echo "─────────────────────────────────────────────────────────\n";

    // Check if customer_id column exists and should have FK
    if (Schema::hasColumn('pdpa_consents', 'customer_id')) {
        echo "✅ customer_id column exists\n";
        
        // Check if it should have a foreign key to users table
        $hasUserReference = !empty(array_filter($foreignKeys, fn($fk) => 
            $fk->column_name === 'customer_id' && 
            $fk->foreign_table_name === 'users'
        ));
        
        if (!$hasUserReference) {
            echo "⚠️  customer_id has NO foreign key to users table\n";
            echo "   Recommendation: Add foreign key constraint for data integrity\n";
            echo "   ALTER TABLE pdpa_consents ADD CONSTRAINT fk_pdpa_consents_customer\n";
            echo "   FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL;\n";
        } else {
            echo "✅ customer_id has proper foreign key to users table\n";
        }
    } else {
        echo "⚠️  customer_id column does not exist\n";
        echo "   This may be intentional for anonymization, but affects data linking\n";
    }

    // Check index status for performance
    $indexes = DB::select("
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'pdpa_consents' 
        ORDER BY indexname
    ");

    echo "\n🔍 INDEX STATUS:\n";
    echo "─────────────────────────────────────────────────────────\n";
    foreach ($indexes as $idx) {
        echo $idx->indexname . "\n";
        $isUnique = stripos($idx->indexdef, 'UNIQUE') !== false ? ' (UNIQUE)' : '';
        echo "   Type: " . ($isUnique ? 'UNIQUE' : 'NORMAL') . "\n";
        echo "   Definition: " . htmlspecialchars(substr($idx->indexdef, 0, 80)) . "...\n";
    }

    echo "\n✅ DIAGNOSTIC COMPLETED SUCCESSFULLY\n";

} catch (\Throwable $e) {
    echo "❌ CRITICAL ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}
