'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    });
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 bg-mesh-noir scanline relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex p-4 bg-zinc-900 border border-neon-blue/30 rounded-[24px] mb-6 shadow-2xl shadow-neon-blue/10 group hover:neon-border transition-all duration-500 animate-float">
            <ShieldCheck className="text-neon-blue w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tightest text-white leading-none mb-3">Bureau Access</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em] opacity-70">L.I.B. Identification Protocol</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in zoom-in duration-500 delay-150">
          <form className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Badge Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-950 transition-all placeholder:text-zinc-800 font-medium"
                  placeholder="agent_doe@lib.gov"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5 group-focus-within:text-neon-pink transition-colors" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-neon-pink/50 focus:bg-zinc-950 transition-all placeholder:text-zinc-800 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`p-5 rounded-2xl text-xs font-black uppercase tracking-widest leading-relaxed animate-in fade-in zoom-in duration-300 ${
                message.type === 'success' ? 'bg-case-green/10 text-case-green border border-case-green/20' : 'bg-case-red/10 text-case-red border border-case-red/20'
              }`}>
                <div className="flex gap-3">
                  <div className={`w-1 h-auto rounded-full ${message.type === 'success' ? 'bg-case-green' : 'bg-case-red'}`} />
                  {message.text}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 pt-2">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="bg-white text-zinc-950 font-black uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-3 hover:bg-neon-blue hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Authorize Access
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="bg-zinc-950 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all"
              >
                New Agent Entry
              </button>
            </div>
          </form>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-12 w-full text-zinc-600 hover:text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 group"
        >
          <div className="w-6 h-px bg-zinc-800 group-hover:bg-neon-blue transition-all" />
          Continue as Anonymous Guest
          <div className="w-6 h-px bg-zinc-800 group-hover:bg-neon-blue transition-all" />
        </button>
      </div>
    </main>
  );
}
