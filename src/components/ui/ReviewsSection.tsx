'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  image_url?: string;
  is_dummy?: boolean;
  created_at: string;
}

interface ReviewsSectionProps {
  productId: string | number;
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function generateDeterministicRandomDate(reviewId: string) {
  let hash = 0;
  for (let i = 0; i < reviewId.length; i++) {
    hash = Math.imul(31, hash) + reviewId.charCodeAt(i) | 0;
  }
  const seed = Math.abs(hash);
  const start = new Date('2025-01-01').getTime();
  const end = new Date().getTime();
  const randomTime = start + (seed % (end - start));
  return new Date(randomTime).toISOString();
}

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          aria-label={`Rate ${s} star${s !== 1 ? 's' : ''}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={(hovered || rating) >= s ? '#6B21A8' : 'none'}
            stroke={(hovered || rating) >= s ? '#6B21A8' : '#CBD5E1'}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase!
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  }

  async function uploadImage(file: File): Promise<string | null> {
    if (!cloudName || !uploadPreset) return null;
    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url || null;
    } catch {
      return null;
    } finally {
      setUploadProgress(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || rating < 1) {
      setError('Please fill in all required fields and select a rating.');
      return;
    }
    setSubmitting(true);
    setError('');

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const { error: insertErr } = await supabase!.from('reviews').insert({
      product_id: productId,
      user_name: name.trim(),
      rating,
      comment: comment.trim(),
      image_url: imageUrl,
      is_dummy: false,
    });

    if (insertErr) {
      setError('Failed to submit review. Please try again.');
    } else {
      setSuccess(true);
      setName('');
      setRating(5);
      setComment('');
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      fetchReviews();
    }
    setSubmitting(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  return (
    <section className="mt-20 pt-12 border-t border-border-subtle">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <span className="eyebrow">Customer Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Reviews & Ratings
          </h2>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setSuccess(false); setError(''); }}
          className="btn btn-primary text-sm py-2.5 px-5"
        >
          {showForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {/* Review Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-10 p-6 bg-cream rounded-2xl">
          <div className="text-center shrink-0">
            <div className="text-6xl font-extrabold text-ink leading-none">{avgRating}</div>
            <StarRating rating={Math.round(avgRating)} />
            <div className="text-xs text-text-secondary mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="text-xs font-bold text-text-secondary w-4">{star}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B21A8" stroke="#6B21A8" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-plum to-blush rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-text-secondary w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Thank you! Your review has been submitted successfully.
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 p-6 bg-cream rounded-2xl border border-border-subtle">
          <h3 className="font-extrabold text-ink text-lg mb-5">Share Your Experience</h3>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5" htmlFor="review-name">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fatima K."
                className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-white text-sm text-ink placeholder:text-text-secondary focus:outline-none focus:border-plum focus:ring-2 focus:ring-plum/10 transition-all"
                required
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <StarRating rating={rating} interactive onRate={setRating} />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5" htmlFor="review-comment">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Tell others about your experience with this product..."
                className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-white text-sm text-ink placeholder:text-text-secondary focus:outline-none focus:border-plum focus:ring-2 focus:ring-plum/10 transition-all resize-none"
                required
              />
            </div>

            {/* Image Upload (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border-subtle">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border-subtle bg-white text-sm text-text-secondary hover:border-plum hover:text-plum transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {imagePreview ? 'Change Photo' : 'Add Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || uploadProgress}
              className="btn btn-primary w-full sm:w-auto px-8 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting || uploadProgress ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-5 bg-cream rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-border-subtle" />
                <div className="space-y-1.5">
                  <div className="w-24 h-3 bg-border-subtle rounded" />
                  <div className="w-16 h-2.5 bg-border-subtle rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-border-subtle rounded" />
                <div className="w-3/4 h-3 bg-border-subtle rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-40">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-base font-semibold">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 sm:p-6 bg-cream rounded-2xl border border-border-subtle hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-plum to-blush flex items-center justify-center shrink-0">
                  <span className="text-white font-extrabold text-sm">{review.user_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ink text-sm truncate">{review.user_name}</span>
                    <span className="text-xs text-text-secondary shrink-0">
                      {new Date(review.is_dummy ? generateDeterministicRandomDate(review.id) : review.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <StarRating rating={review.rating} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
              {review.image_url && (
                <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden border border-border-subtle relative">
                  <Image src={review.image_url} alt="Review image" fill className="object-cover" />
                </div>
              )}
              {review.is_dummy && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-text-secondary/60">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Verified Purchase
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
