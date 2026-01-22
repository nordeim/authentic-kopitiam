<?php

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Location;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use DOMDocument;

class InvoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $invoiceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->invoiceService = new InvoiceService();
    }

    public function test_generate_ubl_xml_structure()
    {
        // 1. Create Location
        $location = Location::factory()->create();

        // 2. Create Order
        $order = Order::factory()->create([
            'invoice_number' => 'MBC-20260122-0001',
            'customer_name' => 'Test Customer',
            'location_id' => $location->id,
            'subtotal' => 100.0000,
            'gst_amount' => 9.0000,
            'total_amount' => 109.0000,
        ]);

        // 3. Clear auto-generated items from factory
        $order->items()->delete();

        // 4. Create explicit product and item
        $product = Product::factory()->create([
            'name' => 'Test Product',
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'unit_price' => 50.0000,
            'quantity' => 2,
        ]);

        // Refresh order to load relations
        $order->load('items.product');

        // 5. Generate XML
        $xmlContent = $this->invoiceService->generateUblXml($order);

        // 6. Validate XML Structure
        $dom = new DOMDocument();
        $this->assertTrue($dom->loadXML($xmlContent), 'XML should be valid');

        // Check Namespaces
        $root = $dom->documentElement;
        $this->assertEquals('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', $root->namespaceURI);

        // Check Customization ID (Singapore Peppol)
        $customizationId = $dom->getElementsByTagName('CustomizationID')->item(0)->nodeValue;
        $this->assertEquals('urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0:singapore:1.0.0', $customizationId);

        // Check Amounts (Precision)
        $taxAmount = $dom->getElementsByTagName('TaxAmount')->item(0)->nodeValue;
        $this->assertEquals('9.00', $taxAmount, 'Tax amount should be formatted to 2 decimals');

        $payableAmount = $dom->getElementsByTagName('PayableAmount')->item(0)->nodeValue;
        $this->assertEquals('109.00', $payableAmount, 'Payable amount should be formatted to 2 decimals');
        
        // Check Item Details
        $itemName = $dom->getElementsByTagName('Item')->item(0)->getElementsByTagName('Name')->item(0)->nodeValue;
        $this->assertEquals('Test Product', $itemName);
    }
}
