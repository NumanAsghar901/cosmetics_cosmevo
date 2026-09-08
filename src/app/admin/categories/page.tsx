'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DbCategory, DbSubcategory } from '@/lib/types';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DbSubcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  
  // Forms state
  const [catForm, setCatForm] = useState({ id: '', name: '', slug: '', description: '' });
  const [subForm, setSubForm] = useState({ id: '', name: '', slug: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [catsRes, subsRes] = await Promise.all([
      supabase.from('categories').select('*').order('created_at', { ascending: true }),
      supabase.from('subcategories').select('*').order('created_at', { ascending: true })
    ]);
    if (catsRes.data) setCategories(catsRes.data as DbCategory[]);
    if (subsRes.data) setSubcategories(subsRes.data as DbSubcategory[]);
    setIsLoading(false);
  }

  // Categories CRUD
  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (catForm.id) {
      await supabase.from('categories').update({
        name: catForm.name,
        slug: catForm.slug,
        description: catForm.description
      }).eq('id', catForm.id);
    } else {
      await supabase.from('categories').insert([{
        name: catForm.name,
        slug: catForm.slug,
        description: catForm.description
      }]);
    }
    setIsCatModalOpen(false);
    fetchData();
  }

  async function handleDeleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      await supabase.from('categories').delete().eq('id', id);
      fetchData();
    }
  }

  // Subcategories CRUD
  async function handleSaveSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (subForm.id) {
      await supabase.from('subcategories').update({
        name: subForm.name,
        slug: subForm.slug
      }).eq('id', subForm.id);
    } else {
      await supabase.from('subcategories').insert([{
        name: subForm.name,
        slug: subForm.slug
      }]);
    }
    setIsSubModalOpen(false);
    fetchData();
  }

  async function handleDeleteSubcategory(id: string) {
    if (confirm('Are you sure you want to delete this subcategory/concern?')) {
      await supabase.from('subcategories').delete().eq('id', id);
      fetchData();
    }
  }

  const openCatModal = (cat?: DbCategory) => {
    if (cat) {
      setCatForm({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description || '' });
    } else {
      setCatForm({ id: '', name: '', slug: '', description: '' });
    }
    setIsCatModalOpen(true);
  };

  const openSubModal = (sub?: DbSubcategory) => {
    if (sub) {
      setSubForm({ id: sub.id, name: sub.name, slug: sub.slug });
    } else {
      setSubForm({ id: '', name: '', slug: '' });
    }
    setIsSubModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Categories</h1>
          <p className="text-ink/60 mt-1">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={() => openCatModal()}
          className="flex items-center gap-2 bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 transition-colors"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum"></div>
        </div>
      ) : (
        <div className="grid gap-12">
          {/* Main Categories Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ink">Main Categories</h2>
            </div>
            <div className="grid gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-xl border border-border-subtle overflow-hidden shadow-sm flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-lg font-bold text-ink">{cat.name}</h3>
                    <p className="text-sm text-ink/60">/{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openCatModal(cat)} className="p-2 text-ink/60 hover:text-plum transition-colors hover:bg-plum/10 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-border-subtle">
                  <p className="text-ink/60">No categories found.</p>
                </div>
              )}
            </div>
          </section>

          {/* Subcategories / Concerns Section */}
          <section>
            <div className="flex items-center justify-between mb-4 border-t border-border-subtle pt-8">
              <div>
                <h2 className="text-xl font-bold text-ink">Subcategories (Concerns)</h2>
                <p className="text-sm text-ink/60 mt-1">Global tags applied to products like "Acne-Prone Skin"</p>
              </div>
              <button
                onClick={() => openSubModal()}
                className="flex items-center gap-2 bg-cream text-ink px-4 py-2 rounded-lg hover:bg-cream/80 border border-border-subtle transition-colors"
              >
                <Plus size={20} />
                <span>Add Subcategory</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subcategories.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-white shadow-sm">
                  <div>
                    <p className="font-bold text-ink text-base">{sub.name}</p>
                    <p className="text-xs text-ink/50">/{sub.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openSubModal(sub)} className="p-1.5 text-ink/50 hover:text-plum transition-colors rounded">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteSubcategory(sub.id)} className="p-1.5 text-red-300 hover:text-red-600 transition-colors rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {subcategories.length === 0 && (
                <div className="col-span-full text-center py-8 bg-white rounded-xl border border-border-subtle">
                  <p className="text-ink/60">No subcategories found.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">{catForm.id ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-cream rounded-full text-ink/60">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input required type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value, slug: !catForm.id ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : catForm.slug})} className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Slug</label>
                <input required type="text" value={catForm.slug} onChange={e => setCatForm({...catForm, slug: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description (Optional)</label>
                <textarea value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 outline-none" rows={3} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg font-medium bg-cream text-ink hover:bg-cream/80 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg font-medium bg-plum text-white hover:bg-plum/90 transition-colors">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-ink">{subForm.id ? 'Edit Subcategory' : 'New Subcategory'}</h3>
              <button onClick={() => setIsSubModalOpen(false)} className="p-2 hover:bg-cream rounded-full text-ink/60">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input required type="text" value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value, slug: !subForm.id ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : subForm.slug})} className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Slug</label>
                <input required type="text" value={subForm.slug} onChange={e => setSubForm({...subForm, slug: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsSubModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg font-medium bg-cream text-ink hover:bg-cream/80 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg font-medium bg-plum text-white hover:bg-plum/90 transition-colors">Save Subcategory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
