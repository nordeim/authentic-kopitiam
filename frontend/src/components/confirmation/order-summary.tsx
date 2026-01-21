'use client'

import * as React from 'react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderSummaryProps {
  items: OrderItem[];
  gstAmount: number;
  totalAmount: number;
  invoiceNumber: string;
  paymentId: string;
  pickupLocation: string;
  pickupTime: string;
  orderDate?: string;
}

export function OrderSummary({
  items,
  gstAmount,
  totalAmount,
  invoiceNumber,
  paymentId,
  pickupLocation,
  pickupTime,
  orderDate,
}: OrderSummaryProps) {
  const subtotal = totalAmount - gstAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
            Order Summary
          </h3>
          <p className="text-sm text-[rgb(107,90,74)]">
            Order placed {orderDate || 'today'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-[rgb(107,90,74)]">Invoice</div>
          <div className="text-xl font-bold font-['Fraunces'] text-[rgb(61,35,23)]">
            #{invoiceNumber}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-[rgb(107,90,74)]">
            <p className="text-lg">No items in order</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-[rgb(255,245,230,0.5)] rounded-lg border border-[rgb(229,215,195)]"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-[rgb(61,35,23)]">
                    {item.name}
                  </h4>
                  <span className="text-xs text-[rgb(107,90,74)]">
                    ({item.quantity}x)
                  </span>
                </div>
                <p className="text-sm text-[rgb(107,90,74)]">
                  S${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-[rgb(61,35,23)]">
                  S${(item.price * item.quantity).toFixed(2)}
                </div>
                <div className="text-xs text-[rgb(107,90,74)]">
                  S${item.price.toFixed(2)} each
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="bg-[rgb(255,245,230)] rounded-lg p-6 border-2 border-[rgb(229,215,195)]">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(107,90,74)]">Subtotal</span>
            <span className="font-medium text-[rgb(61,35,23)]">
              S${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(107,90,74)]">GST (9%)</span>
            <span className="font-medium text-[rgb(61,35,23)]">
              S${gstAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-lg border-t-2 border-[rgb(229,215,195)] pt-3">
            <span className="font-bold text-[rgb(61,35,23)]">Total Payable</span>
            <span className="font-bold font-['Fraunces'] text-[rgb(255,107,74)]">
              S${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-[rgb(107,90,74)]">
            ✓ Payment Confirmed • GST applied at 9%
          </p>
          <p className="text-xs text-[rgb(107,90,74)] mt-1">
            Payment ID: #{paymentId}
          </p>
        </div>
      </div>

      {/* Pickup Details */}
      <div className="bg-[rgb(255,190,79,0.1)] rounded-lg p-4 border border-[rgb(255,190,79)]">
        <h4 className="font-semibold text-[rgb(61,35,23)] mb-3">
          Pickup Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[rgb(107,90,74)]">Location</div>
            <div className="font-medium text-[rgb(61,35,23)]">
              {pickupLocation}
            </div>
          </div>
          <div>
            <div className="text-[rgb(107,90,74)]">Pickup Time</div>
            <div className="font-medium text-[rgb(61,35,23)]">
              {pickupTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
