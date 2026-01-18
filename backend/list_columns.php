<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$columns = \Illuminate\Support\Facades\Schema::getColumnListing('pdpa_consents');
echo "PDPA Consents Columns:\n";
foreach ($columns as $column) {
    echo "  ✅ {$column}\n";
}
