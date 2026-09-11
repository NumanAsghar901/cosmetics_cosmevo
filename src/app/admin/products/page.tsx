'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { FALLBACK_IMAGES } from '@/lib/constants';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        const sorted = (data as Product[]).sort((a, b) => {
          if (a.is_coming_soon && !b.is_coming_soon) return -1;
          if (!a.is_coming_soon && b.is_coming_soon) return 1;
          return 0;
        });
        setProducts(sorted);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      if (!supabase) return;

      // 1. Delete associated images from Cloudinary
      const productToDelete = products.find(p => p.id === id);
      if (productToDelete && productToDelete.image_url) {
        const urls = productToDelete.image_url
          .split(',')
          .map(s => s.trim())
          .filter(u => u.includes('cloudinary.com'));

        if (urls.length > 0) {
          fetch('/api/admin/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls }),
          }).catch(e => console.warn('Cloudinary product deletion call failed:', e));
        }
      }

      // 2. Delete from Supabase
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products Management</h1>
          <p className="text-ink/60 mt-1">Add, edit, or remove products from your store.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-plum text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-plum/90 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-white/50 text-ink/70">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Featured / Flags</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink/50">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-ink/50">
                    No products found. Start by adding one!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-warm-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-cream rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image_url ? product.image_url.split(',')[0].trim() : (FALLBACK_IMAGES[product.category] || FALLBACK_IMAGES.face)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{product.name}</p>
                          <p className="text-xs text-ink/50 mt-0.5">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize bg-cream px-2.5 py-1 rounded-md text-xs font-semibold text-ink/80">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      Rs. {product.price}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        {product.featured && (
                          <span className="text-plum bg-plum/10 border border-plum/20 px-2 py-0.5 rounded text-[11px] font-bold">
                            Homepage
                          </span>
                        )}
                        {product.is_coming_soon && (
                          <span className="text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            Coming Soon
                          </span>
                        )}
                        {!product.featured && !product.is_coming_soon && (
                          <span className="text-ink/40 text-xs font-medium">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-ink/60 hover:text-plum hover:bg-cream rounded-md transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Product"
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
    </div>
  );
}
