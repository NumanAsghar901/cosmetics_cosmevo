'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';
import { ArrowLeft, User, MapPin, Package, CreditCard } from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
        if (data) setOrder(data as Order);
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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      
      if (error) throw error;
      setOrder({ ...order, status: newStatus as any });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status.');
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
            <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
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
            </h1>
            <p className="text-ink/60 text-sm mt-1">
              Placed on {new Date(order.created_at || '').toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        
        {/* Status Update Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-ink">Update Status:</label>
          <select
            value={order.status || 'pending'}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
            className="px-4 py-2 border border-border-subtle rounded-lg bg-white focus:ring-2 focus:ring-plum/20 focus:border-plum text-sm font-medium capitalize disabled:opacity-50"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
                <div className="flex justify-between text-sm text-ink/70">
                  <span>Delivery Fee</span>
                  <span>{order.total > order.subtotal ? `Rs. ${(order.total - order.subtotal).toLocaleString()}` : 'Free'}</span>
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
            <div className="p-6">
              <p className="text-sm text-ink/70 leading-relaxed">
                {order.customer_address}
              </p>
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
