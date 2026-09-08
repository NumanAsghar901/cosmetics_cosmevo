'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Coupon } from '@/lib/types';
import { Plus, Edit2, Trash2, TicketPercent, Check, X, AlertCircle } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbTableMissing, setDbTableMissing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '',
    code: '',
    discount_percent: 10,
    is_active: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          setDbTableMissing(true);
          // Show default starter coupons
          setCoupons([
            { id: '1', code: 'WELCOME10', discount_percent: 10, is_active: true, created_at: new Date().toISOString() },
            { id: '2', code: 'COSMEVO15', discount_percent: 15, is_active: true, created_at: new Date().toISOString() },
            { id: '3', code: 'FLAT20', discount_percent: 20, is_active: true, created_at: new Date().toISOString() },
          ]);
        }
      } else if (data) {
        setDbTableMissing(false);
        setCoupons(data as Coupon[]);
      }
    } catch (err) {
      console.error('Fetch coupons unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const openCreateModal = () => {
    setForm({
      id: '',
      code: '',
      discount_percent: 10,
      is_active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setForm({
      id: coupon.id || '',
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      is_active: coupon.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = form.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required.');
      return;
    }

    const discountNum = Number(form.discount_percent);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      setFormError('Discount percentage must be between 1% and 100%.');
      return;
    }

    setIsSaving(true);
    try {
      if (form.id) {
        // Update
        const { error } = await supabase
          .from('coupons')
          .update({
            code: cleanCode,
            discount_percent: discountNum,
            is_active: form.is_active,
          })
          .eq('id', form.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('coupons')
          .insert([
            {
              code: cleanCode,
              discount_percent: discountNum,
              is_active: form.is_active,
            },
          ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error('Save coupon error:', err);
      setFormError(err.message || 'Failed to save coupon. Please ensure the coupons table exists in Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    if (!coupon.id) return;
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      fetchCoupons();
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    }
  };

  const handleDeleteCoupon = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      alert('Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2.5">
            <TicketPercent className="text-plum" size={26} />
            Coupon Codes
          </h1>
          <p className="text-ink/60 mt-1 text-sm">
            Create and manage promotional discount coupons for checkout.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-soft text-sm"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {dbTableMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-amber-900">
          <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Database Setup Notice</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              The <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-950 font-bold">coupons</code> table has not been created in Supabase yet.
              Please run the query in <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-950 font-bold">supabase_coupons_setup.sql</code> in your Supabase SQL Editor.
              In the meantime, starter promo codes (<span className="font-mono font-bold">WELCOME10</span>, <span className="font-mono font-bold">COSMEVO15</span>, <span className="font-mono font-bold">FLAT20</span>) are active and functioning on checkout!
            </p>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-white/50 text-ink/70 border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-semibold">Coupon Code</th>
                <th className="px-6 py-4 font-semibold">Discount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink/50">
                    Loading coupons…
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink/50">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-plum">
                        <TicketPercent size={24} />
                      </div>
                      <p className="font-medium text-ink">No coupons created yet</p>
                      <p className="text-xs text-ink/60 max-w-sm">
                        Create promotional codes (e.g. WELCOME10 for 10% off) that customers can apply during checkout.
                      </p>
                      <button
                        onClick={openCreateModal}
                        className="btn btn-primary text-xs px-4 py-2 mt-2"
                      >
                        Add First Coupon
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-warm-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-plum/10 text-plum font-mono font-bold text-sm tracking-wider border border-plum/20">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-ink text-base">
                        {coupon.discount_percent}%
                      </span>{' '}
                      <span className="text-xs text-text-secondary">Off Cart Subtotal</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            coupon.is_active ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        />
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink/60">
                      {coupon.created_at
                        ? new Date(coupon.created_at).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 hover:bg-cream text-ink/70 hover:text-plum rounded-lg transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-2 hover:bg-red-50 text-ink/70 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">
                {form.id ? 'Edit Coupon Code' : 'Create New Coupon'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-cream rounded-lg text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 border border-red-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Coupon Code <span className="text-plum">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10, EID20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-plum"
                />
                <span className="text-[11px] text-text-secondary mt-1 block">
                  Customer will enter this code at checkout.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Discount Percentage (%) <span className="text-plum">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    step={1}
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum pr-10"
                  />
                  <span className="absolute right-4 top-2.5 font-bold text-ink/40 text-sm">%</span>
                </div>
                <span className="text-[11px] text-text-secondary mt-1 block">
                  Example: 10 gives a 10% discount on the cart subtotal.
                </span>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded accent-plum"
                  />
                  <span className="text-sm font-semibold text-ink">Coupon is Active</span>
                </label>
                <span className="text-[11px] text-text-secondary ml-7 block mt-0.5">
                  If inactive, customers cannot redeem this coupon code.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-subtle text-ink/70 hover:bg-cream text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft"
                >
                  {isSaving ? 'Saving…' : form.id ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
