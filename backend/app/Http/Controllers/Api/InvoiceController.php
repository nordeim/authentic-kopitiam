<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Generate and download InvoiceNow (UBL 2.1) XML for an order.
     *
     * @param string $id
     * @return Response
     */
    public function downloadXml(string $id)
    {
        $order = Order::with(['items.product'])->findOrFail($id);

        // Security check: Ideally, ensure the user has permission to view this invoice
        // For now, assuming auth middleware handles basic access, or use VerifyOrderOwnership if needed

        $xmlContent = $this->invoiceService->generateUblXml($order);

        return response($xmlContent, 200, [
            'Content-Type' => 'application\/xml',
            'Content-Disposition' => "attachment; filename=\"invoice_{$order->invoice_number}.xml\"",
        ]);
    }
}
