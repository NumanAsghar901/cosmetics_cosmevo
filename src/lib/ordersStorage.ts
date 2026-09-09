import { Order } from './types';

const STORAGE_KEY = 'cosmevo_read_order_ids';

export function getLocalReadOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse read order IDs from localStorage:', e);
    return [];
  }
}

export function saveLocalReadOrderIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
    // Dispatch storage event so other components / tabs know
    window.dispatchEvent(new Event('cosmevo_orders_read_updated'));
  } catch (e) {
    console.warn('Failed to save read order IDs to localStorage:', e);
  }
}

export function isOrderRead(order: Order, localReadIds: string[]): boolean {
  if (order.is_read === true) return true;
  if (!order.id) return false;
  return localReadIds.includes(order.id);
}

export async function markOrderAsRead(orderId: string): Promise<void> {
  if (!orderId) return;

  // 1. Update localStorage immediately for fast client UI response
  const current = getLocalReadOrderIds();
  if (!current.includes(orderId)) {
    saveLocalReadOrderIds([...current, orderId]);
  }

  // 2. Call API to persist in Supabase
  try {
    await fetch('/api/orders/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, isRead: true }),
    });
  } catch (e) {
    console.warn('Could not sync read status with server:', e);
  }
}

export async function markOrderAsUnread(orderId: string): Promise<void> {
  if (!orderId) return;

  // 1. Remove from localStorage
  const current = getLocalReadOrderIds();
  saveLocalReadOrderIds(current.filter((id) => id !== orderId));

  // 2. Call API to update database
  try {
    await fetch('/api/orders/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, isRead: false }),
    });
  } catch (e) {
    console.warn('Could not sync unread status with server:', e);
  }
}

export async function markAllOrdersAsRead(orderIds: string[]): Promise<void> {
  if (!orderIds || orderIds.length === 0) return;

  const current = getLocalReadOrderIds();
  saveLocalReadOrderIds([...current, ...orderIds]);

  try {
    await fetch('/api/orders/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds, isRead: true }),
    });
  } catch (e) {
    console.warn('Could not sync bulk read status with server:', e);
  }
}
