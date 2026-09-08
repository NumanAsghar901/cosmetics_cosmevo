'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product, DbCategory, DbSubcategory } from '@/lib/types';
import { ArrowLeft, Plus, X, UploadCloud, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DbSubcategory[]>([]);
  const supabase = createClient();

  const [formData, setFormData] = useState<Partial<Product>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    category: initialData?.category || 'face',
    subcategory: initialData?.subcategory || '',
    family: initialData?.family || '',
    price: initialData?.price || 0,
    tagline: initialData?.tagline || '',
    overview: initialData?.overview || '',
    benefits: initialData?.benefits || [''],
    how_to_use: initialData?.how_to_use || [''],
    caution: initialData?.caution || '',
    concerns: initialData?.concerns || [],
    featured: initialData?.featured || false,
    image_url: initialData?.image_url || '',
  });

  const [concernInput, setConcernInput] = useState('');

  React.useEffect(() => {
    async function fetchData() {
      const [catsRes, subsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
      ]);
      if (catsRes.data) setCategories(catsRes.data as DbCategory[]);
      if (subsRes.data) setSubcategories(subsRes.data as DbSubcategory[]);
    }
    fetchData();
  }, [supabase]);

  const handleArrayChange = (field: 'benefits' | 'how_to_use', index: number, value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'benefits' | 'how_to_use') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };

  const removeArrayItem = (field: 'benefits' | 'how_to_use', index: number) => {
    const newArray = [...(formData[field] || [])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddConcern = () => {
    if (concernInput.trim() && !formData.concerns?.includes(concernInput.trim())) {
      setFormData({
        ...formData,
        concerns: [...(formData.concerns || []), concernInput.trim().replace(/\s+/g, '-').toLowerCase()],
      });
      setConcernInput('');
    }
  };

  const handleRemoveConcern = (concernToRemove: string) => {
    setFormData({
      ...formData,
      concerns: formData.concerns?.filter(c => c !== concernToRemove),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError('Cloudinary configuration is missing in environment variables.');
      setIsUploading(false);
      return;
    }

    try {
      const currentImages = formData.image_url ? formData.image_url.split(',').map(s => s.trim()) : [];
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: fd,
        });

        if (!res.ok) throw new Error('Failed to upload image to Cloudinary');
        const data = await res.json();
        newUrls.push(data.secure_url);
      }

      const updatedImages = [...currentImages, ...newUrls];
      setFormData({ ...formData, image_url: updatedImages.join(',') });
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (!formData.image_url) return;
    const images = formData.image_url.split(',').map(s => s.trim());
    images.splice(indexToRemove, 1);
    setFormData({ ...formData, image_url: images.length > 0 ? images.join(',') : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {

      // Clean up empty array items
      const cleanedData = {
        ...formData,
        benefits: formData.benefits?.filter(b => b.trim() !== ''),
        how_to_use: formData.how_to_use?.filter(h => h.trim() !== ''),
      };

      if (isEdit && initialData?.id) {
        const { error } = await supabase
          .from('products')
          .update(cleanedData)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([cleanedData]);
        if (error) throw error;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-cream rounded-full transition-colors text-ink/70">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-ink">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-plum text-white px-6 py-2 rounded-lg font-semibold hover:bg-plum/90 transition-colors disabled:opacity-70"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-border-subtle shadow-sm space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-ink mb-4 border-b border-border-subtle pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    name: val,
                    // auto-generate slug if not editing
                    ...(!isEdit ? { slug: val.toLowerCase().replace(/\s+/g, '-') } : {})
                  });
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value, subcategory: '' });
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum capitalize"
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Product Family (Tag) *</label>
              <input
                type="text"
                required
                value={formData.family}
                onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum"
                placeholder="e.g. HYDRO MED"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Price (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-2">Product Images</label>
              
              {/* Image Previews */}
              {formData.image_url && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {formData.image_url.split(',').map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-cream border border-border-subtle group">
                      <img src={url.trim()} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-white/90 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        <X size={16} />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 inset-x-0 bg-ink/70 text-white text-[10px] font-bold text-center py-1">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isUploading ? 'bg-cream border-border-subtle opacity-70' : 'bg-warm-white border-plum/30 hover:bg-cream hover:border-plum/50'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-ink/60">
                  {isUploading ? (
                    <Loader2 size={28} className="animate-spin text-plum mb-2" />
                  ) : (
                    <UploadCloud size={28} className="text-plum mb-2" />
                  )}
                  <p className="text-sm font-medium">
                    {isUploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-xs mt-1">SVG, PNG, JPG or WEBP</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-plum rounded focus:ring-plum"
              />
              <label htmlFor="featured" className="text-sm font-medium text-ink cursor-pointer">
                Feature on Homepage
              </label>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="pt-4">
          <h2 className="text-lg font-semibold text-ink mb-4 border-b border-border-subtle pb-2">Content Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Overview</label>
              <textarea
                rows={4}
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Caution / Warnings</label>
              <input
                type="text"
                value={formData.caution}
                onChange={(e) => setFormData({ ...formData, caution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border-subtle focus:ring-2 focus:ring-plum/20 focus:border-plum"
              />
            </div>
          </div>
        </div>

        {/* Lists (Benefits & How to Use) */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Key Benefits */}
          <div>
            <h2 className="text-lg font-semibold text-ink mb-4 border-b border-border-subtle pb-2">Key Benefits</h2>
            <div className="space-y-3">
              {formData.benefits?.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border-subtle text-sm focus:ring-2 focus:ring-plum/20 focus:border-plum"
                    placeholder="E.g., Gently cleanses skin"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('benefits', index)}
                    className="p-2 text-ink/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
                className="text-sm font-medium text-plum hover:text-ink flex items-center gap-1 transition-colors mt-2"
              >
                <Plus size={16} /> Add Benefit
              </button>
            </div>
          </div>

          {/* How to Use */}
          <div>
            <h2 className="text-lg font-semibold text-ink mb-4 border-b border-border-subtle pb-2">How to Use (Steps)</h2>
            <div className="space-y-3">
              {formData.how_to_use?.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleArrayChange('how_to_use', index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border-subtle text-sm focus:ring-2 focus:ring-plum/20 focus:border-plum"
                    placeholder={`Step ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('how_to_use', index)}
                    className="p-2 text-ink/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('how_to_use')}
                className="text-sm font-medium text-plum hover:text-ink flex items-center gap-1 transition-colors mt-2"
              >
                <Plus size={16} /> Add Step
              </button>
            </div>
          </div>
        </div>

        {/* Concerns / Tags (Subcategories) */}
        <div className="pt-4">
          <h2 className="text-lg font-semibold text-ink mb-4 border-b border-border-subtle pb-2">Subcategories (Concerns)</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {subcategories.map(sub => {
              const isSelected = formData.concerns?.includes(sub.slug);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      handleRemoveConcern(sub.slug);
                    } else {
                      setFormData({
                        ...formData,
                        concerns: [...(formData.concerns || []), sub.slug]
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    isSelected ? 'bg-plum text-white border-plum' : 'bg-cream text-ink border-border-subtle hover:border-plum/50'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
            {subcategories.length === 0 && (
              <span className="text-sm text-ink/40">No subcategories available. Add them in the Admin Categories panel.</span>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
