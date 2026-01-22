'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Printer, Mail, MapPin } from 'lucide-react';
import { RetroButton } from '@/components/ui/retro-button';
import { Order, OrderStatus } from '@/types/api';
import { cn } from '@/lib/utils';

// Mock Order Details (Expanded version of list item)
const MOCK_ORDER_DETAIL: Order = {
  id: '1',
  invoice_number: 'MBC-20260122-0001',
  customer_name: 'Sarah Tan',
  customer_email: 'sarah.tan@example.com',
  customer_phone: '+65 9123 4567',
  location_id: 'loc_1',
  pickup_at: '2026-01-22T10:30:00Z',
  status: 'completed',
  subtotal: 12.50,
  gst: 1.13,
  total: 13.63,
  payment_method: 'paynow',
  payment_status: 'paid',
  notes: 'Less sugar for Kopi. Please separate the kaya toast.',
  user_id: 'user_1',
  created_at: '2026-01-22T10:00:00Z',
  updated_at: '2026-01-22T10:30:00Z',
  deleted_at: null,
  location: {
    id: 'loc_1',
    name: 'Tiong Bahru Flagship',
    address_line1: '55 Tiong Bahru Road',
    address_line2: '#01-55',
    city: 'Singapore',
    postal_code: '160055',
    country: 'Singapore',
    phone: '+65 6222 3333',
    email: 'hello@morningbrew.sg',
    operating_hours: {
      mon: { open: '07:00', close: '20:00', is_closed: false },
      tue: { open: '07:00', close: '20:00', is_closed: false },
      wed: { open: '07:00', close: '20:00', is_closed: false },
      thu: { open: '07:00', close: '20:00', is_closed: false },
      fri: { open: '07:00', close: '20:00', is_closed: false },
      sat: { open: '07:00', close: '20:00', is_closed: false },
      sun: { open: '07:00', close: '20:00', is_closed: false },
    },
    features: ['wifi', 'outdoor_seating'],
    is_active: true,
    created_at: '',
    updated_at: '',
    deleted_at: null,
  },
  items: [
    {
      id: 'item_1',
      order_id: '1',
      product_id: 'prod_1',
      unit_price: 3.50,
      quantity: 2,
      subtotal: 7.00,
      unit_name: 'Cup',
      notes: 'Less sugar',
      created_at: '',
      updated_at: '',
      deleted_at: null,
      product: {
        id: 'prod_1',
        name: 'Traditional Kopi',
        description: 'Nanyang style coffee',
        price: 3.50,
        stock_quantity: 100,
        category_id: 'cat_1',
        is_active: true,
        image_url: null,
        calories: null,
        created_at: '',
        updated_at: '',
        deleted_at: null,
      }
    },
    {
      id: 'item_2',
      order_id: '1',
      product_id: 'prod_2',
      unit_price: 5.50,
      quantity: 1,
      subtotal: 5.50,
      unit_name: 'Set',
      notes: null,
      created_at: '',
      updated_at: '',
      deleted_at: null,
      product: {
        id: 'prod_2',
        name: 'Kaya Toast Set',
        description: 'Toast with kaya and butter',
        price: 5.50,
        stock_quantity: 50,
        category_id: 'cat_2',
        is_active: true,
        image_url: null,
        calories: null,
        created_at: '',
        updated_at: '',
        deleted_at: null,
      }
    }
  ]
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-coral-pop/20 text-coral-pop border-coral-pop/30',
  confirmed: 'bg-sunrise-amber/20 text-sunrise-amber border-sunrise-amber/30',
  preparing: 'bg-sunrise-amber/20 text-sunrise-amber border-sunrise-amber/30',
  ready: 'bg-sage-fresh/20 text-sage-fresh border-sage-fresh/30',
  completed: 'bg-sage-fresh/20 text-sage-fresh border-sage-fresh/30',
  cancelled: 'bg-mocha-medium/20 text-mocha-medium border-mocha-medium/30',
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, fetch data using params.id
  const order = MOCK_ORDER_DETAIL;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 border border-espresso-dark text-espresso-dark hover:bg-espresso-dark hover:text-cream-white transition-colors rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-espresso-dark">{order.invoice_number}</h1>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wide",
                statusColors[order.status]
              )}>
                {order.status}
              </span>
            </div>
            <p className="font-mono text-xs text-mocha-medium mt-1">
              Placed on {new Date(order.created_at).toLocaleString('en-SG', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-espresso-dark text-espresso-dark font-mono text-xs uppercase tracking-wider hover:bg-black/5 transition-colors">
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-espresso-dark text-cream-white font-mono text-xs uppercase tracking-wider hover:bg-mocha-medium transition-colors shadow-button">
            <FileText className="w-4 h-4" />
            InvoiceNow XML
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-cream-white border-2 border-espresso-dark shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
            <div className="border-b-2 border-espresso-dark p-4 bg-vintage-paper">
              <h2 className="font-display text-lg font-bold text-espresso-dark">Order Items</h2>
            </div>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Price</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="block font-bold text-espresso-dark">{item.product?.name}</span>
                      {item.notes && (
                        <span className="block text-xs text-mocha-medium italic mt-1">Note: {item.notes}</span>
                      )}
                    </td>
                    <td className="text-right">${item.unit_price.toFixed(2)}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="numeric font-bold">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Financials */}
            <div className="p-6 bg-vintage-paper/50 border-t border-dashed border-mocha-medium/30">
              <div className="flex justify-end">
                <div className="w-64 space-y-2 font-mono text-sm">
                  <div className="flex justify-between text-mocha-medium">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-mocha-medium">
                    <span>GST (9%)</span>
                    <span>${order.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-espresso-dark border-t-2 border-double border-espresso-dark pt-2 mt-2">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-honey-light/20 border-2 border-dashed border-cinnamon-glow p-4 rounded-lg">
              <h3 className="font-bold text-cinnamon-glow text-sm uppercase tracking-wide mb-2">Customer Notes</h3>
              <p className="text-espresso-dark italic">"{order.notes}"</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-cream-white border-2 border-espresso-dark p-6 shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
            <h3 className="font-mono text-xs text-mocha-medium uppercase tracking-wider mb-4 pb-2 border-b border-mocha-medium/20">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-fresh text-cream-white flex items-center justify-center font-bold">
                  {order.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-espresso-dark">{order.customer_name}</p>
                  <div className="flex items-center gap-2 text-sm text-mocha-medium mt-1">
                    <Mail className="w-3 h-3" />
                    <a href={`mailto:${order.customer_email}`} className="hover:text-espresso-dark hover:underline">{order.customer_email}</a>
                  </div>
                </div>
              </div>
              <div className="text-sm text-mocha-medium pl-11">
                {order.customer_phone}
              </div>
            </div>
          </div>

          {/* Pickup Info */}
          <div className="bg-cream-white border-2 border-espresso-dark p-6 shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
            <h3 className="font-mono text-xs text-mocha-medium uppercase tracking-wider mb-4 pb-2 border-b border-mocha-medium/20">Pickup Details</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-mocha-medium block mb-1">Location</span>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-warm mt-0.5" />
                  <p className="font-medium text-espresso-dark text-sm">
                    {order.location?.name}<br/>
                    <span className="font-normal text-mocha-medium text-xs">{order.location?.address_line1}</span>
                  </p>
                </div>
              </div>
              <div>
                <span className="text-xs text-mocha-medium block mb-1">Scheduled Time</span>
                <p className="font-mono font-bold text-espresso-dark">
                  {new Date(order.pickup_at).toLocaleString('en-SG', {
                    weekday: 'short',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-cream-white border-2 border-espresso-dark p-6 shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
            <h3 className="font-mono text-xs text-mocha-medium uppercase tracking-wider mb-4 pb-2 border-b border-mocha-medium/20">Payment</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-mocha-medium">Method</span>
              <span className="font-bold text-espresso-dark uppercase text-sm">{order.payment_method}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-mocha-medium">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-sage-fresh/20 text-sage-fresh border border-sage-fresh/30 uppercase">
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
