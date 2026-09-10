'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Distributor } from '@/lib/types';
import { FALLBACK_DISTRIBUTORS } from '@/lib/distributors';
import { 
  Store, Plus, Edit2, Trash2, Check, X, Search, 
  MapPin, Phone, MessageCircle, ExternalLink, RefreshCw, 
  AlertCircle, Building2, User, Eye, EyeOff
} from 'lucide-react';

export default function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<{
    id: string;
    name: string;
    contact_person: string;
    city: string;
    province: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    area_covered: string;
    display_order: number;
    is_active: boolean;
  }>({
    id: '',
    name: '',
    contact_person: '',
    city: 'Lahore',
    province: 'Punjab',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    area_covered: '',
    display_order: 1,
    is_active: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchDistributors();
  }, []);

  async function fetchDistributors() {
    setIsLoading(true);
    try {
      let customDistributors: Distributor[] = [];
      let deletedIds: string[] = [];
      try {
        customDistributors = JSON.parse(localStorage.getItem('cosmevo_custom_distributors') || '[]');
        deletedIds = JSON.parse(localStorage.getItem('cosmevo_deleted_distributor_ids') || '[]');
      } catch (e) {}

      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Use fallback distributors combined with custom ones, omitting deleted
        const combined = [...customDistributors, ...FALLBACK_DISTRIBUTORS.filter((f) => !deletedIds.includes(f.id))];
        setDistributors(combined);
      } else {
        const existingIds = new Set((data as Distributor[]).map((d) => d.id));
        const extraCustom = customDistributors.filter((c) => !existingIds.has(c.id));
        const combined = [...(data as Distributor[]), ...extraCustom].filter((d) => !deletedIds.includes(d.id));
        setDistributors(combined);
      }
    } catch (err) {
      console.error('Error loading distributors:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // City list for filtering
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    distributors.forEach((d) => {
      if (d.city) cities.add(d.city.trim());
    });
    return Array.from(cities).sort();
  }, [distributors]);

  // Filtered distributors
  const filteredList = useMemo(() => {
    return distributors.filter((d) => {
      const matchCity = selectedCityFilter === 'all' || d.city.toLowerCase() === selectedCityFilter.toLowerCase();
      if (!searchQuery.trim()) return matchCity;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        (d.contact_person && d.contact_person.toLowerCase().includes(q)) ||
        d.phone.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q);

      return matchCity && matchQuery;
    });
  }, [distributors, selectedCityFilter, searchQuery]);

  // Open Create Modal
  const openCreateModal = () => {
    setForm({
      id: '',
      name: '',
      contact_person: '',
      city: 'Lahore',
      province: 'Punjab',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      area_covered: '',
      display_order: distributors.length + 1,
      is_active: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (dist: Distributor) => {
    setForm({
      id: dist.id || '',
      name: dist.name || '',
      contact_person: dist.contact_person || '',
      city: dist.city || '',
      province: dist.province || 'Punjab',
      phone: dist.phone || '',
      whatsapp: dist.whatsapp || '',
      email: dist.email || '',
      address: dist.address || '',
      area_covered: dist.area_covered || '',
      display_order: dist.display_order ?? 1,
      is_active: dist.is_active ?? true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save Distributor (Insert or Update)
  const handleSaveDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const name = form.name.trim();
    const city = form.city.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    if (!name) {
      setModalError('Please enter a distributor business name.');
      return;
    }
    if (!city) {
      setModalError('Please enter a city name.');
      return;
    }
    if (!phone) {
      setModalError('Please enter a contact phone number.');
      return;
    }
    if (!address) {
      setModalError('Please enter the distributor store/office address.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Distributor = {
        id: form.id || `dist-custom-${Date.now()}`,
        name,
        contact_person: form.contact_person.trim() || undefined,
        city,
        province: form.province.trim() || undefined,
        phone,
        whatsapp: form.whatsapp.trim() || phone,
        email: form.email.trim() || undefined,
        address,
        area_covered: form.area_covered.trim() || undefined,
        display_order: Number(form.display_order) || 1,
        is_active: form.is_active,
        created_at: new Date().toISOString(),
      };

      // Try saving to Supabase first
      try {
        if (form.id && !form.id.startsWith('dist-custom-') && !form.id.startsWith('dist-')) {
          const { error } = await supabase
            .from('distributors')
            .update({
              name: payload.name,
              contact_person: payload.contact_person,
              city: payload.city,
              province: payload.province,
              phone: payload.phone,
              whatsapp: payload.whatsapp,
              email: payload.email,
              address: payload.address,
              area_covered: payload.area_covered,
              display_order: payload.display_order,
              is_active: payload.is_active,
            })
            .eq('id', form.id);

          if (error) {
            console.warn('Supabase update returned error:', error.message);
          }
        } else {
          const { data: inserted, error } = await supabase
            .from('distributors')
            .insert([{
              name: payload.name,
              contact_person: payload.contact_person,
              city: payload.city,
              province: payload.province,
              phone: payload.phone,
              whatsapp: payload.whatsapp,
              email: payload.email,
              address: payload.address,
              area_covered: payload.area_covered,
              display_order: payload.display_order,
              is_active: payload.is_active,
            }])
            .select();

          if (!error && inserted && inserted[0]) {
            payload.id = inserted[0].id;
          }
        }
      } catch (dbErr) {
        console.warn('Supabase DB error, syncing to local storage fallback:', dbErr);
      }

      // Sync to localStorage
      try {
        const stored: Distributor[] = JSON.parse(localStorage.getItem('cosmevo_custom_distributors') || '[]');
        const existingIdx = stored.findIndex((d) => d.id === payload.id || (form.id && d.id === form.id));
        if (existingIdx >= 0) {
          stored[existingIdx] = payload;
        } else {
          stored.push(payload);
        }
        localStorage.setItem('cosmevo_custom_distributors', JSON.stringify(stored));
      } catch (e) {}

      setIsModalOpen(false);
      fetchDistributors();
    } catch (err: any) {
      console.error('Error saving distributor:', err);
      setModalError(err.message || 'Failed to save distributor.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle Active Status
  const handleToggleActive = async (dist: Distributor) => {
    const newActiveState = !dist.is_active;

    // Update in Supabase
    try {
      if (dist.id && !dist.id.startsWith('dist-custom-') && !dist.id.startsWith('dist-')) {
        await supabase
          .from('distributors')
          .update({ is_active: newActiveState })
          .eq('id', dist.id);
      }
    } catch (e) {}

    // Update local state and storage
    setDistributors((prev) =>
      prev.map((d) => (d.id === dist.id ? { ...d, is_active: newActiveState } : d))
    );

    try {
      const stored: Distributor[] = JSON.parse(localStorage.getItem('cosmevo_custom_distributors') || '[]');
      const idx = stored.findIndex((d) => d.id === dist.id);
      if (idx >= 0) {
        stored[idx].is_active = newActiveState;
        localStorage.setItem('cosmevo_custom_distributors', JSON.stringify(stored));
      } else {
        stored.push({ ...dist, is_active: newActiveState });
        localStorage.setItem('cosmevo_custom_distributors', JSON.stringify(stored));
      }
    } catch (e) {}
  };

  // Delete Distributor
  const handleDelete = async (distId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove distributor "${name}"?`)) {
      return;
    }

    try {
      if (distId && !distId.startsWith('dist-custom-') && !distId.startsWith('dist-')) {
        await supabase.from('distributors').delete().eq('id', distId);
      }
    } catch (e) {}

    // Update deleted IDs list
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('cosmevo_deleted_distributor_ids') || '[]');
      if (!deleted.includes(distId)) {
        deleted.push(distId);
        localStorage.setItem('cosmevo_deleted_distributor_ids', JSON.stringify(deleted));
      }

      const stored: Distributor[] = JSON.parse(localStorage.getItem('cosmevo_custom_distributors') || '[]');
      const filtered = stored.filter((d) => d.id !== distId);
      localStorage.setItem('cosmevo_custom_distributors', JSON.stringify(filtered));
    } catch (e) {}

    setDistributors((prev) => prev.filter((d) => d.id !== distId));
  };

  const activeCount = distributors.filter((d) => d.is_active !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
            Distributors Management
          </h1>
          <p className="text-ink/60 text-sm mt-1">
            Manage regional distribution centers, stockists, and retail contact partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/distributors"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border-subtle text-ink text-sm font-semibold hover:bg-warm-white transition-colors"
          >
            <ExternalLink size={15} />
            <span>View Public Page</span>
          </Link>

          <button
            type="button"
            onClick={fetchDistributors}
            className="p-2 rounded-xl bg-white border border-border-subtle text-ink hover:bg-warm-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-plum' : ''} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-plum hover:bg-plum/90 text-white text-sm font-bold shadow-xs active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>Add Distributor</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="text-xs font-bold uppercase text-ink/50">Total Distributors</div>
          <div className="text-2xl sm:text-3xl font-black text-ink mt-1">{distributors.length}</div>
          <div className="text-xs text-text-secondary mt-0.5">Across Pakistan network</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="text-xs font-bold uppercase text-ink/50">Active on Website</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{activeCount}</div>
          <div className="text-xs text-text-secondary mt-0.5">Visible to customers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="text-xs font-bold uppercase text-ink/50">Cities Covered</div>
          <div className="text-2xl sm:text-3xl font-black text-plum mt-1">{uniqueCities.length}</div>
          <div className="text-xs text-text-secondary mt-0.5">Regional hubs operating</div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* City Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCityFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedCityFilter === 'all'
                ? 'bg-plum text-white'
                : 'bg-warm-white text-ink/70 hover:bg-cream border border-border-subtle'
            }`}
          >
            All Cities ({distributors.length})
          </button>

          {uniqueCities.map((city) => {
            const isSelected = selectedCityFilter.toLowerCase() === city.toLowerCase();
            const count = distributors.filter((d) => d.city.toLowerCase() === city.toLowerCase()).length;

            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCityFilter(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-plum text-white'
                    : 'bg-warm-white text-ink/70 hover:bg-cream border border-border-subtle'
                }`}
              >
                {city} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, city, phone..."
            className="w-full pl-9 pr-4 py-2 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-plum"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/40 hover:text-ink font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 4. Table / List */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-white/60 text-ink/70 border-b border-border-subtle select-none">
              <tr>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase">City / Location</th>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase">Distributor Name</th>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase">Contact Person</th>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase">Phone / WhatsApp</th>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase">Address & Coverage</th>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-5 py-3.5 font-semibold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ink/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-plum border-t-transparent animate-spin" />
                      <span>Loading distributors...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-ink/50">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-2">
                      <Building2 size={24} className="text-ink/30" />
                      <p className="font-semibold text-ink">No distributors found</p>
                      <p className="text-xs text-ink/50">
                        {searchQuery ? 'Try changing your search query.' : 'Click "Add Distributor" to create your first listing.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((dist) => (
                  <tr key={dist.id} className="hover:bg-warm-white/40 transition-colors">
                    {/* City & Province */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-plum/10 text-plum tracking-wide uppercase">
                        <MapPin size={12} />
                        {dist.city}
                      </span>
                      {dist.province && (
                        <div className="text-[11px] text-ink/50 mt-0.5 pl-1">{dist.province}</div>
                      )}
                    </td>

                    {/* Distributor Name */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-ink text-sm">{dist.name}</div>
                      {dist.email && (
                        <div className="text-[11px] text-ink/50">{dist.email}</div>
                      )}
                    </td>

                    {/* Contact Person */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {dist.contact_person ? (
                        <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                          <User size={13} className="text-plum" />
                          <span>{dist.contact_person}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink/40">—</span>
                      )}
                    </td>

                    {/* Phone & WhatsApp */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <Phone size={12} className="text-plum" />
                        <span>{dist.phone}</span>
                      </div>
                      {dist.whatsapp && (
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <MessageCircle size={11} />
                          <span>WhatsApp: {dist.whatsapp}</span>
                        </div>
                      )}
                    </td>

                    {/* Address & Coverage */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="text-xs text-ink/80 line-clamp-2">{dist.address}</div>
                      {dist.area_covered && (
                        <div className="text-[11px] text-ink/50 mt-0.5 line-clamp-1">
                          Coverage: {dist.area_covered}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(dist)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                          dist.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {dist.is_active !== false ? (
                          <>
                            <Check size={12} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(dist)}
                          className="p-1.5 rounded-lg bg-warm-white hover:bg-cream text-ink/80 hover:text-plum border border-border-subtle transition-colors"
                          title="Edit distributor"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(dist.id, dist.name)}
                          className="p-1.5 rounded-lg bg-warm-white hover:bg-rose-50 text-ink/80 hover:text-rose-600 border border-border-subtle transition-colors"
                          title="Delete distributor"
                        >
                          <Trash2 size={15} />
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

      {/* 5. Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-border-subtle w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-warm-white/60">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-plum" />
                <h3 className="font-bold text-ink text-lg">
                  {form.id ? 'Edit Distributor' : 'Add New Distributor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink/50 hover:text-ink rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDistributor} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1">
                    Distributor / Store Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Cosmevo Regional Distribution Punjab"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Lahore, Karachi, Islamabad..."
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Province</label>
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Islamabad">Islamabad Capital</option>
                    <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={form.contact_person}
                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                    placeholder="e.g. M. Haris Khan"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 0309 4560316"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="e.g. 923094560316 or 03094560316"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. lahore@cosmevo.pk"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1">
                    Store / Office Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Suite 402, Al-Hafeez Heights, Ghalib Road, Gulberg III, Lahore"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum resize-none"
                  />
                </div>

                {/* Areas Covered */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink mb-1">Areas / Markets Covered</label>
                  <input
                    type="text"
                    value={form.area_covered}
                    onChange={(e) => setForm({ ...form, area_covered: e.target.value })}
                    placeholder="e.g. Gulberg, DHA, Model Town, Johar Town & Cantt"
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-plum focus:ring-plum border-border-subtle"
                  />
                  <label htmlFor="is_active_check" className="text-xs font-bold text-ink select-none cursor-pointer">
                    Active (Show on public distributors page)
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-ink/70 hover:text-ink rounded-xl border border-border-subtle hover:bg-warm-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-plum hover:bg-plum/90 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : form.id ? 'Update Distributor' : 'Create Distributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
