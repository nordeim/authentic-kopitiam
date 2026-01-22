<?php

namespace App\Services;

use App\Models\Order;
use DOMDocument;
use Illuminate\Support\Str;

class InvoiceService
{
    /**
     * Generate PEPPOL BIS Billing 3.0 (UBL 2.1) XML for Singapore InvoiceNow.
     *
     * @param Order $order
     * @return string
     */
    public function generateUblXml(Order $order): string
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        // 1. Root Element: Invoice
        $invoice = $dom->createElementNS('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2', 'Invoice');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:cac', 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');
        $invoice->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:cbc', 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');
        $dom->appendChild($invoice);

        // 2. Customization & Profile IDs (Singapore Peppol Specific)
        $this->addCbc($dom, $invoice, 'CustomizationID', 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0:singapore:1.0.0');
        $this->addCbc($dom, $invoice, 'ProfileID', 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0');

        // 3. Invoice Details
        $this->addCbc($dom, $invoice, 'ID', $order->invoice_number);
        $this->addCbc($dom, $invoice, 'IssueDate', $order->created_at->format('Y-m-d'));
        // 380 = Commercial Invoice
        $this->addCbc($dom, $invoice, 'InvoiceTypeCode', '380');
        $this->addCbc($dom, $invoice, 'DocumentCurrencyCode', 'SGD');

        // 4. Supplier Party (Morning Brew Collective)
        $supplier = $dom->createElement('cac:AccountingSupplierParty');
        $party = $dom->createElement('cac:Party');
        
        // EndpointID (UEN) - Replace with actual UEN
        $endpoint = $dom->createElement('cbc:EndpointID', '202312345A');
        $endpoint->setAttribute('schemeID', '0195'); // 0195 = Singapore UEN
        $party->appendChild($endpoint);

        $partyName = $dom->createElement('cac:PartyName');
        $this->addCbc($dom, $partyName, 'Name', 'Morning Brew Collective');
        $party->appendChild($partyName);

        $partyTaxScheme = $dom->createElement('cac:PartyTaxScheme');
        $this->addCbc($dom, $partyTaxScheme, 'CompanyID', '202312345A');
        $taxScheme = $dom->createElement('cac:TaxScheme');
        $this->addCbc($dom, $taxScheme, 'ID', 'GST');
        $partyTaxScheme->appendChild($taxScheme);
        $party->appendChild($partyTaxScheme);

        $partyLegalEntity = $dom->createElement('cac:PartyLegalEntity');
        $this->addCbc($dom, $partyLegalEntity, 'RegistrationName', 'Morning Brew Collective Pte Ltd');
        $party->appendChild($partyLegalEntity);

        $supplier->appendChild($party);
        $invoice->appendChild($supplier);

        // 5. Customer Party
        $customer = $dom->createElement('cac:AccountingCustomerParty');
        $custParty = $dom->createElement('cac:Party');
        
        $custPartyName = $dom->createElement('cac:PartyName');
        $this->addCbc($dom, $custPartyName, 'Name', $order->customer_name);
        $custParty->appendChild($custPartyName);

        // Assuming B2C for now, but B2B requires EndpointID/LegalEntity similar to supplier
        
        $customer->appendChild($custParty);
        $invoice->appendChild($customer);

        // 6. Tax Total (GST)
        // Note: Singapore GST logic requires checking if items are Standard Rated (S) or Zero Rated (Z).
        // Assuming Standard Rated (9%) for all items for this MVP.
        $taxTotal = $dom->createElement('cac:TaxTotal');
        $taxAmount = $dom->createElement('cbc:TaxAmount', number_format($order->gst_amount, 2, '.', ''));
        $taxAmount->setAttribute('currencyID', 'SGD');
        $taxTotal->appendChild($taxAmount);

        $taxSubtotal = $dom->createElement('cac:TaxSubtotal');
        
        $taxableAmount = $dom->createElement('cbc:TaxableAmount', number_format($order->subtotal, 2, '.', ''));
        $taxableAmount->setAttribute('currencyID', 'SGD');
        $taxSubtotal->appendChild($taxableAmount);

        $taxSubAmount = $dom->createElement('cbc:TaxAmount', number_format($order->gst_amount, 2, '.', ''));
        $taxSubAmount->setAttribute('currencyID', 'SGD');
        $taxSubtotal->appendChild($taxSubAmount);

        $taxCategory = $dom->createElement('cac:TaxCategory');
        $this->addCbc($dom, $taxCategory, 'ID', 'S'); // S = Standard Rated
        $this->addCbc($dom, $taxCategory, 'Percent', '9.00');
        
        $taxSchemeSub = $dom->createElement('cac:TaxScheme');
        $this->addCbc($dom, $taxSchemeSub, 'ID', 'GST');
        $taxCategory->appendChild($taxSchemeSub);
        
        $taxSubtotal->appendChild($taxCategory);
        $taxTotal->appendChild($taxSubtotal);
        $invoice->appendChild($taxTotal);

        // 7. Legal Monetary Total
        $legalTotal = $dom->createElement('cac:LegalMonetaryTotal');
        
        $lineExtension = $dom->createElement('cbc:LineExtensionAmount', number_format($order->subtotal, 2, '.', ''));
        $lineExtension->setAttribute('currencyID', 'SGD');
        $legalTotal->appendChild($lineExtension);

        $taxExclusive = $dom->createElement('cbc:TaxExclusiveAmount', number_format($order->subtotal, 2, '.', ''));
        $taxExclusive->setAttribute('currencyID', 'SGD');
        $legalTotal->appendChild($taxExclusive);

        $taxInclusive = $dom->createElement('cbc:TaxInclusiveAmount', number_format($order->total_amount, 2, '.', ''));
        $taxInclusive->setAttribute('currencyID', 'SGD');
        $legalTotal->appendChild($taxInclusive);

        $payable = $dom->createElement('cbc:PayableAmount', number_format($order->total_amount, 2, '.', ''));
        $payable->setAttribute('currencyID', 'SGD');
        $legalTotal->appendChild($payable);

        $invoice->appendChild($legalTotal);

        // 8. Invoice Lines
        foreach ($order->items as $index => $item) {
            $line = $dom->createElement('cac:InvoiceLine');
            $this->addCbc($dom, $line, 'ID', (string)($index + 1));
            
            $invoicedQty = $dom->createElement('cbc:InvoicedQuantity', (string)$item->quantity);
            $invoicedQty->setAttribute('unitCode', 'C62'); // C62 = Unit (Piece)
            $line->appendChild($invoicedQty);

            $lineExtensionAmount = $dom->createElement('cbc:LineExtensionAmount', number_format($item->unit_price * $item->quantity, 2, '.', ''));
            $lineExtensionAmount->setAttribute('currencyID', 'SGD');
            $line->appendChild($lineExtensionAmount);

            $lineTaxTotal = $dom->createElement('cac:TaxTotal');
            $itemTaxAmount = $dom->createElement('cbc:TaxAmount', number_format($item->unit_price * $item->quantity * 0.09, 2, '.', ''));
            $itemTaxAmount->setAttribute('currencyID', 'SGD');
            $lineTaxTotal->appendChild($itemTaxAmount);
            // ... item tax details
            
            $itemNode = $dom->createElement('cac:Item');
            $this->addCbc($dom, $itemNode, 'Name', $item->product ? $item->product->name : 'Unknown Item');
            
            $classifiedTaxCategory = $dom->createElement('cac:ClassifiedTaxCategory');
            $this->addCbc($dom, $classifiedTaxCategory, 'ID', 'S');
            $this->addCbc($dom, $classifiedTaxCategory, 'Percent', '9.00');
            $itemTaxScheme = $dom->createElement('cac:TaxScheme');
            $this->addCbc($dom, $itemTaxScheme, 'ID', 'GST');
            $classifiedTaxCategory->appendChild($itemTaxScheme);
            $itemNode->appendChild($classifiedTaxCategory);
            
            $line->appendChild($itemNode);

            $price = $dom->createElement('cac:Price');
            $priceAmount = $dom->createElement('cbc:PriceAmount', number_format($item->unit_price, 4, '.', '')); // 4 decimal precision for unit price
            $priceAmount->setAttribute('currencyID', 'SGD');
            $price->appendChild($priceAmount);
            $line->appendChild($price);

            $invoice->appendChild($line);
        }

        return $dom->saveXML();
    }

    /**
     * Helper to add a Common Basic Component (cbc)
     */
    private function addCbc(DOMDocument $dom, \DOMElement $parent, string $name, string $value): void
    {
        $element = $dom->createElement("cbc:{$name}", htmlspecialchars($value));
        $parent->appendChild($element);
    }
}
