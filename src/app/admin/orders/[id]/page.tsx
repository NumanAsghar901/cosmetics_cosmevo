'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';
import { ArrowLeft, User, MapPin, Package, CreditCard, Check, MailQuestion } from 'lucide-react';
import { getLocalReadOrderIds, isOrderRead, markOrderAsRead, markOrderAsUnread } from '@/lib/ordersStorage';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReadState, setIsReadState] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (data) {
          setOrder(data as Order);
          // Automatically mark this order as read when viewed
          const orderIdStr = String(id);
          markOrderAsRead(orderIdStr);
          setIsReadState(true);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleToggleRead = async () => {
    if (!id) return;
    const orderIdStr = String(id);
    if (isReadState) {
      await markOrderAsUnread(orderIdStr);
      setIsReadState(false);
    } else {
      await markOrderAsRead(orderIdStr);
      setIsReadState(true);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          newStatus: newStatus,
        }),
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        setOrder({ ...order, status: newStatus as any });
      } else {
        throw new Error(result.error || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update order status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12 text-ink/60">Order not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-cream rounded-full transition-colors text-ink/70">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink flex flex-wrap items-center gap-2 sm:gap-3">
              Order #{order.reference}
              <span className={`px-2.5 py-1 text-xs rounded-full font-semibold capitalize tracking-wide
                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}
              >
                {order.status || 'pending'}
              </span>
              {isReadState ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={12} className="text-emerald-600" />
                  Read
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  Unread
                </span>
              )}
            </h1>
            <p className="text-ink/60 text-sm mt-1">
              Placed on {new Date(order.created_at || '').toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        
        {/* Actions & Status Update */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleRead}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border flex items-center gap-1.5 ${
              isReadState
                ? 'bg-white text-ink/70 hover:bg-rose-50 hover:text-rose-700 border-border-subtle'
                : 'bg-plum text-white hover:bg-plum/90 border-transparent'
            }`}
            title={isReadState ? 'Mark order as unread to review later' : 'Mark order as read'}
          >
            {isReadState ? 'Mark as Unread' : 'Mark as Read'}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-ink hidden sm:inline">Status:</label>
            <select
              value={order.status || 'pending'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
              className="px-3 sm:px-4 py-2 border border-border-subtle rounded-lg bg-white focus:ring-2 focus:ring-plum/20 focus:border-plum text-sm font-medium capitalize disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
              <Package size={20} className="text-plum" />
              <h2 className="text-lg font-semibold text-ink">Order Items</h2>
            </div>
            <div className="p-6">
              <table className="w-full text-left text-sm">
                <thead className="text-ink/50 border-b border-border-subtle">
                  <tr>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-center">Qty</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 font-medium text-ink">{item.product_name}</td>
                      <td className="py-4 text-center">{item.qty}</td>
                      <td className="py-4 text-right">Rs. {item.price.toLocaleString()}</td>
                      <td className="py-4 text-right font-semibold">Rs. {(item.price * item.qty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-6 border-t border-border-subtle pt-4 space-y-3">
                <div className="flex justify-between text-sm text-ink/70">
                  <span>Subtotal</span>
                  <span>Rs. {order.subtotal.toLocaleString()}</span>
                </div>
                {Boolean(order.discount_amount && order.discount_amount > 0) && (
                  <div className="flex justify-between text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg font-medium">
                    <span>Coupon Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                    <span>-Rs. {order.discount_amount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-ink/70">
                  <span>Delivery Fee {order.province ? `(${order.province})` : ''}</span>
                  <span className="font-medium">
                    {order.shipping_fee !== undefined && order.shipping_fee !== null
                      ? order.shipping_fee > 0
                        ? `Rs. ${order.shipping_fee.toLocaleString()}`
                        : 'Free'
                      : order.total > order.subtotal
                      ? `Rs. ${(order.total - order.subtotal).toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-ink pt-2 border-t border-border-subtle">
                  <span>Total</span>
                  <span className="text-plum">Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm">
              <h3 className="font-semibold text-ink mb-2">Customer Notes</h3>
              <p className="text-ink/70 text-sm whitespace-pre-wrap bg-warm-white p-4 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Customer Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
              <User size={20} className="text-plum" />
              <h2 className="text-lg font-semibold text-ink">Customer</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink">{order.customer_name}</p>
                {order.customer_email && (
                  <p className="text-sm text-ink/60">{order.customer_email}</p>
                )}
                <p className="text-sm text-ink/60">{order.customer_phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
              <MapPin size={20} className="text-plum" />
              <h2 className="text-lg font-semibold text-ink">Delivery Address</h2>
            </div>
            <div className="p-6 space-y-2">
              <p className="text-sm text-ink/70 leading-relaxed">
                {order.customer_address}
              </p>
              {order.province && (
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium">Province:</span>
                  <span className="font-bold text-ink px-2 py-0.5 rounded bg-cream border border-border-subtle">
                    {order.province}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
              <CreditCard size={20} className="text-plum" />
              <h2 className="text-lg font-semibold text-ink">Payment Info</h2>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-ink capitalize">
                {order.payment_method === 'bank' ? 'Bank Transfer' : order.payment_method}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
