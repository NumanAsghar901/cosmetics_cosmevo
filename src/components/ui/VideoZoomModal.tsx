'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShowcaseVideo } from '@/lib/types';
import { 
  X, Play, Pause, Volume2, VolumeX, ZoomIn, ZoomOut, 
  RotateCcw, ShoppingBag, ArrowRight, Sparkles 
} from 'lucide-react';

interface VideoZoomModalProps {
  video: ShowcaseVideo | null;
  onClose: () => void;
}

export default function VideoZoomModal({ video, onClose }: VideoZoomModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [zoomScale, setZoomScale] = useState(1); // 1 = fit, 1.5, 2
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset states when modal opens or video changes
  useEffect(() => {
    if (video) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      setIsPlaying(true);
      // Keyboard handler for Esc, Space, M
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          togglePlay();
        } else if (e.key === 'm' || e.key === 'M') {
          toggleMute();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [video]);

  if (!video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.volume === 0) {
      videoRef.current.volume = volume;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleZoom = (level: number) => {
    setZoomScale(level);
    if (level === 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Pan dragging when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const limit = (zoomScale - 1) * 200;
    setPanOffset({
      x: Math.max(-limit, Math.min(limit, dragStartRef.current.initialPanX + dx)),
      y: Math.max(-limit, Math.min(limit, dragStartRef.current.initialPanY + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Lightbox Container */}
      <div 
        className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-ink/95 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-plum/20 border border-plum/40 flex items-center justify-center text-plum text-xs font-bold">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-white/60 text-xs line-clamp-1 max-w-md mt-0.5">
                  {video.description}
                </p>
              )}
            </div>
          </div>

          {/* Zoom Level Controller & Close Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
              <span className="text-[11px] text-white/60 font-semibold px-2">Zoom:</span>
              <button
                type="button"
                onClick={() => handleZoom(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  zoomScale === 1 ? 'bg-plum text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => handleZoom(1.5)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  zoomScale === 1.5 ? 'bg-plum text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                1.5x
              </button>
              <button
                type="button"
                onClick={() => handleZoom(2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  zoomScale === 2 ? 'bg-plum text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                2x
              </button>
              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={() => handleZoom(1)}
                  className="p-1 text-white/70 hover:text-white"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-2"
              title="Close (Esc)"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Video Canvas Area */}
        <div 
          ref={containerRef}
          className={`flex-1 relative overflow-hidden flex items-center justify-center cursor-pointer ${
            zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
          onClick={togglePlay}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url}
            className="max-w-full max-h-full object-contain rounded-xl transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
            }}
            playsInline
            loop
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
          />

          {/* Central Play/Pause Indicator on tap */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/90 text-plum flex items-center justify-center shadow-2xl animate-scale-up">
                <Play size={28} className="ml-1" />
              </div>
            </div>
          )}

          {/* Pan Prompt when Zoomed */}
          {zoomScale > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white/80 border border-white/15 pointer-events-none">
              🔍 Drag to pan & inspect formula texture
            </div>
          )}
        </div>

        {/* Bottom Floating Tagged Product & Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-gradient-to-t from-black/90 to-black/60 flex flex-col gap-3 z-20">
          {/* Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] font-mono text-white/70 w-9 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-plum cursor-pointer"
            />
            <span className="text-[11px] font-mono text-white/70 w-9">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls & Tagged Product Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              {/* Volume / Mute */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-full appearance-none accent-plum cursor-pointer"
                />
              </div>

              {/* Mobile Zoom Selector */}
              <div className="flex sm:hidden items-center gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleZoom(zoomScale === 1 ? 1.5 : zoomScale === 1.5 ? 2 : 1)}
                  className="px-2 py-1 text-xs font-bold text-white flex items-center gap-1"
                >
                  <ZoomIn size={14} />
                  {zoomScale}x
                </button>
              </div>
            </div>

            {/* Tagged Product Pill / Direct Link */}
            {video.product_slug ? (
              <Link
                href={`/product/${video.product_slug}`}
                onClick={onClose}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-plum hover:bg-plum-light text-white font-semibold text-xs shadow-soft transition-all transform hover:scale-[1.02] ml-auto"
              >
                <ShoppingBag size={15} />
                <span className="truncate max-w-[170px] sm:max-w-[240px]">
                  Shop {video.product_name || 'Product'}
                </span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <div className="text-[11px] text-white/50 ml-auto hidden sm:block">
                Cosmevo Cosmeceuticals
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
