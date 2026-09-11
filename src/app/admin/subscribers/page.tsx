'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Subscriber } from '@/lib/types';
import { 
  Mail, 
  Trash2, 
  Search, 
  RefreshCw, 
  Download, 
  Check, 
  Copy, 
  AlertCircle, 
  UserCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers(data.subscribers || []);
        setTableMissing(Boolean(data.tableMissing));
      } else {
        console.warn('Failed to load subscribers:', data.error);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from subscribers?`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/subscribers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || 'Failed to delete subscriber.');
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      alert('Error deleting subscriber. Please try again.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const headers = ['ID', 'Email', 'Date Subscribed', 'Status'];
    const rows = subscribers.map((s) => [
      `"${s.id}"`,
      `"${s.email}"`,
      `"${s.created_at ? new Date(s.created_at).toLocaleString('en-PK') : ''}"`,
      `"${s.is_active !== false ? 'Active' : 'Inactive'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cosmevo_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;
    const q = searchQuery.toLowerCase().trim();
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2.5">
            <Mail className="text-plum" size={26} />
            Newsletter Subscribers
          </h1>
          <p className="text-ink/60 mt-1 text-sm">
            View and manage customer emails collected from the website newsletter subscription form.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchSubscribers}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-border-subtle bg-white text-ink hover:text-plum hover:border-plum transition-colors shadow-xs"
            title="Refresh subscriber list"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="btn btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Total Subscribers</span>
            <div className="w-8 h-8 rounded-full bg-plum/10 text-plum flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-ink mt-2">{subscribers.length}</p>
          <span className="text-[11.5px] text-text-secondary mt-1 block">From website footer form</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Active Status</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">
            {subscribers.filter((s) => s.is_active !== false).length}
          </p>
          <span className="text-[11.5px] text-text-secondary mt-1 block">Opted-in for store offers</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Latest Sign-up</span>
            <div className="w-8 h-8 rounded-full bg-cream text-plum flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <p className="text-base font-bold text-ink mt-3 truncate">
            {subscribers.length > 0 && subscribers[0].created_at
              ? new Date(subscribers[0].created_at).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'No signups yet'}
          </p>
          <span className="text-[11.5px] text-text-secondary mt-1 block">Most recent subscription</span>
        </div>
      </div>

      {/* Notice if Supabase table is not yet created */}
      {tableMissing && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm text-amber-950">Supabase Table Missing</p>
            <p className="mt-0.5">
              The <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">subscribers</code> table has not been created in your Supabase database yet. Run the provided script <code className="font-mono font-bold">supabase_subscribers_setup.sql</code> in your Supabase SQL Editor to enable persistent database storage.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl border border-border-subtle p-4 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subscribers by email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-plum bg-warm-white/40"
          />
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-text-secondary hover:text-plum font-semibold px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-white/70 text-ink/70 border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date Subscribed</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-plum" />
                      <p className="text-sm font-medium">Loading subscribers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-cream text-plum flex items-center justify-center mb-3">
                        <Mail size={24} />
                      </div>
                      <p className="font-bold text-ink text-base">No subscribers found</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {searchQuery
                          ? `No emails match "${searchQuery}".`
                          : 'When visitors enter their email in the website footer newsletter, they will appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber, index) => (
                  <tr key={subscriber.id} className="hover:bg-warm-white/40 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-plum/10 text-plum flex items-center justify-center shrink-0">
                          <Mail size={13} />
                        </div>
                        <span className="font-bold text-ink text-sm">{subscriber.email}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(subscriber.email)}
                          className="p-1 text-text-secondary hover:text-plum rounded transition-colors"
                          title="Copy email address"
                        >
                          {copiedEmail === subscriber.email ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-text-secondary font-medium">
                      {subscriber.created_at ? (
                        new Date(subscriber.created_at).toLocaleString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Subscribed
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={isDeletingId === subscriber.id}
                        onClick={() => handleDelete(subscriber.id, subscriber.email)}
                        className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete subscriber"
                      >
                        <Trash2 size={16} />
                      </button>
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
