'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/lib/types';
import { 
  Eye, Clock, Check, CheckCircle2, Search, RefreshCw, 
  Inbox, MailCheck, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { 
  getLocalReadOrderIds, 
  isOrderRead, 
  markOrderAsRead, 
  markOrderAsUnread, 
  markAllOrdersAsRead 
} from '@/lib/ordersStorage';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unread' | 'read' | 'all'>('unread');
  const [searchQuery, setSearchQuery] = useState('');
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setLocalReadIds(getLocalReadOrderIds());
    fetchOrders();

    const handleStorageUpdate = () => {
      setLocalReadIds(getLocalReadOrderIds());
    };

    window.addEventListener('cosmevo_orders_read_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('cosmevo_orders_read_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
      } else if (data) {
        setOrders(data as Order[]);
      }
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate unread vs read
  const unreadOrders = useMemo(() => {
    return orders.filter((o) => !isOrderRead(o, localReadIds));
  }, [orders, localReadIds]);

  const readOrders = useMemo(() => {
    return orders.filter((o) => isOrderRead(o, localReadIds));
  }, [orders, localReadIds]);

  // Filter based on active tab and search query
  const displayedOrders = useMemo(() => {
    let list: Order[] = [];
    if (activeTab === 'unread') {
      list = unreadOrders;
    } else if (activeTab === 'read') {
      list = readOrders;
    } else {
      list = orders;
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((order) => {
      const ref = (order.reference || '').toLowerCase();
      const name = (order.customer_name || '').toLowerCase();
      const phone = (order.customer_phone || '').toLowerCase();
      const email = (order.customer_email || '').toLowerCase();
      const status = (order.status || '').toLowerCase();
      return ref.includes(query) || name.includes(query) || phone.includes(query) || email.includes(query) || status.includes(query);
    });
  }, [activeTab, unreadOrders, readOrders, orders, searchQuery]);

  // Click on View: Marks order as read immediately, then redirects to order details
  const handleViewOrder = async (orderId?: string) => {
    if (!orderId) return;

    // 1. Mark as read locally and in database
    await markOrderAsRead(orderId);
    setLocalReadIds((prev) => Array.from(new Set([...prev, orderId])));

    // 2. Navigate to order details
    router.push(`/admin/orders/${orderId}`);
  };

  // Quick toggle read / unread from table row
  const handleToggleRead = async (orderId?: string, isCurrentRead?: boolean) => {
    if (!orderId) return;
    setIsProcessingAction(true);
    try {
      if (isCurrentRead) {
        await markOrderAsUnread(orderId);
        setLocalReadIds((prev) => prev.filter((id) => id !== orderId));
      } else {
        await markOrderAsRead(orderId);
        setLocalReadIds((prev) => Array.from(new Set([...prev, orderId])));
      }
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Mark all unread as read
  const handleMarkAllUnreadAsRead = async () => {
    if (unreadOrders.length === 0) return;
    const idsToMark = unreadOrders.map((o) => o.id).filter(Boolean) as string[];
    setIsProcessingAction(true);
    try {
      await markAllOrdersAsRead(idsToMark);
      setLocalReadIds((prev) => Array.from(new Set([...prev, ...idsToMark])));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200'; // pending
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Orders Management
          </h1>
          <p className="text-ink/60 text-sm mt-1">
            Review customer orders, monitor payment statuses, and track fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border-subtle text-ink text-sm font-medium hover:bg-warm-white transition-colors shadow-xs"
            title="Refresh orders from database"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-plum' : 'text-ink/70'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {activeTab === 'unread' && unreadOrders.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllUnreadAsRead}
              disabled={isProcessingAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-plum/10 hover:bg-plum/15 text-plum text-sm font-bold transition-colors"
            >
              <CheckCircle2 size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl border border-border-subtle p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-warm-white rounded-xl border border-border-subtle/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'unread'
                ? 'bg-plum text-white shadow-xs'
                : 'text-ink/70 hover:text-ink hover:bg-white/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${activeTab === 'unread' ? 'bg-rose-300 animate-pulse' : 'bg-rose-500'}`} />
              Unread
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black transition-colors ${
                activeTab === 'unread'
                  ? 'bg-white/20 text-white'
                  : unreadOrders.length > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-ink/10 text-ink/60'
              }`}
            >
              {unreadOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('read')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'read'
                ? 'bg-plum text-white shadow-xs'
                : 'text-ink/70 hover:text-ink hover:bg-white/60'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Check size={14} />
              Read
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'read'
                  ? 'bg-white/20 text-white'
                  : 'bg-ink/10 text-ink/60'
              }`}
            >
              {readOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-plum text-white shadow-xs'
                : 'text-ink/70 hover:text-ink hover:bg-white/60'
            }`}
          >
            <span>All Orders</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-ink/10 text-ink/60'
              }`}
            >
              {orders.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ref, customer, phone..."
            className="w-full pl-9 pr-4 py-2 bg-warm-white/70 focus:bg-white border border-border-subtle rounded-xl text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-plum transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40 hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-white/60 text-ink/70 border-b border-border-subtle select-none">
              <tr>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase">Order Ref</th>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase">Customer</th>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase">Date</th>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase">Fulfillment</th>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase">Total</th>
                <th className="px-5 py-4 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ink/50">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-plum border-t-transparent animate-spin" />
                      <p className="text-sm font-medium">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-ink/50">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
                      {activeTab === 'unread' ? (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MailCheck size={24} />
                          </div>
                          <h3 className="text-base font-bold text-ink">All caught up!</h3>
                          <p className="text-xs text-ink/60">
                            There are no unread orders in this view. All incoming customer orders will appear here automatically.
                          </p>
                          {readOrders.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('read')}
                              className="mt-2 text-xs text-plum font-bold hover:underline"
                            >
                              View {readOrders.length} processed orders in Read tab →
                            </button>
                          )}
                        </>
                      ) : activeTab === 'read' ? (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-cream text-ink/60 flex items-center justify-center">
                            <Inbox size={24} />
                          </div>
                          <h3 className="text-base font-bold text-ink">No read orders yet</h3>
                          <p className="text-xs text-ink/60">
                            When you view an order from the unread list, it will move here so you can keep track of what you have reviewed.
                          </p>
                          {unreadOrders.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('unread')}
                              className="mt-2 text-xs text-plum font-bold hover:underline"
                            >
                              Go to Unread Orders ({unreadOrders.length}) →
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-cream text-ink/60 flex items-center justify-center">
                            <Clock size={24} />
                          </div>
                          <h3 className="text-base font-bold text-ink">No orders found</h3>
                          <p className="text-xs text-ink/60">
                            {searchQuery ? 'Try adjusting your search criteria.' : 'No customer orders have been received yet.'}
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => {
                  const isRead = isOrderRead(order, localReadIds);
                  const itemsCount = Array.isArray(order.items) 
                    ? order.items.reduce((acc, i) => acc + (i.qty || 1), 0) 
                    : 1;

                  return (
                    <tr 
                      key={order.id} 
                      className={`transition-colors duration-150 ${
                        !isRead 
                          ? 'bg-rose-500/[0.025] hover:bg-rose-500/[0.05]' 
                          : 'hover:bg-warm-white/40'
                      }`}
                    >
                      {/* Read / Unread Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {!isRead ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                            Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check size={12} className="text-emerald-600" />
                            Read
                          </span>
                        )}
                      </td>

                      {/* Order Reference */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`font-bold font-mono ${!isRead ? 'text-ink text-base' : 'text-ink/80'}`}>
                          #{order.reference}
                        </span>
                        <div className="text-[11px] text-ink/50 mt-0.5">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-5 py-4">
                        <div>
                          <p className={`font-medium ${!isRead ? 'font-bold text-ink' : 'text-ink'}`}>
                            {order.customer_name}
                          </p>
                          <div className="flex flex-col text-xs text-ink/60 mt-0.5">
                            {order.customer_phone && <span>{order.customer_phone}</span>}
                            {order.customer_email && <span className="text-[11px] text-ink/40">{order.customer_email}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-ink/70">
                        {new Date(order.created_at || '').toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-extrabold text-plum text-sm">
                          Rs. {Number(order.total || 0).toLocaleString()}
                        </span>
                        <div className="text-[11px] text-ink/40 uppercase">
                          {order.payment_method || 'COD'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Toggle Read Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleRead(order.id, isRead)}
                            disabled={isProcessingAction}
                            className={`p-2 rounded-lg text-xs font-medium transition-colors border ${
                              !isRead
                                ? 'bg-white text-ink/70 hover:text-emerald-700 hover:bg-emerald-50 border-border-subtle'
                                : 'bg-white text-ink/50 hover:text-rose-700 hover:bg-rose-50 border-border-subtle'
                            }`}
                            title={!isRead ? 'Mark as read' : 'Mark as unread'}
                          >
                            {!isRead ? (
                              <Check size={15} />
                            ) : (
                              <span className="text-[11px] font-bold">Unread</span>
                            )}
                          </button>

                          {/* Primary View Order Button */}
                          <button
                            type="button"
                            onClick={() => handleViewOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-plum text-white hover:bg-plum/90 active:scale-95 transition-all shadow-xs"
                            title="View order details (moves order to Read)"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
