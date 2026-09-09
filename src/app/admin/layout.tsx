'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X, Tags, TicketPercent, Film } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getLocalReadOrderIds } from '@/lib/ordersStorage';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadOrdersCount, setUnreadOrdersCount] = useState<number>(0);

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const localReadIds = getLocalReadOrderIds();
        const { data } = await supabase.from('orders').select('id, is_read');
        if (data) {
          const unread = data.filter((o) => o.is_read !== true && !localReadIds.includes(o.id));
          setUnreadOrdersCount(unread.length);
        }
      } catch (e) {}
    }

    loadUnreadCount();

    const handleUpdate = () => loadUnreadCount();
    window.addEventListener('cosmevo_orders_read_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cosmevo_orders_read_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [pathname]);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
    { name: 'Videos', href: '/admin/videos', icon: Film },
  ];

  return (
    <div className="min-h-screen bg-warm-white flex relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="text-2xl font-extrabold tracking-tight">
            Cosmevo<span className="text-plum">.</span> Admin
          </Link>
          <button 
            className="lg:hidden p-1 text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-plum text-white font-medium' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Orders' && unreadOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-2xs">
                    {unreadOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-0">
        <header className="bg-white border-b border-border-subtle h-16 flex items-center px-4 md:px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-ink hover:bg-cream rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-ink truncate">
              {navItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-cream text-ink flex items-center justify-center font-bold">
               A
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
