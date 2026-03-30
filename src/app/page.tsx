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
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero Header */}
      <div className="relative border-b border-zinc-800 bg-zinc-900/50 pt-12 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <ShieldCheck className="text-blue-500 w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">L.I.B.</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/dictionary"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mr-4"
              >
                <BookOpen className="w-4 h-4" />
                Dictionary
              </Link>
              {!authLoading && (
                user ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
                      <UserIcon className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-300">{user.email?.split('@')[0]}</span>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Bureau Access
                  </Link>
                )
              )}
            </div>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Language Bureau</h2>
          <p className="text-zinc-400 text-xl max-w-2xl leading-relaxed">
            Welcome back, Detective. Crimes are being committed in every language. 
            Choose a case and use your linguistic skills to uncover the truth.
          </p>
        </div>
      </div>

      {/* Case Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="text-zinc-500 w-5 h-5" />
            Active Case Files
          </h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-medium text-zinc-400">All Languages</span>
            <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-medium text-zinc-400">All Levels</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-zinc-500">Retrieving case files from archives...</p>
          </div>
        ) : cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((caseItem) => (
              <Link 
                key={caseItem.id} 
                href={`/cases/${caseItem.id}`}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all hover:border-blue-500/50 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-600/20">
                      {caseItem.difficulty}
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500 text-xs font-medium uppercase tracking-wider">
                      <Languages className="w-3 h-3" />
                      {caseItem.language_code}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  {caseItem.title}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {caseItem.description}
                </p>
                
                <div className="flex items-center gap-2 text-zinc-500 text-xs mt-auto">
                  <MapPin className="w-3 h-3" />
                  {caseItem.setting}
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
                    <Search className="text-white w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-500">No active cases found. The streets are suspiciously quiet.</p>
          </div>
        )}
      </div>

      {/* Footer / Stats */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-900 mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center md:text-left">
            <div className="text-2xl font-black text-white">0</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Cases Solved</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-2xl font-black text-white">0</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Words Mastered</div>
          </div>
        </div>
        <div className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
          CSL - Bureau of Linguistic Investigation © 2026
        </div>
      </footer>
    </main>
  );
}
