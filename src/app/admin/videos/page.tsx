'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShowcaseVideo, Product } from '@/lib/types';
import { FALLBACK_SHOWCASE_VIDEOS } from '@/lib/videos';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/lib/constants';
import { 
  Film, Plus, Edit2, Trash2, Check, X, AlertCircle, 
  UploadCloud, Loader2, Play, Pause, ExternalLink, Link as LinkIcon 
} from 'lucide-react';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<ShowcaseVideo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbTableMissing, setDbTableMissing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  // Video upload progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadLoadedBytes, setUploadLoadedBytes] = useState(0);
  const [uploadTotalBytes, setUploadTotalBytes] = useState(0);
  const [videoDisplayName, setVideoDisplayName] = useState('');
  const activeXhrRef = useRef<XMLHttpRequest | null>(null);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    product_id: string;
    product_name: string;
    product_slug: string;
    display_order: number;
    is_active: boolean;
  }>({
    id: '',
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    product_id: '',
    product_name: '',
    product_slug: '',
    display_order: 1,
    is_active: true,
  });

  const supabase = createClient();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchVideos();
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug')
        .order('name', { ascending: true });
      if (data) {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.error('Error fetching products for dropdown:', err);
    }
  }

  async function fetchVideos() {
    setIsLoading(true);
    try {
      // Read local deleted IDs and custom videos
      let deletedIds: string[] = [];
      let customVideos: ShowcaseVideo[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem('cosmevo_deleted_video_ids') || '[]');
        customVideos = JSON.parse(localStorage.getItem('cosmevo_custom_videos') || '[]');
      } catch (e) {}

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase videos table not found or query error:', error.message);
        setDbTableMissing(true);
        // Start from fallback videos + custom videos, filtering out deleted ones
        const combined = [...customVideos, ...FALLBACK_SHOWCASE_VIDEOS.filter((f) => !deletedIds.includes(f.id))];
        setVideos(combined);
      } else if (data) {
        setDbTableMissing(false);
        // Table exists! Combine Supabase records + local custom videos not in Supabase yet
        const existingIds = new Set((data as ShowcaseVideo[]).map((d) => d.id));
        const extraCustom = customVideos.filter((c) => !existingIds.has(c.id));
        const combined = [...(data as ShowcaseVideo[]), ...extraCustom].filter((v) => !deletedIds.includes(v.id));
        setVideos(combined);
      }
    } catch (err) {
      console.error('Fetch videos unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancelUpload = () => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setIsUploadingVideo(false);
    setUploadProgress(0);
    setUploadFileName('');
    setUploadFileSize('');
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const handleRemoveVideo = () => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setForm((prev) => ({ ...prev, video_url: '' }));
    setVideoDisplayName('');
    setUploadProgress(0);
    setUploadFileName('');
    setUploadFileSize('');
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset and initialize progress state
    setIsUploadingVideo(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setUploadFileSize(sizeInMb);
    setUploadLoadedBytes(0);
    setUploadTotalBytes(file.size);
    setFormError(null);

    const cName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME;
    const uPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET;

    // Helper to upload with real-time XMLHttpRequest progress
    const uploadWithXhr = (url: string, formData: FormData): Promise<{ ok: boolean; status: number; data: any }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        activeXhrRef.current = xhr;
        xhr.open('POST', url);

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
            setUploadProgress(pct);
            setUploadLoadedBytes(evt.loaded);
            setUploadTotalBytes(evt.total);
          }
        };

        xhr.onload = () => {
          activeXhrRef.current = null;
          let data: any = {};
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = { raw: xhr.responseText };
          }
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            data,
          });
        };

        xhr.onerror = () => {
          activeXhrRef.current = null;
          reject(new Error('Network connection error during video upload. Please check your internet connection.'));
        };

        xhr.onabort = () => {
          activeXhrRef.current = null;
          reject(new Error('Upload canceled.'));
        };

        xhr.send(formData);
      });
    };

    try {
      // 1. Direct Cloudinary upload with real-time progress bar (works on Vercel & bypasses serverless limits)
      if (cName && uPreset) {
        try {
          const cFd = new FormData();
          cFd.append('file', file);
          cFd.append('upload_preset', uPreset);

          const { ok, data: cData, status } = await uploadWithXhr(
            `https://api.cloudinary.com/v1_1/${cName}/video/upload`,
            cFd
          );

          if (ok && (cData.secure_url || cData.url)) {
            setUploadProgress(100);
            setForm((prev) => ({
              ...prev,
              video_url: cData.secure_url || cData.url,
              thumbnail_url: prev.thumbnail_url || (cData.secure_url ? cData.secure_url.replace(/\.[^/.]+$/, ".jpg") : ''),
            }));
            setVideoDisplayName(file.name);
            setIsUploadingVideo(false);
            if (videoFileInputRef.current) videoFileInputRef.current.value = '';
            return;
          } else {
            const detail = cData?.error?.message || `HTTP status ${status}`;
            console.error('Cloudinary video upload failed:', cData);
            if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
              throw new Error(`Cloudinary upload failed: ${detail}`);
            }
          }
        } catch (cErr: any) {
          if (cErr.message === 'Upload canceled.') {
            setIsUploadingVideo(false);
            return;
          }
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            throw cErr;
          }
          console.warn('Cloudinary upload deferred, trying local handler on localhost:', cErr);
        }
      }

      // 2. Fallback to /api/upload/video (only on localhost) with progress
      const fd = new FormData();
      fd.append('file', file);

      const { ok, data: localData } = await uploadWithXhr('/api/upload/video', fd);

      if (!ok) {
        throw new Error(localData?.error || 'Failed to upload video');
      }

      if (localData?.url) {
        setUploadProgress(100);
        setForm((prev) => ({
          ...prev,
          video_url: localData.url,
        }));
        setVideoDisplayName(file.name);
      }
    } catch (err: any) {
      if (err.message !== 'Upload canceled.') {
        console.error('Video upload error:', err);
        setFormError(err.message || 'Video upload failed. Please try again.');
      }
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setFormError(null);

    const cName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME;
    const uPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET;

    try {
      if (cName && uPreset) {
        try {
          const cFd = new FormData();
          cFd.append('file', file);
          cFd.append('upload_preset', uPreset);

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cName}/image/upload`, {
            method: 'POST',
            body: cFd,
          });

          const cData = await cRes.json().catch(() => ({}));

          if (cRes.ok && (cData.secure_url || cData.url)) {
            setForm((prev) => ({
              ...prev,
              thumbnail_url: cData.secure_url || cData.url,
            }));
            setIsUploadingThumb(false);
            if (thumbFileInputRef.current) thumbFileInputRef.current.value = '';
            return;
          } else {
            const detail = cData?.error?.message || `HTTP status ${cRes.status}`;
            console.error('Cloudinary image upload failed:', cData);
            if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
              throw new Error(`Cloudinary thumbnail upload failed: ${detail}`);
            }
          }
        } catch (cErr: any) {
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            throw cErr;
          }
          console.warn('Cloudinary image upload deferred, trying local:', cErr);
        }
      }

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to upload thumbnail');
      }

      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({
          ...prev,
          thumbnail_url: data.url,
        }));
      }
    } catch (err: any) {
      console.error('Thumbnail upload error:', err);
      setFormError(err.message || 'Thumbnail upload failed.');
    } finally {
      setIsUploadingThumb(false);
      if (thumbFileInputRef.current) thumbFileInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    setForm({
      id: '',
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      product_id: '',
      product_name: '',
      product_slug: '',
      display_order: videos.length + 1,
      is_active: true,
    });
    setVideoDisplayName('');
    setUploadProgress(0);
    setUploadFileName('');
    setUploadFileSize('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (video: ShowcaseVideo) => {
    setForm({
      id: video.id || '',
      title: video.title || '',
      description: video.description || '',
      video_url: video.video_url || '',
      thumbnail_url: video.thumbnail_url || '',
      product_id: String(video.product_id || ''),
      product_name: video.product_name || '',
      product_slug: video.product_slug || '',
      display_order: video.display_order ?? 1,
      is_active: video.is_active ?? true,
    });
    const extractedName = video.video_url
      ? decodeURIComponent(video.video_url.split('/').pop()?.split('?')[0] || 'Saved Video')
      : '';
    setVideoDisplayName(extractedName);
    setUploadProgress(0);
    setUploadFileName('');
    setUploadFileSize('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isUploadingVideo) {
      handleCancelUpload();
    }
    setIsModalOpen(false);
  };

  const handleProductSelect = (productId: string) => {
    if (!productId) {
      setForm((prev) => ({
        ...prev,
        product_id: '',
        product_name: '',
        product_slug: '',
      }));
      return;
    }

    const matched = products.find((p) => String(p.id) === productId);
    if (matched) {
      setForm((prev) => ({
        ...prev,
        product_id: String(matched.id),
        product_name: matched.name,
        product_slug: matched.slug,
      }));
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    const videoUrl = form.video_url.trim();

    if (!title) {
      setFormError('Please enter a video title.');
      return;
    }

    if (!videoUrl) {
      setFormError('Please upload a video file.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: ShowcaseVideo = {
        id: form.id || `local-${Date.now()}`,
        title,
        description: form.description.trim() || undefined,
        video_url: videoUrl,
        thumbnail_url: form.thumbnail_url.trim() || undefined,
        product_id: form.product_id || undefined,
        product_name: form.product_name || undefined,
        product_slug: form.product_slug || undefined,
        display_order: Number(form.display_order) || 1,
        is_active: form.is_active,
      };

      let savedToDb = false;

      // Try saving to Supabase first
      try {
        if (form.id && !form.id.startsWith('fallback-') && !form.id.startsWith('local-')) {
          const { error } = await supabase
            .from('videos')
            .update({
              title: payload.title,
              description: payload.description,
              video_url: payload.video_url,
              thumbnail_url: payload.thumbnail_url,
              product_id: payload.product_id,
              product_name: payload.product_name,
              product_slug: payload.product_slug,
              display_order: payload.display_order,
              is_active: payload.is_active,
            })
            .eq('id', form.id);

          if (error) {
            console.error('Supabase video update error:', error);
            throw new Error(`Database error: ${error.message}`);
          }
          savedToDb = true;
        } else {
          const { data: inserted, error } = await supabase
            .from('videos')
            .insert([{
              title: payload.title,
              description: payload.description,
              video_url: payload.video_url,
              thumbnail_url: payload.thumbnail_url,
              product_id: payload.product_id,
              product_name: payload.product_name,
              product_slug: payload.product_slug,
              display_order: payload.display_order,
              is_active: payload.is_active,
            }])
            .select();

          if (error) {
            console.error('Supabase video insert error:', error);
            throw new Error(`Database error: ${error.message}`);
          }

          if (inserted && inserted[0]) {
            payload.id = inserted[0].id;
            savedToDb = true;
          }
        }
      } catch (dbErr: any) {
        console.error('Could not save to Supabase DB:', dbErr);
        setFormError(dbErr.message || 'Could not save video to database. Please check your connection.');
        setIsSaving(false);
        return;
      }

      // Sync to localStorage for local testing
      try {
        const storedCustom: ShowcaseVideo[] = JSON.parse(localStorage.getItem('cosmevo_custom_videos') || '[]');
        const existingIdx = storedCustom.findIndex((v) => v.id === payload.id || (form.id && v.id === form.id));
        if (existingIdx >= 0) {
          storedCustom[existingIdx] = payload;
        } else {
          storedCustom.push(payload);
        }
        localStorage.setItem('cosmevo_custom_videos', JSON.stringify(storedCustom));
      } catch (e) {}

      setIsModalOpen(false);
      fetchVideos();
    } catch (err: any) {
      console.error('Error saving video:', err);
      setFormError(err.message || 'Failed to save video.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (video: ShowcaseVideo) => {
    if (!video.id) return;
    const nextActive = !video.is_active;

    // 1. Instantly update UI state
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, is_active: nextActive } : v))
    );

    // 2. Persist in local storage
    try {
      const storedCustom: ShowcaseVideo[] = JSON.parse(localStorage.getItem('cosmevo_custom_videos') || '[]');
      const idx = storedCustom.findIndex((v) => v.id === video.id);
      if (idx >= 0) {
        storedCustom[idx].is_active = nextActive;
        localStorage.setItem('cosmevo_custom_videos', JSON.stringify(storedCustom));
      } else {
        storedCustom.push({ ...video, is_active: nextActive });
        localStorage.setItem('cosmevo_custom_videos', JSON.stringify(storedCustom));
      }
    } catch (e) {}

    // 3. If in Supabase, update database
    if (!video.id.startsWith('fallback-') && !video.id.startsWith('local-')) {
      try {
        await supabase
          .from('videos')
          .update({ is_active: nextActive })
          .eq('id', video.id);
      } catch (err) {
        console.warn('Could not update status in Supabase:', err);
      }
    }
  };

  const handleDeleteVideo = async (id?: string) => {
    if (!id) return;

    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    // 1. Immediately remove from local state
    setVideos((prev) => prev.filter((v) => v.id !== id));

    // 2. Persist deleted ID in localStorage so it never reappears
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('cosmevo_deleted_video_ids') || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('cosmevo_deleted_video_ids', JSON.stringify(deletedIds));
      }

      // Also remove from custom videos in localStorage
      const customVideos: ShowcaseVideo[] = JSON.parse(localStorage.getItem('cosmevo_custom_videos') || '[]');
      const updatedCustom = customVideos.filter((v) => v.id !== id);
      localStorage.setItem('cosmevo_custom_videos', JSON.stringify(updatedCustom));
    } catch (e) {
      console.warn('localStorage deletion error:', e);
    }

    // 3. Delete assets from Cloudinary
    const videoToDelete = videos.find((v) => v.id === id);
    if (videoToDelete) {
      const urlsToDelete = [videoToDelete.video_url, videoToDelete.thumbnail_url].filter(
        (u): u is string => Boolean(u && typeof u === 'string' && u.includes('cloudinary.com'))
      );
      if (urlsToDelete.length > 0) {
        try {
          fetch('/api/admin/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: urlsToDelete }),
          }).catch((cErr) => console.warn('Cloudinary video deletion call failed:', cErr));
        } catch (cErr) {
          console.warn('Cloudinary video deletion call failed:', cErr);
        }
      }
    }

    // 4. If in Supabase, also delete from Supabase
    if (!id.startsWith('fallback-') && !id.startsWith('local-')) {
      try {
        await supabase
          .from('videos')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('Could not delete from Supabase:', err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2.5">
            <Film className="text-plum" size={26} />
            Video Showcase & Reels
          </h1>
          <p className="text-ink/60 mt-1 text-sm">
            Upload and manage ritual videos, product texture shots, and customer reels shown on the website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-soft text-sm"
        >
          <Plus size={18} />
          Upload New Video
        </button>
      </div>

      {dbTableMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-amber-900">
          <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Database Setup Notice</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              The <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-950 font-bold">videos</code> table has not been created in Supabase yet.
              Please run the query in <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-950 font-bold">supabase_videos_setup.sql</code> in your Supabase SQL Editor.
              In the meantime, starter skincare ritual videos are live on the website and ready to view!
            </p>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-ink/50 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-plum" />
            <p className="text-sm font-medium">Loading videos…</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-border-subtle p-8">
            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center text-plum mx-auto mb-3">
              <Film size={26} />
            </div>
            <h3 className="font-bold text-ink text-base">No Videos Added Yet</h3>
            <p className="text-xs text-ink/60 max-w-md mx-auto mt-1 mb-4">
              Add beauty reels and product texture videos to showcase your formulas in motion on the homepage.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary text-xs px-4 py-2">
              Add First Video
            </button>
          </div>
        ) : (
          videos.map((video) => {
            const isPlaying = playingPreviewId === video.id;
            return (
              <div 
                key={video.id} 
                className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
              >
                {/* Video / Thumbnail Box */}
                <div className="relative aspect-[9/12] sm:aspect-[9/13] bg-ink/5 overflow-hidden">
                  <video
                    src={video.video_url}
                    poster={video.thumbnail_url}
                    className="w-full h-full object-cover"
                    playsInline
                    loop
                    muted
                    autoPlay={isPlaying}
                    controls={isPlaying}
                  />

                  {/* Top Status Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-full bg-ink/75 backdrop-blur-xs text-white text-[11px] font-bold">
                      #{video.display_order ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(video);
                      }}
                      className={`pointer-events-auto px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm ${
                        video.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      {video.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>

                  {/* Play preview toggle button */}
                  <button
                    type="button"
                    onClick={() => setPlayingPreviewId(isPlaying ? null : (video.id || null))}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group-hover:opacity-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 text-plum flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                    </div>
                  </button>
                </div>

                {/* Video Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-ink text-base line-clamp-1">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    )}

                    {video.product_name && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-plum font-medium bg-plum/5 px-2.5 py-1 rounded-lg border border-plum/15 w-fit">
                        <LinkIcon size={12} />
                        <span className="truncate max-w-[200px]">Tagged: {video.product_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink/60 hover:text-plum flex items-center gap-1 font-medium transition-colors"
                    >
                      <ExternalLink size={13} />
                      Open Video
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-1.5 text-ink/70 hover:text-plum hover:bg-cream rounded-lg transition-colors"
                        title="Edit video"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-1.5 text-ink/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border-subtle flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Film size={20} className="text-plum" />
                {form.id ? 'Edit Showcase Video' : 'Upload Showcase Video'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-cream rounded-lg text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2 border border-red-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Video Title <span className="text-plum">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydra Glow Serum Texture Ritual"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum"
                />
              </div>

              {/* Description / Caption */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Description / Caption (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Watch how this featherlight formula hydrates and leaves an instant glass glow."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum resize-none"
                />
              </div>

              {/* Video File Upload & Preview */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-ink">
                  Video Source (MP4, WebM, MOV) <span className="text-plum">*</span>
                </label>

                {form.video_url ? (
                  <div className="p-3.5 bg-cream/50 border border-plum/20 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Check size={16} className="text-emerald-600" />
                        Video Loaded &amp; Ready
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={isUploadingVideo}
                          className="text-xs text-plum font-semibold hover:underline"
                        >
                          Change Video
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          disabled={isUploadingVideo}
                          className="text-xs text-red-600 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="aspect-video max-h-48 bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                      <video
                        src={form.video_url}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Clean Video File Badge (NO raw Cloudinary URLs exposed) */}
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-border-subtle text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Film size={15} className="text-plum shrink-0" />
                        <span className="font-semibold text-ink truncate text-xs">
                          {videoDisplayName || (uploadFileName || 'Uploaded Video File')}
                        </span>
                        {uploadFileSize && (
                          <span className="text-[11px] text-text-secondary shrink-0">
                            ({uploadFileSize})
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        Ready
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Direct Upload Box or Real-time Progress Bar */
                  <div>
                    {isUploadingVideo ? (
                      <div className="p-5 bg-warm-white border-2 border-plum/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-plum/10 text-plum flex items-center justify-center shrink-0 animate-pulse">
                              <UploadCloud size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-ink">
                                {uploadProgress >= 100 ? 'Processing Video on CDN…' : 'Uploading Video File…'}
                              </p>
                              <p className="text-[11px] text-text-secondary truncate">
                                {uploadFileName || 'video.mp4'} {uploadFileSize ? `(${uploadFileSize})` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-plum font-mono shrink-0 pl-2">
                            {uploadProgress}%
                          </span>
                        </div>

                        {/* Visual Animated Progress Bar */}
                        <div className="w-full h-2.5 bg-plum/10 rounded-full overflow-hidden p-0.5 border border-plum/15">
                          <div
                            className="h-full bg-gradient-to-r from-plum via-[#9e4468] to-plum rounded-full transition-all duration-200 ease-out shadow-xs"
                            style={{ width: `${Math.max(4, uploadProgress)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
                          <span>
                            {uploadProgress >= 100
                              ? 'Finalizing video ready state…'
                              : `${((uploadLoadedBytes || 0) / (1024 * 1024)).toFixed(1)} MB of ${((uploadTotalBytes || 0) / (1024 * 1024)).toFixed(1)} MB`}
                          </span>
                          <button
                            type="button"
                            onClick={handleCancelUpload}
                            className="text-red-600 font-semibold hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => videoFileInputRef.current?.click()}
                        className="border-2 border-dashed border-border-subtle hover:border-plum/50 hover:bg-warm-white rounded-xl p-6 text-center cursor-pointer transition-colors"
                      >
                        <input
                          type="file"
                          ref={videoFileInputRef}
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          disabled={isUploadingVideo}
                        />
                        <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                          <div className="w-11 h-11 rounded-full bg-cream flex items-center justify-center text-plum mb-1">
                            <UploadCloud size={24} />
                          </div>
                          <span className="text-xs font-bold text-ink">Click or Drag to Upload Video File</span>
                          <span className="text-[11px] text-text-secondary">Supports MP4, WebM, MOV directly from your device</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden input if already uploaded and clicking Change Video */}
                {form.video_url && (
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={isUploadingVideo}
                  />
                )}
              </div>

              {/* Thumbnail / Poster Image */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">
                  Thumbnail / Poster Image (Optional)
                </label>
                {form.thumbnail_url ? (
                  <div className="flex items-center gap-3 p-2.5 bg-cream/40 border border-border-subtle rounded-xl">
                    <img 
                      src={form.thumbnail_url} 
                      alt="Thumbnail preview" 
                      className="w-16 h-16 rounded-lg object-cover border border-border-subtle shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-ink block truncate">Poster Image Uploaded</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, thumbnail_url: '' })}
                        className="text-[11px] text-red-600 hover:underline font-medium mt-1"
                      >
                        Remove Poster
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => thumbFileInputRef.current?.click()}
                      disabled={isUploadingThumb}
                      className="px-4 py-2.5 bg-warm-white border border-border-subtle rounded-xl text-xs font-semibold text-ink hover:bg-cream transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      {isUploadingThumb ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                      {isUploadingThumb ? 'Uploading Poster…' : 'Upload Poster Image'}
                    </button>
                    <input
                      type="file"
                      ref={thumbFileInputRef}
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={isUploadingThumb}
                    />
                    <span className="text-[11px] text-text-secondary">
                      JPG, PNG or WEBP frame preview
                    </span>
                  </div>
                )}
              </div>

              {/* Tag to Product */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Tag to Store Product (Optional)
                </label>
                <select
                  value={form.product_id}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum bg-white"
                >
                  <option value="">— None (General Brand Video) —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-text-secondary mt-1 block">
                  Customers can tap "Shop Product" directly on the video and zoom modal!
                </span>
              </div>

              {/* Display Order & Active status */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum"
                  />
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 rounded accent-plum"
                    />
                    <span className="text-xs font-bold text-ink">Show on Website</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-border-subtle text-ink/70 hover:bg-cream text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingVideo || isUploadingThumb}
                  className="btn btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft"
                >
                  {isSaving ? 'Saving…' : form.id ? 'Save Changes' : 'Upload Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
