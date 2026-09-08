'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ShowcaseVideo } from '@/lib/types';
import VideoZoomModal from '@/components/ui/VideoZoomModal';
import { 
  Play, Pause, ZoomIn, ShoppingBag, Sparkles, 
  ChevronRight, Volume2, ArrowRight 
} from 'lucide-react';

interface VideoShowcaseProps {
  videos: ShowcaseVideo[];
}

function VideoCard({ 
  video, 
  onZoom 
}: { 
  video: ShowcaseVideo; 
  onZoom: (v: ShowcaseVideo) => void; 
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        // Auto-play muted might be blocked in some edge cases
        console.log('Autoplay deferred:', err);
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If user clicked inside the card (and not on Zoom or Shop links)
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shadow-sm hover:shadow-xl bg-ink/5 border border-border-subtle hover:border-plum/30 flex flex-col justify-between aspect-[9/14] sm:aspect-[9/15] select-none`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url}
        playsInline
        loop
        muted
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Aesthetic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none transition-opacity duration-300" />

      {/* Top Bar: Play Indicator & Dedicated Zoom Button */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between w-full">
        {/* Play / Live Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/60'}`} />
          <span>{isPlaying ? 'Playing' : 'Hover to Play'}</span>
        </div>

        {/* Dedicated Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onZoom(video);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-ink text-xs font-bold shadow-lg backdrop-blur-md transition-all duration-200 transform hover:scale-105 hover:text-plum border border-white/50 active:scale-95"
          title="Zoom and inspect formula texture"
        >
          <ZoomIn size={14} className="text-plum" />
          <span>Zoom</span>
        </button>
      </div>

      {/* Center Floating Play/Pause Ripple */}
      <div className="relative z-10 flex items-center justify-center my-auto pointer-events-none">
        <div 
          className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all duration-300 transform ${
            isPlaying ? 'opacity-0 scale-75' : 'opacity-90 group-hover:scale-110 group-hover:opacity-100'
          }`}
        >
          <Play size={22} className="ml-1 fill-white" />
        </div>
      </div>

      {/* Bottom Information & Tagged Product */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-2.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <div>
          <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug drop-shadow-sm group-hover:text-plum-light transition-colors line-clamp-1">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white/75 text-xs line-clamp-2 mt-1 drop-shadow-xs font-medium">
              {video.description}
            </p>
          )}
        </div>

        {/* Tagged Product Pill (Click to shop) */}
        {video.product_slug ? (
          <Link
            href={`/product/${video.product_slug}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-plum text-white text-xs font-bold backdrop-blur-md border border-white/20 hover:border-plum transition-all group/prod"
          >
            <div className="flex items-center gap-2 truncate">
              <ShoppingBag size={14} className="text-white shrink-0" />
              <span className="truncate">{video.product_name || 'Shop Product'}</span>
            </div>
            <ArrowRight size={13} className="shrink-0 transition-transform group-hover/prod:translate-x-0.5" />
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
            <Sparkles size={12} className="text-plum-light" />
            <span>Cosmevo Formula Showcase</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoShowcase({ videos: initialVideos }: VideoShowcaseProps) {
  const [selectedZoomVideo, setSelectedZoomVideo] = useState<ShowcaseVideo | null>(null);
  const [activeVideos, setActiveVideos] = useState<ShowcaseVideo[]>(initialVideos);

  React.useEffect(() => {
    try {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('cosmevo_deleted_video_ids') || '[]');
      const customVideos: ShowcaseVideo[] = JSON.parse(localStorage.getItem('cosmevo_custom_videos') || '[]');

      const existingIds = new Set(initialVideos.map((v) => v.id));
      const extraCustom = customVideos.filter((c) => !existingIds.has(c.id));

      const merged = [...initialVideos, ...extraCustom]
        .filter((v) => !deletedIds.includes(v.id) && v.is_active !== false)
        .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));

      setActiveVideos(merged);
    } catch (e) {
      setActiveVideos(initialVideos.filter((v) => v.is_active !== false));
    }
  }, [initialVideos]);

  if (!activeVideos || activeVideos.length === 0) {
    return null;
  }

  return (
    <section id="videos" className="py-16 md:py-24 bg-gradient-to-b from-warm-white via-cream/40 to-warm-white border-y border-border-subtle relative overflow-hidden scroll-mt-20">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-plum/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-clay/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-maxw mx-auto px-6 md:px-10 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
          <div className="max-w-[620px] reveal">
            <span className="eyebrow flex items-center gap-1.5">
              <Sparkles size={14} className="text-plum" />
              Cosmevo in Motion
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-ink tracking-tight mt-1">
              Cosmevo Products in Action
            </h2>
            <p className="text-text-secondary text-sm sm:text-base mt-2">
              Explore our official Cosmevo product videos. Watch real skincare applications, formula textures, and results in motion.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-text-secondary bg-white px-4 py-2 rounded-full border border-border-subtle shadow-xs">
            <span className="w-2 h-2 rounded-full bg-plum animate-pulse" />
            <span>Cosmevo Video Showcase</span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onZoom={(v) => setSelectedZoomVideo(v)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      <VideoZoomModal
        video={selectedZoomVideo}
        onClose={() => setSelectedZoomVideo(null)}
      />
    </section>
  );
}
