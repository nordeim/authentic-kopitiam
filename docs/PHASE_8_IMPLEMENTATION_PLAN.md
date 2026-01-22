# Phase 8: Operations & InvoiceNow Implementation Plan

**Objective:** Build a "Retro-Utilitarian" Admin Dashboard for order management and implement Singapore-compliant InvoiceNow (PEPPOL UBL 2.1) XML generation.

**Philosophy:**
*   **Frontend:** The "Manager's Office" - utilitarian but aesthetically consistent with the Kopitiam brand. Uses Next.js `(admin)` route group.
*   **Backend:** Strict adherence to SG Peppol BIS Billing 3.0 standards for XML generation.

---

## 1. Architecture & Design

### 1.1 Admin Frontend (`/admin`)
*   **Layout:** Sidebar navigation (left), Top bar (breadcrumbs/user), Main content area.
*   **Aesthetic:** "Ledger Book" style.
    *   Background: `var(--color-vintage-paper)`
    *   Typography: `Courier Prime` or similar monospace for data tables (if available, otherwise `DM Sans`).
    *   Tables: High contrast, clearly defined borders, mimicking physical ledger lines.
*   **Tech Stack:** Next.js 15, TanStack Table (headless), Tailwind v4.

### 1.2 InvoiceNow Backend Service
*   **Standard:** SG Peppol BIS Billing 3.0 (UBL 2.1).
*   **Implementation:** Native PHP `DOMDocument` for precise control over XML structure and namespaces.
*   **Validation:** XSD Schema validation (if schemas can be sourced) or strict unit testing against example structures.

---

## 2. Implementation Checklist

### Phase 8A: Admin Foundation (Frontend)
- [ ] **8A-1**: Create `frontend/src/app/(admin)/layout.tsx` (Admin layout shell).
- [ ] **8A-2**: Create `frontend/src/components/admin/sidebar.tsx` (Navigation: Dashboard, Orders, Inventory, Settings).
- [ ] **8A-3**: Create `frontend/src/components/admin/header.tsx` (Breadcrumbs, Logout).
- [ ] **8A-4**: Define "Ledger" table styles in `frontend/src/styles/admin.css` (or extend `tokens.css`).

### Phase 8B: Order Management (Frontend)
- [ ] **8B-1**: Create `frontend/src/app/(admin)/orders/page.tsx` (Order list).
- [ ] **8B-2**: Implement `frontend/src/components/admin/orders-table.tsx` using TanStack Table.
    *   Columns: Invoice #, Date, Customer, Total (DECIMAL), Status, Actions.
    *   Actions: View Details, Change Status.
- [ ] **8B-3**: Create `frontend/src/app/(admin)/orders/[id]/page.tsx` (Order details view).
    *   Display line items, GST breakdown, customer details.
    *   "Generate InvoiceNow XML" button.

### Phase 8C: InvoiceNow Service (Backend)
- [ ] **8C-1**: Create `backend/app/Services/InvoiceService.php`.
- [ ] **8C-2**: Implement `generateUblXml(Order $order)` method.
    *   Map Order model to UBL 2.1 structure.
    *   Handle GST specific tax categories (Standard Rated 'S', etc.).
    *   Ensure 4-decimal precision in XML amounts.
- [ ] **8C-3**: Create `backend/app/Http/Controllers/Api/InvoiceController.php`.
    *   Endpoint: `GET /api/v1/orders/{id}/invoice/xml` (Download XML).
- [ ] **8C-4**: Register routes in `routes/api.php` (protected by auth).

### Phase 8D: Testing & Validation
- [ ] **8D-1**: Unit test `InvoiceServiceTest.php` - verify XML structure against SG Peppol examples.
- [ ] **8D-2**: E2E Test - Admin can login, view orders, and download invoice XML.
- [ ] **8D-3**: Visual Regression - Verify "Ledger" aesthetic aligns with brand.

---

## 3. Technical Specifications

### InvoiceNow XML Structure (Key Elements)
```xml
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" ...>
  <CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0:singapore:1.0.0</CustomizationID>
  <ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</ProfileID>
  <ID>MBC-20260122-00001</ID>
  <IssueDate>2026-01-22</IssueDate>
  <InvoiceTypeCode>380</InvoiceTypeCode>
  <DocumentCurrencyCode>SGD</DocumentCurrencyCode>
  <!-- Supplier (Morning Brew) -->
  <AccountingSupplierParty>...</AccountingSupplierParty>
  <!-- Customer -->
  <AccountingCustomerParty>...</AccountingCustomerParty>
  <!-- Tax Total (GST) -->
  <TaxTotal>
    <TaxAmount currencyID="SGD">1.3500</TaxAmount>
    <TaxSubtotal>
      <TaxableAmount currencyID="SGD">15.0000</TaxableAmount>
      <TaxAmount currencyID="SGD">1.3500</TaxAmount>
      <TaxCategory>
        <ID>S</ID>
        <Percent>9.00</Percent>
        <TaxScheme><ID>GST</ID></TaxScheme>
      </TaxCategory>
    </TaxSubtotal>
  </TaxTotal>
  <!-- Legal Monetary Total -->
  <LegalMonetaryTotal>
    <LineExtensionAmount currencyID="SGD">15.0000</LineExtensionAmount>
    <TaxExclusiveAmount currencyID="SGD">15.0000</TaxExclusiveAmount>
    <TaxInclusiveAmount currencyID="SGD">16.3500</TaxInclusiveAmount>
    <PayableAmount currencyID="SGD">16.3500</PayableAmount>
  </LegalMonetaryTotal>
</Invoice>
```

### Admin UI "Ledger" Theme
- **Font**: Monospace for numbers (`font-mono`).
- **Borders**: Double lines (`border-double`) for totals.
- **Colors**:
    - Status Pending: `text-terracotta-warm`
    - Status Completed: `text-sage-fresh`
    - Header BG: `bg-espresso-dark` text `text-cream-white`

---

**Next Step:** Execute Phase 8A (Admin Foundation).
