'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error('Supabase is not configured');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Check if the user is an admin by validating their email with the server
      // But the redirect is handled by middleware. Here we just redirect to /admin
      router.push('/admin');
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border-subtle w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center text-plum">
            <Lock size={24} />
          </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-ink text-center mb-2">
          Admin Access
        </h1>
        <p className="text-ink/60 text-center mb-8 text-sm">
          Please sign in to access the control panel.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum transition-all"
              placeholder="admin@cosmevo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border-subtle focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ink text-white font-semibold py-2.5 rounded-lg hover:bg-plum transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-ink/40">
          Secure Access - Cosmevo © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
