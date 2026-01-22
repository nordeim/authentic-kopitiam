'use client';

import Link from 'next/link';
import { Eye, FileText, MoreHorizontal } from 'lucide-react';
import { Order, OrderStatus } from '@/types/api';
import { cn } from '@/lib/utils';

// Mock Data for Visualization
const MOCK_ORDERS: Order[] = [
  {
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
    notes: 'Less sugar for Kopi',
    user_id: 'user_1',
    created_at: '2026-01-22T10:00:00Z',
    updated_at: '2026-01-22T10:30:00Z',
    deleted_at: null,
  },
  {
    id: '2',
    invoice_number: 'MBC-20260122-0002',
    customer_name: 'James Lee',
    customer_email: 'james.lee@example.com',
    customer_phone: '+65 9876 5432',
    location_id: 'loc_1',
    pickup_at: '2026-01-22T11:00:00Z',
    status: 'preparing',
    subtotal: 8.50,
    gst: 0.77,
    total: 9.27,
    payment_method: 'card',
    payment_status: 'paid',
    notes: null,
    user_id: null,
    created_at: '2026-01-22T10:45:00Z',
    updated_at: '2026-01-22T10:46:00Z',
    deleted_at: null,
  },
  {
    id: '3',
    invoice_number: 'MBC-20260122-0003',
    customer_name: 'Ahmad bin Ali',
    customer_email: 'ahmad.ali@example.com',
    customer_phone: '+65 8123 4567',
    location_id: 'loc_2',
    pickup_at: '2026-01-22T11:15:00Z',
    status: 'pending',
    subtotal: 22.00,
    gst: 1.98,
    total: 23.98,
    payment_method: 'paynow',
    payment_status: 'pending',
    notes: 'Separate packaging for kaya toast',
    user_id: 'user_3',
    created_at: '2026-01-22T11:05:00Z',
    updated_at: '2026-01-22T11:05:00Z',
    deleted_at: null,
  },
  {
    id: '4',
    invoice_number: 'MBC-20260122-0004',
    customer_name: 'Michelle Goh',
    customer_email: 'michelle.goh@example.com',
    customer_phone: '+65 9000 1111',
    location_id: 'loc_1',
    pickup_at: '2026-01-22T11:30:00Z',
    status: 'cancelled',
    subtotal: 15.00,
    gst: 1.35,
    total: 16.35,
    payment_method: 'card',
    payment_status: 'refunded',
    notes: null,
    user_id: null,
    created_at: '2026-01-22T09:00:00Z',
    updated_at: '2026-01-22T09:15:00Z',
    deleted_at: null,
  },
];

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-coral-pop/20 text-coral-pop border-coral-pop/30',
  confirmed: 'bg-sunrise-amber/20 text-sunrise-amber border-sunrise-amber/30',
  preparing: 'bg-sunrise-amber/20 text-sunrise-amber border-sunrise-amber/30',
  ready: 'bg-sage-fresh/20 text-sage-fresh border-sage-fresh/30',
  completed: 'bg-sage-fresh/20 text-sage-fresh border-sage-fresh/30',
  cancelled: 'bg-mocha-medium/20 text-mocha-medium border-mocha-medium/30',
};

export function OrdersTable() {
  return (
    <div className="overflow-x-auto">
      <table className="ledger-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Date & Time</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Status</th>
            <th className="text-right">Total</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {MOCK_ORDERS.map((order) => (
            <tr key={order.id}>
              <td className="font-bold text-espresso-dark">
                {order.invoice_number}
              </td>
              <td className="text-mocha-medium">
                {new Date(order.created_at).toLocaleString('en-SG', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td>
                <div className="flex flex-col">
                  <span className="font-medium text-espresso-dark">{order.customer_name}</span>
                  <span className="text-xs text-mocha-medium">{order.customer_email}</span>
                </div>
              </td>
              <td>
                <span className="uppercase text-xs tracking-wider font-bold text-mocha-medium">
                  {order.payment_method}
                </span>
              </td>
              <td>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wide",
                  statusColors[order.status]
                )}>
                  {order.status}
                </span>
              </td>
              <td className="numeric font-bold text-espresso-dark">
                ${order.total.toFixed(2)}
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link 
                    href={`/admin/orders/${order.id}`}
                    className="p-1.5 text-mocha-medium hover:text-espresso-dark hover:bg-black/5 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button 
                    className="p-1.5 text-mocha-medium hover:text-espresso-dark hover:bg-black/5 rounded transition-colors"
                    title="Generate Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1.5 text-mocha-medium hover:text-espresso-dark hover:bg-black/5 rounded transition-colors"
                    title="More Actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Mock */}
      <div className="p-4 border-t border-mocha-medium/20 flex justify-between items-center bg-vintage-paper">
        <p className="text-xs font-mono text-mocha-medium">Showing 1-4 of 24 records</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs font-mono border border-mocha-medium/30 text-mocha-medium disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 text-xs font-mono border border-mocha-medium/30 text-espresso-dark hover:bg-black/5">Next</button>
        </div>
      </div>
    </div>
  );
}
