'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, ShoppingCart, DollarSign, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Order, Product } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orders) {
          const totalRevenue = orders
            .filter(o => o.status === 'delivered' || o.status === 'confirmed')
            .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

          setStats({
            revenue: totalRevenue,
            orders: orders.length,
            products: productsCount || 0,
          });

          setRecentOrders(orders.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm flex items-start justify-between">
      <div>
        <p className="text-ink/60 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-ink">
          {isLoading ? '-' : value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard Overview</h1>
        <p className="text-ink/60 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue (Confirmed/Delivered)"
          value={`Rs. ${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={ShoppingCart}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={Package}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
          <h2 className="text-lg font-semibold text-ink">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-plum hover:text-ink flex items-center gap-1 transition-colors"
          >
            View All <ArrowUpRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-white/50 text-ink/70">
              <tr>
                <th className="px-6 py-3 font-medium">Order Ref</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink/50">
                    Loading recent orders...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink/50">
                    No orders received yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-warm-white/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink">#{order.reference}</td>
                    <td className="px-6 py-4">{order.customer_name}</td>
                    <td className="px-6 py-4">
                      {new Date(order.created_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      Rs. {order.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
