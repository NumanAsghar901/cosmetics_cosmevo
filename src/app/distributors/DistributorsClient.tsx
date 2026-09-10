'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Distributor } from '@/lib/types';
import { 
  Building2, MapPin, Phone, MessageCircle, Mail, 
  Search, ShieldCheck, Sparkles, Navigation, ArrowRight,
  Store, CheckCircle2, User, PhoneCall, ExternalLink
} from 'lucide-react';
import { WA_NUMBER, WA_DISPLAY, SUPPORT_EMAIL } from '@/lib/constants';

interface DistributorsClientProps {
  initialDistributors: Distributor[];
}

export default function DistributorsClient({ initialDistributors }: DistributorsClientProps) {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique cities list
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    initialDistributors.forEach((d) => {
      if (d.city && d.city.trim()) {
        citiesSet.add(d.city.trim());
      }
    });
    return Array.from(citiesSet).sort();
  }, [initialDistributors]);

  // Filter distributors by selected city and search query
  const filteredDistributors = useMemo(() => {
    return initialDistributors.filter((dist) => {
      const matchCity = selectedCity === 'all' || dist.city.toLowerCase() === selectedCity.toLowerCase();
      
      if (!searchQuery.trim()) return matchCity;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        dist.name.toLowerCase().includes(q) ||
        dist.city.toLowerCase().includes(q) ||
        (dist.contact_person && dist.contact_person.toLowerCase().includes(q)) ||
        dist.address.toLowerCase().includes(q) ||
        dist.phone.toLowerCase().includes(q) ||
        (dist.area_covered && dist.area_covered.toLowerCase().includes(q));

      return matchCity && matchSearch;
    });
  }, [initialDistributors, selectedCity, searchQuery]);

  const cleanPhone = (phone: string) => phone.replace(/[^0-9]/g, '');

  const formatWhatsAppUrl = (whatsappOrPhone: string, distName: string, city: string) => {
    let num = whatsappOrPhone.replace(/[^0-9]/g, '');
    if (num.startsWith('0')) {
      num = '92' + num.slice(1);
    } else if (!num.startsWith('92') && num.length === 10) {
      num = '92' + num;
    }
    const message = encodeURIComponent(
      `Hello ${distName} (${city}), I found your contact details on the official Cosmevo website (cosmevo.pk). I would like to inquire about product availability and orders.`
    );
    return `https://wa.me/${num}?text=${message}`;
  };

  const getGoogleMapsUrl = (address: string, city: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, Pakistan`)}`;
  };

  return (
    <div className="min-h-screen bg-warm-white text-ink">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden bg-gradient-to-b from-warm-white via-cream/30 to-warm-white border-b border-border-subtle">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-plum/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-clay/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-maxw mx-auto px-6 md:px-10 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-plum/10 text-plum text-xs font-extrabold uppercase tracking-wider mb-5 shadow-xs">
            <Building2 size={14} />
            <span>Authorized Distribution Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find an Official <span className="text-plum">Cosmevo</span> Distributor
          </h1>

          <p className="mt-4 sm:mt-6 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Connect directly with our certified regional distributors across Pakistan for authentic retail purchases, clinic wholesale supply, and fast regional fulfillment.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-10 text-left">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle shadow-xs">
              <div className="text-plum font-extrabold text-2xl sm:text-3xl">100%</div>
              <div className="text-ink font-bold text-xs sm:text-sm mt-0.5">Authentic Formulations</div>
              <div className="text-text-secondary text-[11px] sm:text-xs">Direct from lab to shelf</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle shadow-xs">
              <div className="text-ink font-extrabold text-2xl sm:text-3xl">{availableCities.length}+</div>
              <div className="text-ink font-bold text-xs sm:text-sm mt-0.5">Major Cities Covered</div>
              <div className="text-text-secondary text-[11px] sm:text-xs">Nationwide distribution</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle shadow-xs">
              <div className="text-plum font-extrabold text-2xl sm:text-3xl">Fast</div>
              <div className="text-ink font-bold text-xs sm:text-sm mt-0.5">Regional Stock</div>
              <div className="text-text-secondary text-[11px] sm:text-xs">Direct wholesale supply</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-border-subtle shadow-xs">
              <div className="text-ink font-extrabold text-2xl sm:text-3xl">24/7</div>
              <div className="text-ink font-bold text-xs sm:text-sm mt-0.5">Trade Inquiries</div>
              <div className="text-text-secondary text-[11px] sm:text-xs">Direct WhatsApp support</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="py-8 bg-white border-b border-border-subtle sticky top-[68px] z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-maxw mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCity('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCity === 'all'
                  ? 'bg-plum text-white shadow-xs'
                  : 'bg-warm-white text-ink/70 hover:bg-cream hover:text-ink border border-border-subtle'
              }`}
            >
              All Cities ({initialDistributors.length})
            </button>

            {availableCities.map((city) => {
              const count = initialDistributors.filter((d) => d.city.toLowerCase() === city.toLowerCase()).length;
              const isSelected = selectedCity.toLowerCase() === city.toLowerCase();

              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-plum text-white shadow-xs'
                      : 'bg-warm-white text-ink/70 hover:bg-cream hover:text-ink border border-border-subtle'
                  }`}
                >
                  {city} <span className={`text-xs ml-1 ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search distributor, area, or phone..."
              className="w-full pl-9 pr-4 py-2.5 bg-warm-white focus:bg-white border border-border-subtle rounded-xl text-sm text-ink placeholder:text-text-secondary/60 focus:outline-none focus:border-plum transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-ink font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. DISTRIBUTORS GRID */}
      <section className="py-12 md:py-16">
        <div className="max-w-maxw mx-auto px-6 md:px-10">
          {/* Header row with count */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                {selectedCity === 'all' ? 'All Certified Regional Distributors' : `Distributors in ${selectedCity}`}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Showing {filteredDistributors.length} {filteredDistributors.length === 1 ? 'location' : 'locations'}
              </p>
            </div>

            {selectedCity !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCity('all')}
                className="text-xs font-bold text-plum hover:underline"
              >
                View all cities →
              </button>
            )}
          </div>

          {/* Empty State */}
          {filteredDistributors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border-subtle p-12 text-center max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-plum/10 text-plum flex items-center justify-center mx-auto mb-4">
                <Store size={26} />
              </div>
              <h3 className="text-lg font-bold text-ink mb-1">No distributors match your search</h3>
              <p className="text-xs text-text-secondary mb-6">
                Try selecting &ldquo;All Cities&rdquo; or clearing your search term to see all available distribution partners.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCity('all');
                  setSearchQuery('');
                }}
                className="btn btn-primary text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDistributors.map((dist) => {
                const whatsappUrl = formatWhatsAppUrl(dist.whatsapp || dist.phone, dist.name, dist.city);
                const mapsUrl = getGoogleMapsUrl(dist.address, dist.city);

                return (
                  <div
                    key={dist.id}
                    className="bg-white rounded-3xl border border-border-subtle p-6 hover:shadow-xl transition-all duration-300 hover:border-plum/30 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Top: City & Province + Verified Tag */}
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-plum/10 text-plum tracking-wide uppercase">
                          <MapPin size={13} className="text-plum" />
                          {dist.city}{dist.province ? `, ${dist.province}` : ''}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Certified
                        </span>
                      </div>

                      {/* Distributor Name */}
                      <h3 className="text-lg sm:text-xl font-black text-ink group-hover:text-plum transition-colors leading-snug">
                        {dist.name}
                      </h3>

                      {/* Contact Person */}
                      {dist.contact_person && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary mt-2">
                          <User size={14} className="text-plum shrink-0" />
                          <span>Contact: <strong className="text-ink">{dist.contact_person}</strong></span>
                        </div>
                      )}

                      {/* Address */}
                      <div className="flex items-start gap-2 text-xs text-text-secondary mt-3 leading-relaxed">
                        <Navigation size={14} className="text-text-secondary/70 shrink-0 mt-0.5" />
                        <span>{dist.address}</span>
                      </div>

                      {/* Area Covered Tag */}
                      {dist.area_covered && (
                        <div className="mt-3.5 pt-3 border-t border-border-subtle/60 text-[11.5px] text-text-secondary">
                          <span className="font-bold text-ink/70">Coverage: </span>
                          <span>{dist.area_covered}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-6 pt-4 border-t border-border-subtle space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Call Button */}
                        <a
                          href={`tel:${cleanPhone(dist.phone)}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warm-white hover:bg-cream text-ink text-xs font-bold border border-border-subtle transition-all active:scale-95"
                          title={`Call ${dist.phone}`}
                        >
                          <PhoneCall size={14} className="text-plum" />
                          <span>Call</span>
                        </a>

                        {/* WhatsApp Button */}
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* Map Directions Link */}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-plum hover:bg-warm-white transition-colors"
                      >
                        <ExternalLink size={12} />
                        <span>View Location on Google Maps</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. BECOME A DISTRIBUTOR B2B BANNER */}
      <section className="py-16 md:py-20 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-clay/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-maxw mx-auto px-6 md:px-10 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-cream text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
            <Sparkles size={13} className="text-plum" />
            <span>Partnership &amp; Wholesale</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Become an Authorized Cosmevo Distributor
          </h2>

          <p className="mt-4 text-white/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Are you a licensed pharmacy, aesthetic dermatology clinic, beauty salon, or cosmetic retailer? Partner with Cosmevo to stock our clean, medical-grade skincare formulas with high commercial margins and direct trade support.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello Cosmevo Team, I would like to apply to become an authorized distributor in my city.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-plum hover:bg-plum/90 text-white text-sm font-bold shadow-lg transition-all active:scale-95"
            >
              <MessageCircle size={16} />
              <span>Inquire via WhatsApp ({WA_DISPLAY})</span>
            </a>

            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Distributor Inquiry - Cosmevo Pakistan')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all"
            >
              <Mail size={16} />
              <span>Email: {SUPPORT_EMAIL}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
