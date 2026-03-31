'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Search, MapPin, Loader2, Languages, ShieldCheck, LogIn, LogOut, User as UserIcon, BookOpen } from 'lucide-react';

interface Case {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  setting: string;
  language_code: string;
}

export default function BureauPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchCases() {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCases(data || []);
      } catch (err) {
        console.error('Error fetching cases:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 bg-mesh-noir scanline relative overflow-hidden">
      {/* Hero Header */}
      <div className="relative border-b border-white/5 bg-zinc-900/40 pt-12 pb-20 px-6 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-pink/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="max-w-5xl mx-auto relative">
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-zinc-900 border border-neon-blue/30 rounded-2xl shadow-lg shadow-neon-blue/5 group-hover:neon-border transition-all duration-500">
                <ShieldCheck className="text-neon-blue w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tightest leading-none bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">L.I.B.</h1>
                <p className="text-[10px] font-bold tracking-widest text-neon-blue uppercase opacity-70">Linguistic Bureau</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/dictionary"
                className="flex items-center gap-2 text-zinc-400 hover:text-neon-yellow transition-colors text-sm font-bold uppercase tracking-widest"
              >
                <BookOpen className="w-4 h-4" />
                Evidence Logs
              </Link>
              {!authLoading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md">
                      <UserIcon className="w-4 h-4 text-neon-blue" />
                      <span className="text-sm font-bold text-zinc-200">{user.email?.split('@')[0]}</span>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="text-zinc-500 hover:text-neon-pink transition-colors p-2"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login"
                    className="flex items-center gap-2 bg-white text-zinc-950 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:scale-105 hover:bg-neon-blue hover:text-zinc-950 active:scale-95 shadow-xl shadow-white/5"
                  >
                    <LogIn className="w-4 h-4" />
                    Access Files
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="max-w-3xl">
            <h2 className="text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9] lg:text-7xl">
              Uncover the <span className="text-neon-blue">Truth</span><br />
              In Every <span className="italic text-zinc-400">Word</span>.
            </h2>
            <p className="text-zinc-400 text-xl max-w-2xl leading-relaxed font-medium">
              Detective, the city is speaking. Decipher the clues, analyze the testimony, 
              and bridge the linguistic divide to solve the most complex cases in the archives.
            </p>
          </div>
        </div>
      </div>

      {/* Case Grid */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-neon-blue rounded-full" />
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              Case Catalog
              <span className="text-xs bg-zinc-900 border border-white/10 px-3 py-1 rounded-full text-zinc-500 font-bold tracking-widest">
                {cases.length} OPEN
              </span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-500 hover:text-white hover:border-white/10 transition-all">All Languages</button>
            <button className="px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs font-bold text-zinc-500 hover:text-white hover:border-white/10 transition-all">All Levels</button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/20 rounded-[40px] border border-white/5 backdrop-blur-xl">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-neon-blue animate-spin mb-6 opacity-50" />
              <div className="absolute inset-0 blur-xl bg-neon-blue/20 animate-pulse" />
            </div>
            <p className="text-zinc-500 font-bold tracking-widest uppercase text-sm">Synchronizing Bureau Database...</p>
          </div>
        ) : cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cases.map((caseItem, idx) => (
              <Link 
                key={caseItem.id} 
                href={`/cases/${caseItem.id}`}
                className="group relative bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 transition-all duration-500 hover:border-neon-blue/50 hover:bg-zinc-800/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,242,255,0.1)] overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl group-hover:bg-neon-blue/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      caseItem.difficulty === 'Easy' ? 'bg-case-green/10 text-case-green border-case-green/20' :
                      caseItem.difficulty === 'Medium' ? 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20' :
                      'bg-case-red/10 text-case-red border-case-red/20'
                    }`}>
                      {caseItem.difficulty}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-black uppercase tracking-widest group-hover:text-neon-blue transition-colors">
                      <Languages className="w-3.5 h-3.5" />
                      {caseItem.language_code}
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-zinc-700 tracking-[0.2em] uppercase">
                    FILE #00{idx + 1}
                  </div>
                </div>
                
                <h3 className="text-3xl font-black mb-4 group-hover:text-white transition-colors leading-tight">
                  {caseItem.title}
                </h3>
                <p className="text-zinc-400 text-base line-clamp-2 mb-8 leading-relaxed font-medium">
                  {caseItem.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-neon-blue" />
                    {caseItem.setting}
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center transition-all group-hover:bg-neon-blue group-hover:border-neon-blue group-hover:scale-110">
                    <Search className="text-zinc-500 w-5 h-5 group-hover:text-zinc-950 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[40px] border border-white/5">
            <div className="p-6 bg-zinc-900 w-fit mx-auto rounded-3xl mb-6 border border-white/5">
              <ShieldCheck className="w-12 h-12 text-zinc-800" />
            </div>
            <h3 className="text-xl font-bold text-zinc-300 mb-2">No active leads.</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">The streets are suspiciously quiet. Check back later for new assignments.</p>
          </div>
        )}
      </div>

      {/* Footer / Stats */}
      <footer className="max-w-5xl mx-auto px-6 py-20 border-t border-white/5 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <div className="text-4xl font-black text-white mb-1">0</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-neon-blue font-black opacity-60">Cases Solved</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <div className="text-4xl font-black text-white mb-1">0</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-neon-pink font-black opacity-60">Words Mastered</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white mb-2 leading-none">L.I.B.</div>
            <div className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-black">
              Bureau of Linguistic Investigation © 2026
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
